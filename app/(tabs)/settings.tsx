import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSOS } from "@/contexts/SOSContext";
import { useColors } from "@/hooks/useColors";

const SENSITIVITY_LEVELS = [
  { label: "Low", value: 3.5 },
  { label: "Medium", value: 2.5 },
  { label: "High", value: 1.8 },
];

const COUNTDOWN_OPTIONS = [3, 5, 10];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSOS();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const toggleShake = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ shakeEnabled: val });
  };

  const currentSensitivity = SENSITIVITY_LEVELS.find(
    (s) => s.value === settings.shakeSensitivity
  )?.label ?? "Medium";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 120 : 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* SOS Section */}
        <SectionHeader label="SOS ALERTS" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon={<MaterialCommunityIcons name="vibrate" size={20} color={colors.primary} />}
            label="Shake to SOS"
            sublabel="Shake your device to trigger emergency alert"
            colors={colors}
            right={
              Platform.OS !== "web" ? (
                <Switch
                  value={settings.shakeEnabled}
                  onValueChange={toggleShake}
                  trackColor={{ false: colors.border, true: "rgba(255,30,30,0.4)" }}
                  thumbColor={settings.shakeEnabled ? colors.primary : colors.mutedForeground}
                />
              ) : (
                <Text style={[styles.unavailText, { color: colors.mutedForeground }]}>
                  Native only
                </Text>
              )
            }
          />
        </View>

        {Platform.OS !== "web" && (
          <>
            <SectionHeader label="SHAKE SENSITIVITY" colors={colors} />
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {SENSITIVITY_LEVELS.map((level, idx) => (
                <React.Fragment key={level.label}>
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateSettings({ shakeSensitivity: level.value });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionLabel, { color: colors.foreground }]}>
                      {level.label}
                    </Text>
                    <Text style={[styles.optionSubLabel, { color: colors.mutedForeground }]}>
                      {level.label === "High" ? "Very responsive" : level.label === "Low" ? "Requires strong shake" : "Balanced"}
                    </Text>
                    {settings.shakeSensitivity === level.value && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  {idx < SENSITIVITY_LEVELS.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </>
        )}

        <SectionHeader label="COUNTDOWN TIMER" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {COUNTDOWN_OPTIONS.map((sec, idx) => (
            <React.Fragment key={sec}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateSettings({ countdownSeconds: sec });
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionLabel, { color: colors.foreground }]}>
                  {sec} seconds
                </Text>
                <Text style={[styles.optionSubLabel, { color: colors.mutedForeground }]}>
                  {sec === 3 ? "Fast response" : sec === 5 ? "Recommended" : "More time to cancel"}
                </Text>
                {settings.countdownSeconds === sec && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
              {idx < COUNTDOWN_OPTIONS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* About */}
        <SectionHeader label="ABOUT" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.aboutRow}>
            <MaterialCommunityIcons name="shield-check" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionLabel, { color: colors.foreground }]}>EchoSafe</Text>
              <Text style={[styles.optionSubLabel, { color: colors.mutedForeground }]}>
                Version 1.0.0 · Personal Safety App
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.aboutRow}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionLabel, { color: colors.foreground }]}>Privacy First</Text>
              <Text style={[styles.optionSubLabel, { color: colors.mutedForeground }]}>
                All data stored locally on your device
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{label}</Text>
  );
}

function SettingRow({
  icon,
  label,
  sublabel,
  colors,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  colors: ReturnType<typeof useColors>;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: "rgba(255,30,30,0.1)" }]}>
        {icon}
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.optionLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.optionSubLabel, { color: colors.mutedForeground }]}>{sublabel}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  content: { padding: 20, gap: 10 },
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 2,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: { flex: 1 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  optionSubLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
    flex: 1,
  },
  divider: { height: 1, marginHorizontal: 16 },
  unavailText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
});
