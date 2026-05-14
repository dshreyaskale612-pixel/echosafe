import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSOS } from "@/contexts/SOSContext";
import { useColors } from "@/hooks/useColors";

export function SOSButton() {
  const colors = useColors();
  const { sosActive, countdown, activateSOS, cancelSOS } = useSOS();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim1 = useRef(new Animated.Value(1)).current;
  const ringAnim2 = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (sosActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.92,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ringAnim1, {
              toValue: 1.5,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(ringAnim1, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ring1Opacity, {
              toValue: 0,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(ring1Opacity, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(ringAnim2, {
              toValue: 1.5,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(ringAnim2, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(ring2Opacity, {
              toValue: 0,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(ring2Opacity, {
              toValue: 0.3,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      ringAnim1.setValue(1);
      ringAnim2.setValue(1);
      ring1Opacity.setValue(0.6);
      ring2Opacity.setValue(0.3);
    }
  }, [sosActive]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (sosActive) {
      cancelSOS();
    } else {
      activateSOS();
    }
  };

  return (
    <View style={styles.container}>
      {/* Pulse rings */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: 220,
            height: 220,
            borderRadius: 110,
            borderColor: colors.primary,
            opacity: ring2Opacity,
            transform: [{ scale: ringAnim2 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: 220,
            height: 220,
            borderRadius: 110,
            borderColor: colors.primary,
            opacity: ring1Opacity,
            transform: [{ scale: ringAnim1 }],
          },
        ]}
      />

      {/* Main button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.85}
          style={[
            styles.button,
            {
              backgroundColor: sosActive ? "#CC0000" : colors.primary,
              shadowColor: colors.primary,
            },
          ]}
          testID="sos-button"
        >
          <Text style={[styles.sosText, { color: colors.primaryForeground }]}>
            {sosActive ? countdown.toString() : "SOS"}
          </Text>
          <Text style={[styles.subText, { color: "rgba(255,255,255,0.7)" }]}>
            {sosActive ? "TAP TO CANCEL" : "HOLD FOR HELP"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 240,
    height: 240,
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 20,
  },
  sosText: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  subText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginTop: 4,
  },
});
