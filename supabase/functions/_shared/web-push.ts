// Web Push sending using raw Web Crypto API (no external libraries)
// Implements RFC 8291 (Message Encryption for Web Push) + VAPID (RFC 8292)

interface WebPushSubscription {
  endpoint: string;
  p256dh: string; // base64url
  auth: string;   // base64url
}

interface VapidConfig {
  subject: string;   // mailto:email
  publicKey: string;  // base64url uncompressed P-256 public key (65 bytes)
  privateKey: string; // base64url raw P-256 private key (32 bytes)
}

interface SendResult {
  ok: boolean;
  expired: boolean;
  status?: number;
}

// --- Base64url helpers ---

function base64urlToUint8Array(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (b64.length % 4)) % 4;
  const padded = b64 + "=".repeat(pad);
  const raw = atob(padded);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function uint8ArrayToBase64url(arr: Uint8Array): string {
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// --- VAPID JWT ---

async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBytes: Uint8Array
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    wrapP256PrivateKey(privateKeyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      encoder.encode(unsignedToken)
    )
  );

  // Convert DER signature to raw r||s (64 bytes)
  const rawSig = derToRaw(signature);
  const sigB64 = uint8ArrayToBase64url(rawSig);

  return `${unsignedToken}.${sigB64}`;
}

// Wrap a raw 32-byte P-256 private key in PKCS#8 DER format
function wrapP256PrivateKey(rawKey: Uint8Array): ArrayBuffer {
  // PKCS#8 header for P-256 EC key
  const header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20,
  ]);
  // Trailing bytes (public key will be omitted)
  const trailer = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00,
  ]);
  // We need a dummy 65-byte public key, but we can derive it
  // For PKCS#8 import, we can use a shorter form without the public key
  // Actually, Web Crypto requires the full PKCS8 structure
  // Let's use the simpler SEC1 wrapped in PKCS8
  const sec1 = concatUint8Arrays(
    new Uint8Array([0x30, 0x41, 0x02, 0x01, 0x01, 0x04, 0x20]),
    rawKey,
    new Uint8Array([0xa0, 0x0a, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07])
  );
  const pkcs8 = concatUint8Arrays(
    new Uint8Array([
      0x30, sec1.length + 11 + 2,
      0x02, 0x01, 0x00,
      0x30, 0x13,
      0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01,
      0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07,
      0x04, sec1.length + 2,
    ]),
    sec1
  );
  return pkcs8.buffer;
}

// Convert DER ECDSA signature to raw 64-byte r||s
function derToRaw(der: Uint8Array): Uint8Array {
  // DER: 0x30 len 0x02 rLen r 0x02 sLen s
  let offset = 2; // skip 0x30 and length
  const rLen = der[offset + 1];
  const r = der.slice(offset + 2, offset + 2 + rLen);
  offset += 2 + rLen;
  const sLen = der[offset + 1];
  const s = der.slice(offset + 2, offset + 2 + sLen);

  // Pad/trim to 32 bytes each
  const raw = new Uint8Array(64);
  raw.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
  raw.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  return raw;
}

// --- RFC 8291 Payload Encryption ---

async function encryptPayload(
  plaintext: Uint8Array,
  clientPublicKeyBytes: Uint8Array, // 65 bytes uncompressed
  authSecretBytes: Uint8Array       // 16 bytes
): Promise<{ body: Uint8Array; localPublicKey: Uint8Array; salt: Uint8Array }> {
  // Generate ephemeral ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const localPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  // Import client public key
  const clientPublicKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientPublicKey },
      localKeyPair.privateKey,
      256
    )
  );

  // Generate random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const encoder = new TextEncoder();

  // HKDF extract: PRK from auth secret + shared secret
  const ikmKey = await crypto.subtle.importKey(
    "raw", sharedSecret, { name: "HKDF" }, false, ["deriveBits"]
  );

  // info for PRK derivation
  const authInfo = concatUint8Arrays(
    encoder.encode("WebPush: info\0"),
    clientPublicKeyBytes,
    localPublicKeyRaw
  );

  // Use HKDF to derive IKM
  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: authSecretBytes, info: authInfo },
      ikmKey,
      256
    )
  );

  // Derive content encryption key (CEK) - 16 bytes
  const ikmKeyForCEK = await crypto.subtle.importKey(
    "raw", ikm, { name: "HKDF" }, false, ["deriveBits"]
  );

  const cekBytes = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt, info: encoder.encode("Content-Encoding: aes128gcm\0") },
      ikmKeyForCEK,
      128
    )
  );

  // Derive nonce - 12 bytes
  const nonceBytes = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt, info: encoder.encode("Content-Encoding: nonce\0") },
      ikmKeyForCEK,
      96
    )
  );

  // Pad plaintext with delimiter (0x02 for final record)
  const padded = concatUint8Arrays(plaintext, new Uint8Array([2]));

  // AES-128-GCM encrypt
  const cek = await crypto.subtle.importKey(
    "raw", cekBytes, { name: "AES-GCM" }, false, ["encrypt"]
  );

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonceBytes },
      cek,
      padded
    )
  );

  // aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, plaintext.length + 1 + 16 + 86); // record size
  const header = concatUint8Arrays(
    salt,
    rs,
    new Uint8Array([65]), // keyid length
    localPublicKeyRaw,
  );

  const body = concatUint8Arrays(header, encrypted);

  return { body, localPublicKey: localPublicKeyRaw, salt };
}

// --- Main send function ---

export async function sendWebPush(
  subscription: WebPushSubscription,
  payload: { title: string; body: string; data?: Record<string, unknown> },
  vapid: VapidConfig
): Promise<SendResult> {
  try {
    const endpoint = new URL(subscription.endpoint);
    const audience = `${endpoint.protocol}//${endpoint.host}`;

    const jwt = await createVapidJwt(audience, vapid.subject, base64urlToUint8Array(vapid.privateKey));

    const plaintextBytes = new TextEncoder().encode(JSON.stringify(payload));
    const clientPublicKey = base64urlToUint8Array(subscription.p256dh);
    const authSecret = base64urlToUint8Array(subscription.auth);

    const { body } = await encryptPayload(plaintextBytes, clientPublicKey, authSecret);

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        Authorization: `vapid t=${jwt}, k=${vapid.publicKey}`,
        TTL: "86400",
        Urgency: "high",
      },
      body,
    });

    if (response.status === 404 || response.status === 410) {
      return { ok: false, expired: true, status: response.status };
    }

    return { ok: response.ok, expired: false, status: response.status };
  } catch (err) {
    console.error("Web Push send error:", err);
    return { ok: false, expired: false };
  }
}
