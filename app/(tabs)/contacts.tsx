import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmergencyContact, useContacts } from "@/contexts/ContactsContext";
import { useColors } from "@/hooks/useColors";

const RELATIONS = ["Family", "Friend", "Colleague", "Partner", "Other"];

export default function ContactsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { contacts, addContact, removeContact } = useContacts();
  const [modalVisible, setModalVisible] = useState(false);
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Family");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const openAdd = () => {
    setEditContact(null);
    setName("");
    setPhone("");
    setRelation("Family");
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing Info", "Please enter a name and phone number.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addContact({ name: name.trim(), phone: phone.trim(), relation });
    setModalVisible(false);
  };

  const handleDelete = (id: string, contactName: string) => {
    Alert.alert(
      "Remove Contact",
      `Remove ${contactName} from emergency contacts?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            removeContact(id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Contacts
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {contacts.length} emergency contact{contacts.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAdd}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={56}
            color={colors.mutedForeground}
          />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No contacts yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Add emergency contacts who will be notified when SOS is triggered
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={openAdd}
            activeOpacity={0.8}
          >
            <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>
              Add First Contact
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: Platform.OS === "web" ? 120 : 120,
          }}
          scrollEnabled={contacts.length > 0}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ContactRow
              contact={item}
              colors={colors}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: 10 }} />
          )}
        />
      )}

      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View
            style={[styles.modal, { backgroundColor: colors.background }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {editContact ? "Edit Contact" : "New Contact"}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={[styles.modalSave, { color: colors.primary }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View
                style={[
                  styles.inputGroup,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
                  NAME
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textInput, { color: colors.foreground }]}
                  autoFocus
                />
              </View>

              <View
                style={[
                  styles.inputGroup,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
                  PHONE
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textInput, { color: colors.foreground }]}
                  keyboardType="phone-pad"
                />
              </View>

              <Text style={[styles.relationLabel, { color: colors.mutedForeground }]}>
                RELATION
              </Text>
              <View style={styles.relations}>
                {RELATIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.relationChip,
                      {
                        backgroundColor:
                          relation === r
                            ? colors.primary
                            : colors.card,
                        borderColor:
                          relation === r ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setRelation(r)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.relationText,
                        {
                          color:
                            relation === r
                              ? colors.primaryForeground
                              : colors.foreground,
                        },
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function ContactRow({
  contact,
  colors,
  onDelete,
}: {
  contact: EmergencyContact;
  colors: ReturnType<typeof useColors>;
  onDelete: () => void;
}) {
  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.contactCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: "rgba(255,30,30,0.15)" }]}>
        <Text style={[styles.initials, { color: colors.primary }]}>{initials}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.foreground }]}>
          {contact.name}
        </Text>
        <Text style={[styles.contactPhone, { color: colors.mutedForeground }]}>
          {contact.phone}
        </Text>
        <View style={[styles.relationBadge, { backgroundColor: "rgba(255,30,30,0.1)" }]}>
          <Text style={[styles.relationBadgeText, { color: colors.primary }]}>
            {contact.relation}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  contactInfo: { flex: 1, gap: 4 },
  contactName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  contactPhone: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  relationBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  relationBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  deleteBtn: { padding: 4 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  modalSave: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  modalBody: { padding: 20, gap: 16 },
  inputGroup: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  textInput: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  relationLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  relations: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  relationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  relationText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
