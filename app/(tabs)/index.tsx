import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SOSButton } from "@/components/SOSButton";
import { useContacts } from "@/contexts/ContactsContext";
import { useSOS } from "@/contexts/SOSContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sosActive, settings } = useSOS();
  const { contacts } = useContacts();
  const router = useRouter();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topPadding + 16,
            paddingBottom: Platform.OS === "web" ? 120 : 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.appName, { color: colors.primary }]}>
              EchoSafe
            </Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
              Your personal safety shield
            </Text>
          </View>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: sosActive ? colors.primary : "#22C55E",
                shadowColor: sosActive ? colors.primary : "#22C55E",
              },
            ]}
          />
        </View>

        {/* SOS Button */}
        <View style={styles.sosContainer}>
          <SOSButton />
          {sosActive && (
            <Text style={[styles.alertText, { color: colors.primary }]}>
              ALERT SENDING...
            </Text>
          )}
        </View>

        {/* Status Cards */}
        <View style={styles.cardsRow}>
          <StatusCard
            icon={
              <MaterialCommunityIcons
                name="shield-account"
                size={22}
                color={colors.primary}
              />
            }
            label="Contacts"
            value={contacts.length.toString()}
            colors={colors}
            onPress={() => router.push("/(tabs)/contacts")}
          />
          <StatusCard
            icon={
              <MaterialCommunityIcons
                name={settings.shakeEnabled ? "vibrate" : "vibrate-off"}
                size={22}
                color={settings.shakeEnabled ? colors.primary : colors.mutedForeground}
              />
            }
            label="Shake"
            value={settings.shakeEnabled ? "ON" : "OFF"}
            colors={colors}
            onPress={() => router.push("/(tabs)/settings")}
          />
          <StatusCard
            icon={
              <Ionicons name="location" size={22} color={colors.primary} />
            }
            label="GPS"
            value="Ready"
            colors={colors}
            onPress={() => router.push("/(tabs)/location")}
          />
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          QUICK ACTIONS
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <QuickAction
            icon={<Ionicons name="call" size={20} color={colors.primary} />}
            label="Fake Incoming Call"
            sublabel="Trigger a decoy call to escape"
            colors={colors}
            onPress={() => router.push("/fake-call")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <QuickAction
            icon={<Ionicons name="people" size={20} color={colors.primary} />}
            label="Manage Contacts"
            sublabel={`${contacts.length} emergency contacts`}
            colors={colors}
            onPress={() => router.push("/(tabs)/contacts")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <QuickAction
            icon={<Ionicons name="navigate" size={20} color={colors.primary} />}
            label="Share Location"
            sublabel="Live GPS tracking"
            colors={colors}
            onPress={() => router.push("/(tabs)/location")}
          />
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {Platform.OS !== "web"
              ? "Shake your device to trigger SOS alert automatically."
              : "Shake detection available on mobile devices only."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatusCard({
  icon,
  label,
  value,
  colors,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={[styles.statusValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({
  icon,
  label,
  sublabel,
  colors,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: "rgba(255,30,30,0.1)" }]}>
        {icon}
      </View>
      <View style={styles.actionText}>
        <Text style={[styles.actionLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.actionSublabel, { color: colors.mutedForeground }]}>{sublabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  sosContainer: {
    alignItems: "center",
    marginVertical: 32,
  },
  alertText: {
    marginTop: 16,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statusCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    gap: 6,
  },
  statusValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statusLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  divider: { height: 1, marginHorizontal: 16 },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { flex: 1 },
  actionLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  actionSublabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
