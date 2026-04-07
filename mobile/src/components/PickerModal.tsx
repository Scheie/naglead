import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { colors } from "../lib/theme";

interface PickerOption {
  label: string;
  value: string;
}

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function PickerModal({ visible, title, options, selected, onSelect, onClose }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, item.value === selected && styles.optionSelected]}
                onPress={() => { onSelect(item.value); onClose(); }}
              >
                <Text style={[styles.optionText, item.value === selected && styles.optionTextSelected]}>
                  {item.label}
                </Text>
                {item.value === selected && (
                  <Text style={styles.check}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.zinc[900],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.zinc[700],
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Teko-Bold",
    fontSize: 24,
    color: colors.white,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc[800],
    borderRadius: 6,
  },
  optionSelected: {
    backgroundColor: "rgba(255, 69, 0, 0.1)",
  },
  optionText: {
    color: colors.zinc[300],
    fontFamily: "WorkSans-Medium",
    fontSize: 15,
  },
  optionTextSelected: {
    color: colors.orange,
  },
  check: {
    color: colors.orange,
    fontFamily: "WorkSans-Bold",
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 8,
    marginHorizontal: 20,
    backgroundColor: colors.zinc[800],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontFamily: "Teko-Bold",
    fontSize: 18,
    color: colors.zinc[400],
  },
});
