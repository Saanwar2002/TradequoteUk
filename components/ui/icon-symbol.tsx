import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Partial<Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING: IconMapping = {
  // Navigation
  "house.fill": "home",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",

  // Trade & Jobs
  "briefcase.fill": "work",
  "hammer.fill": "hardware",
  "wrench.fill": "build",
  "wrench.and.screwdriver.fill": "handyman",
  "bolt.fill": "bolt",
  "flame.fill": "local-fire-department",
  "drop.fill": "water-drop",
  "paintbrush.fill": "brush",
  "leaf.fill": "eco",
  "sparkles": "auto-awesome",
  "sun.max.fill": "wb-sunny",

  // People & Profile
  "person.fill": "person",
  "person.2.fill": "group",
  "building.2.fill": "business",

  // Communication
  "message.fill": "chat",
  "text.bubble.fill": "chat-bubble",
  "bell.fill": "notifications",
  "bell.badge.fill": "notifications-active",

  // Documents & Jobs
  "doc.fill": "description",
  "doc.text.fill": "article",
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "magnifyingglass": "search",

  // Status & Feedback
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "checkmark.seal.fill": "verified",
  "xmark.circle": "cancel",
  "exclamationmark.circle.fill": "error",
  "exclamationmark.triangle.fill": "warning",
  "info.circle.fill": "info",

  // Finance
  "banknote.fill": "payments",
  "creditcard.fill": "credit-card",

  // Location
  "location.fill": "location-on",
  "map.fill": "map",

  // Time
  "clock.fill": "schedule",
  "calendar": "calendar-today",

  // Actions
  "star.fill": "star",
  "heart": "favorite-border",
  "heart.fill": "favorite",
  "square": "check-box-outline-blank",
  "checkmark.square.fill": "check-box",
  "circle": "radio-button-unchecked",
  "shield.fill": "security",
  "trophy.fill": "emoji-events",
  "rectangle.portrait.and.arrow.right": "logout",
  "questionmark.circle.fill": "help",
  "flag.fill": "flag",
  "lock.fill": "lock",
  "bathtub.fill": "bathtub",
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const materialName = MAPPING[name] ?? "help-outline";
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}
