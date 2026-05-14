import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const FAKE_CALLERS = [
  { name: "Mom", number: "+1 (555) 012-3456" },
  { name: "Sarah K.", number: "+1 (555) 987-6543" },
  { name: "Dr. Roberts", number: "+1 (555) 234-5678" },
  { name: "Work - HR", number: "+1 (800) 555-0199" },
];

export default function FakeCallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [caller] = useState(
    FAKE_CALLERS[Math.floor(Math.random() * FAKE_CALLERS.length)]
  );
  const [callState, setCallState] = useState<"ringing" | "active" | "ended">("ringing");
  const [duration, setDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for ringing state
  useEffect(() => {
    if (callState === "ringing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1.6,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    return () => {
      pulseAnim.stopAnimation();
      ringAnim.stopAnimation();
    };
  }, [callState]);

  useEffect(() => {
    if (callState === "active") {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const handleAnswer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCallState("active");
  };

  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCallState("ended");
    setTimeout(() => router.back(), 1200);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const topPad = Platform.OS === "web" ? 80 : insets.top + 20;
  const bottomPad = Platform.OS === "web" ? 50 : insets.bottom + 20;

  return (
    <View style={[styles.screen, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {/* Dismiss button */}
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>

      {/* Status */}
      <Text style={styles.callStatus}>
        {callState === "ringing"
          ? "Incoming Call"
          : callState === "active"
          ? formatDuration(duration)
          : "Call Ended"}
      </Text>

      {/* Avatar area */}
      <View style={styles.avatarArea}>
        {callState === "ringing" && (
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: 0.2,
                transform: [{ scale: ringAnim }],
              },
            ]}
          />
        )}
        <Animated.View
          style={[
            styles.avatarContainer,
            callState === "ringing" && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.avatarInitial}>
            {caller.name[0]}
          </Text>
        </Animated.View>
      </View>

      <Text style={styles.callerName}>{caller.name}</Text>
      <Text style={styles.callerNumber}>{caller.number}</Text>
      {callState === "active" && (
        <Text style={styles.callActive}>Call in progress</Text>
      )}

      {/* Call Actions */}
      {callState !== "ended" && (
        <View style={styles.actionsArea}>
          {callState === "ringing" ? (
            <View style={styles.ringActions}>
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={[styles.callBtn, styles.declineBtn]}
                  onPress={handleDecline}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={30} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
                </TouchableOpacity>
                <Text style={styles.actionLabel}>Decline</Text>
              </View>
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={[styles.callBtn, styles.answerBtn]}
                  onPress={handleAnswer}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.actionLabel}>Answer</Text>
              </View>
            </View>
          ) : (
            <View style={styles.activeActions}>
              <ActionButton icon="mic-off" label="Mute" />
              <ActionButton icon="keypad" label="Keypad" />
              <ActionButton icon="volume-high" label="Speaker" />
              <TouchableOpacity
                style={[styles.callBtn, styles.declineBtn, styles.endBtn]}
                onPress={handleDecline}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {callState === "ended" && (
        <View style={styles.endedArea}>
          <MaterialCommunityIcons name="phone-hangup" size={40} color="#666" />
          <Text style={styles.endedText}>Call ended</Text>
        </View>
      )}
    </View>
  );
}

function ActionButton({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.actionGroup}>
      <TouchableOpacity
        style={styles.utilBtn}
        activeOpacity={0.7}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Ionicons name={icon} size={22} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  dismissBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  dismissText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  callStatus: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginTop: 24,
    letterSpacing: 0.5,
  },
  avatarArea: {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
    marginTop: 40,
  },
  ring: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#22C55E",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#333",
  },
  avatarInitial: {
    fontSize: 52,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  callerName: {
    color: "#ffffff",
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    marginTop: 24,
    letterSpacing: -0.5,
  },
  callerNumber: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  callActive: {
    color: "#22C55E",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  actionsArea: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
  },
  ringActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  activeActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  actionGroup: {
    alignItems: "center",
    gap: 10,
  },
  callBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  answerBtn: {
    backgroundColor: "#22C55E",
    shadowColor: "#22C55E",
  },
  declineBtn: {
    backgroundColor: "#FF1E1E",
    shadowColor: "#FF1E1E",
  },
  endBtn: {
    width: 72,
    height: 72,
  },
  utilBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  endedArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  endedText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 18,
    fontFamily: "Inter_400Regular",
  },
});
