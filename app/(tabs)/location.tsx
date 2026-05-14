import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  timestamp: number;
}

export default function LocationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchRef = useRef<{ remove: () => void } | null>(null);

  const requestAndStart = async () => {
    setError(null);
    setLoading(true);

    try {
      if (Platform.OS === "web") {
        if (!navigator.geolocation) {
          setError("Geolocation not supported in this browser.");
          setLoading(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude,
              timestamp: pos.timestamp,
            });
            setSharing(true);
            setLoading(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          },
          { enableHighAccuracy: true }
        );
        return;
      }

      const Location = await import("expo-location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied. Please allow access in Settings.");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        altitude: loc.coords.altitude,
        timestamp: loc.timestamp,
      });
      setSharing(true);
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            altitude: loc.coords.altitude,
            timestamp: loc.timestamp,
          });
        }
      );
      watchRef.current = sub;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to get location");
      setLoading(false);
    }
  };

  const stopSharing = () => {
    watchRef.current?.remove();
    watchRef.current = null;
    setSharing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  useEffect(() => {
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  const formattedTime = location
    ? new Date(location.timestamp).toLocaleTimeString()
    : "--:--:--";

  const copyCoords = () => {
    if (!location) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          <Text style={[styles.title, { color: colors.foreground }]}>Location</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {sharing ? "Live tracking active" : "Tracking paused"}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: sharing
                ? "rgba(34,197,94,0.15)"
                : "rgba(100,100,100,0.15)",
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: sharing ? "#22C55E" : colors.mutedForeground },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: sharing ? "#22C55E" : colors.mutedForeground },
            ]}
          >
            {sharing ? "LIVE" : "IDLE"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 120 : 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Map visual area */}
        <View
          style={[
            styles.mapArea,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.mapGrid}>
            {Array.from({ length: 48 }).map((_, i) => (
              <View
                key={i}
                style={[styles.gridDot, { backgroundColor: colors.border }]}
              />
            ))}
          </View>
          {location ? (
            <View style={styles.mapContent}>
              <View
                style={[
                  styles.pingOuter,
                  { borderColor: "rgba(255,30,30,0.3)" },
                ]}
              />
              <View style={[styles.pingInner, { backgroundColor: colors.primary }]} />
              <View
                style={[
                  styles.coordBubble,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.coordBubbleText, { color: colors.foreground }]}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.mapContent}>
              <MaterialCommunityIcons
                name="map-marker-radius-outline"
                size={52}
                color={colors.mutedForeground}
              />
              <Text style={[styles.mapEmptyText, { color: colors.mutedForeground }]}>
                Start tracking to see location
              </Text>
            </View>
          )}
          {sharing && (
            <View style={styles.liveOverlay}>
              <View style={[styles.liveDot, { backgroundColor: "#FF1E1E" }]} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Coordinate cards */}
        {location && (
          <>
            <View style={styles.coordsRow}>
              <CoordCard label="LATITUDE" value={location.latitude.toFixed(6)} colors={colors} />
              <CoordCard label="LONGITUDE" value={location.longitude.toFixed(6)} colors={colors} />
            </View>
            <View style={styles.coordsRow}>
              <CoordCard
                label="ACCURACY"
                value={location.accuracy ? `±${Math.round(location.accuracy)}m` : "N/A"}
                colors={colors}
              />
              <CoordCard label="LAST UPDATE" value={formattedTime} colors={colors} />
            </View>
            {location.altitude !== null && (
              <View style={styles.coordsRow}>
                <CoordCard
                  label="ALTITUDE"
                  value={`${Math.round(location.altitude ?? 0)}m`}
                  colors={colors}
                />
                <CoordCard
                  label="PLATFORM"
                  value={Platform.OS.toUpperCase()}
                  colors={colors}
                />
              </View>
            )}
          </>
        )}

        {error && (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: "rgba(255,30,30,0.08)", borderColor: "rgba(255,30,30,0.3)" },
            ]}
          >
            <Ionicons name="warning-outline" size={18} color={colors.primary} />
            <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
          </View>
        )}

        {/* Main action */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: sharing ? colors.card : colors.primary,
              borderColor: sharing ? colors.border : colors.primary,
            },
          ]}
          onPress={sharing ? stopSharing : requestAndStart}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={sharing ? colors.primary : "#fff"} size="small" />
          ) : (
            <>
              <MaterialCommunityIcons
                name={sharing ? "map-marker-off" : "map-marker-radius"}
                size={22}
                color={sharing ? colors.foreground : "#fff"}
              />
              <Text
                style={[styles.actionBtnText, { color: sharing ? colors.foreground : "#fff" }]}
              >
                {sharing ? "Stop Tracking" : "Start Live Tracking"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {sharing && (
          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            Location updates every 5 seconds automatically.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function CoordCard({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.coordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.coordLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.coordValue, { color: colors.foreground }]} numberOfLines={1}>
        {value}
      </Text>
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
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  content: { padding: 20, gap: 14 },
  mapArea: {
    height: 220,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  mapGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 14,
  },
  gridDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.5,
  },
  mapContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    zIndex: 2,
  },
  mapEmptyText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  pingOuter: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    opacity: 0.5,
  },
  pingInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    shadowColor: "#FF1E1E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  coordBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 36,
  },
  coordBubbleText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  liveOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: {
    color: "#FF1E1E",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  coordsRow: { flexDirection: "row", gap: 12 },
  coordCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 5,
  },
  coordLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
  },
  coordValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  note: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
