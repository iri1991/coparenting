/**
 * Iconițele aplicației: aceleași desene Lucide ca pe web (stroke 2, 24×24),
 * redate cu react-native-svg ca să nu adăugăm o bibliotecă întreagă de iconițe.
 */
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "@/theme";

export type IconName =
  | "house"
  | "message"
  | "user"
  | "chevronLeft"
  | "chevronRight"
  | "trash"
  | "logout"
  | "arrowUp"
  | "calendar"
  | "lock";

export function Icon({ name, size = 22, color = colors.text, strokeWidth = 2 }: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const p = { stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "house" && (
        <>
          <Path {...p} d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
          <Path {...p} d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </>
      )}
      {name === "message" && (
        <Path {...p} d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
      )}
      {name === "user" && (
        <>
          <Circle {...p} cx="12" cy="8" r="5" />
          <Path {...p} d="M20 21a8 8 0 0 0-16 0" />
        </>
      )}
      {name === "chevronLeft" && <Path {...p} d="m15 18-6-6 6-6" />}
      {name === "chevronRight" && <Path {...p} d="m9 18 6-6-6-6" />}
      {name === "trash" && (
        <>
          <Path {...p} d="M10 11v6" />
          <Path {...p} d="M14 11v6" />
          <Path {...p} d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <Path {...p} d="M3 6h18" />
          <Path {...p} d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </>
      )}
      {name === "logout" && (
        <>
          <Path {...p} d="m16 17 5-5-5-5" />
          <Path {...p} d="M21 12H9" />
          <Path {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        </>
      )}
      {name === "arrowUp" && (
        <>
          <Path {...p} d="m5 12 7-7 7 7" />
          <Path {...p} d="M12 19V5" />
        </>
      )}
      {name === "calendar" && (
        <>
          <Path {...p} d="M8 2v4" />
          <Path {...p} d="M16 2v4" />
          <Rect {...p} width="18" height="18" x="3" y="4" rx="2" />
          <Path {...p} d="M3 10h18" />
        </>
      )}
      {name === "lock" && (
        <>
          <Circle {...p} cx="12" cy="16" r="1" />
          <Rect {...p} x="3" y="10" width="18" height="12" rx="2" />
          <Path {...p} d="M7 10V7a5 5 0 0 1 10 0v3" />
        </>
      )}
    </Svg>
  );
}
