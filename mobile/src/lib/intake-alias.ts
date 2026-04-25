// Generate memorable email aliases like "jumping-hippo" or "brave-falcon"
// Mirrors web/src/lib/intake-alias.ts

const adjectives = [
  "bold", "brave", "bright", "busy", "calm", "cool", "crisp", "eager",
  "early", "fair", "fast", "fierce", "fresh", "grand", "happy", "keen",
  "kind", "lively", "lucky", "mighty", "neat", "noble", "proud", "quick",
  "rapid", "sharp", "slick", "smart", "snappy", "solid", "steady", "stout",
  "strong", "super", "swift", "tough", "vivid", "warm", "wild", "wise",
  "witty", "zesty", "agile", "ample", "chief", "clean", "clear", "daring",
  "driven", "epic", "fleet", "golden", "gusty", "handy", "hardy", "jolly",
  "laser", "loyal", "nifty", "plucky", "prime", "rustic", "savvy", "spry",
  "stellar", "sunny", "tidy", "trusty", "ultra", "zippy",
];

const nouns = [
  "badger", "bear", "bison", "cobra", "crane", "eagle", "falcon", "fox",
  "gecko", "hawk", "heron", "hippo", "horse", "husky", "hyena", "ibis",
  "iguana", "impala", "jackal", "jaguar", "koala", "lemur", "lion", "llama",
  "lynx", "mako", "mantis", "marlin", "moose", "narwhal", "newt", "orca",
  "osprey", "otter", "owl", "panda", "parrot", "pelican", "pike", "puma",
  "python", "quail", "raven", "rhino", "salmon", "seal", "shark", "stag",
  "stoat", "stork", "tiger", "toucan", "trout", "viper", "walrus", "wasp",
  "weasel", "whale", "wolf", "wombat", "wren", "yak", "zebra", "bison",
  "bobcat", "condor", "coyote", "donkey", "ferret", "finch", "gopher",
  "grouse", "hornet", "kiwi", "magpie", "marten", "merlin", "osprey",
  "panther", "pigeon", "puffin", "raptor", "robin", "squid",
];

export function generateIntakeAlias(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${noun}`;
}
