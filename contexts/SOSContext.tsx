import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, Platform } from "react-native";

interface SOSSettings {
  shakeEnabled: boolean;
  shakeSensitivity: number;
  countdownSeconds: number;
}

interface SOSContextType {
  sosActive: boolean;
  countdown: number;
  settings: SOSSettings;
  activateSOS: () => void;
  cancelSOS: () => void;
  updateSettings: (s: Partial<SOSSettings>) => void;
}

const SOSContext = createContext<SOSContextType | undefined>(undefined);

const SETTINGS_KEY = "@echosafe_sos_settings";

const defaultSettings: SOSSettings = {
  shakeEnabled: true,
  shakeSensitivity: 2.5,
  countdownSeconds: 5,
};

export function SOSProvider({ children }: { children: React.ReactNode }) {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [settings, setSettings] = useState<SOSSettings>(defaultSettings);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeSubscriptionRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((data) => {
      if (data) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(data) });
        } catch {
          /* ignore */
        }
      }
    });
  }, []);

  const activateSOS = useCallback(() => {
    if (sosActive) return;
    setSosActive(true);
    setCountdown(settings.countdownSeconds);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    let remaining = settings.countdownSeconds;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        Alert.alert(
          "SOS ACTIVATED",
          "Emergency alert sent to all contacts!",
          [{ text: "OK", onPress: () => setSosActive(false) }]
        );
      }
    }, 1000);
  }, [sosActive, settings.countdownSeconds]);

  const cancelSOS = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setSosActive(false);
    setCountdown(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const updateSettings = useCallback(
    async (updated: Partial<SOSSettings>) => {
      const merged = { ...settings, ...updated };
      setSettings(merged);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    },
    [settings]
  );

  // Shake detection — native only
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!settings.shakeEnabled) {
      shakeSubscriptionRef.current?.remove();
      shakeSubscriptionRef.current = null;
      return;
    }

    let lastShake = 0;

    const setupAccelerometer = async () => {
      try {
        const { Accelerometer } = await import("expo-sensors");
        Accelerometer.setUpdateInterval(100);
        const sub = Accelerometer.addListener(({ x, y, z }) => {
          const acc = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();
          if (acc > settings.shakeSensitivity + 1 && now - lastShake > 2000) {
            lastShake = now;
            activateSOS();
          }
        });
        shakeSubscriptionRef.current = sub;
      } catch {
        /* sensors not available */
      }
    };

    setupAccelerometer();

    return () => {
      shakeSubscriptionRef.current?.remove();
      shakeSubscriptionRef.current = null;
    };
  }, [settings.shakeEnabled, settings.shakeSensitivity, activateSOS]);

  return (
    <SOSContext.Provider
      value={{ sosActive, countdown, settings, activateSOS, cancelSOS, updateSettings }}
    >
      {children}
    </SOSContext.Provider>
  );
}

export function useSOS() {
  const ctx = useContext(SOSContext);
  if (!ctx) throw new Error("useSOS must be used within SOSProvider");
  return ctx;
}
