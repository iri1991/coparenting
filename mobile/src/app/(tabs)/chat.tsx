import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";
import { dayLabel, timeLabel } from "@/lib/dates";
import { useBootstrap } from "@/lib/session";
import type { ChatMessage } from "@/lib/types";
import { colors, font, radius, spacing } from "@/theme";

const POLL_MS = 8000;

type Row = { kind: "message"; message: ChatMessage; grouped: boolean } | { kind: "day"; key: string; label: string };

/** Rânduri pentru listă inversată (cel mai nou primul), cu separatoare de zi. */
function buildRows(messages: ChatMessage[]): Row[] {
  const rows: Row[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const prev = messages[i - 1];
    const day = new Date(m.createdAt).toDateString();
    const grouped = !!prev && prev.senderId === m.senderId && new Date(prev.createdAt).toDateString() === day;
    rows.push({ kind: "message", message: m, grouped });
    if (!prev || new Date(prev.createdAt).toDateString() !== day) {
      rows.push({ kind: "day", key: `day-${day}`, label: dayLabel(new Date(m.createdAt)) });
    }
  }
  return rows;
}

export default function ChatScreen() {
  const { user, family } = useBootstrap();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  const partner =
    family && family.myParentIndex === 0 ? family.parent2Name : family && family.myParentIndex === 1 ? family.parent1Name : "Celălalt părinte";

  const load = useCallback(async () => {
    const mySeq = ++seq.current;
    try {
      const data = await api<{ messages: ChatMessage[] }>("/api/chat");
      if (mySeq === seq.current) setMessages(data.messages);
    } catch {
      // păstrăm lista curentă
    }
  }, []);

  // Polling doar cât ecranul e vizibil; marchează mesajele ca citite.
  useFocusEffect(
    useCallback(() => {
      load();
      api("/api/chat/read", { method: "POST" }).catch(() => {});
      const t = setInterval(load, POLL_MS);
      return () => clearInterval(t);
    }, [load])
  );

  useEffect(() => {
    if (messages.length) api("/api/chat/read", { method: "POST" }).catch(() => {});
  }, [messages.length]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const created = await api<ChatMessage & { senderId: string }>("/api/chat", { method: "POST", body: { text: body } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setText("");
      setMessages((prev) => [...prev, { ...created, senderLabel: "Tu", seenByOther: false }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mesajul nu a putut fi trimis.");
    } finally {
      setSending(false);
    }
  }

  const lastSeenId = [...messages].reverse().find((m) => m.senderId === user.id && m.seenByOther)?.id;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundDense }} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ color: colors.white, fontWeight: "700", fontSize: 16 }}>{(partner.trim()[0] ?? "?").toUpperCase()}</Text>
        </View>
        <View>
          <Text style={[font.body, { fontWeight: "600" }]}>{partner}</Text>
          <Text style={font.meta}>Co-părinte · conversație privată</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        <FlatList
          inverted
          data={buildRows(messages)}
          keyExtractor={(r) => (r.kind === "day" ? r.key : r.message.id)}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: spacing.xxl, transform: [{ scaleY: -1 }] }}>
              <Text style={font.heading}>Începe conversația cu {partner}</Text>
              <Text style={[font.small, { textAlign: "center", marginTop: spacing.sm }]}>
                Mesaje clare despre copil, program și logistică — totul într-un singur loc.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item.kind === "day") {
              return (
                <View style={{ alignItems: "center", marginVertical: spacing.md }}>
                  <Text style={styles.dayPill}>{item.label}</Text>
                </View>
              );
            }
            const m = item.message;
            const mine = m.senderId === user.id;
            return (
              <View style={{ alignItems: mine ? "flex-end" : "flex-start", marginTop: item.grouped ? 3 : 10 }}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  {m.replyTo ? (
                    <View style={[styles.quote, mine ? { backgroundColor: "rgba(255,255,255,0.18)", borderLeftColor: "rgba(255,255,255,0.7)" } : null]}>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: mine ? colors.white : colors.accentText }}>
                        {m.replyTo.senderId === user.id ? "Tu" : m.replyTo.senderLabel}
                      </Text>
                      <Text numberOfLines={2} style={{ fontSize: 13, color: mine ? "rgba(255,255,255,0.9)" : colors.textSecondary }}>
                        {m.replyTo.text}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={{ fontSize: 15.5, lineHeight: 21, color: mine ? colors.white : colors.text }}>{m.text}</Text>
                  <Text style={{ alignSelf: "flex-end", fontSize: 11, marginTop: 2, color: mine ? "rgba(255,255,255,0.75)" : colors.textMuted }}>
                    {timeLabel(m.createdAt)}
                  </Text>
                </View>
                {mine && m.id === lastSeenId ? <Text style={[font.meta, { marginTop: 2, marginRight: 4 }]}>Văzut</Text> : null}
              </View>
            );
          }}
        />

        <View style={styles.composer}>
          {error ? <Text style={{ color: colors.danger, fontSize: 12, marginBottom: 6 }}>{error}</Text> : null}
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: spacing.sm }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Mesaj"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={2000}
              style={styles.input}
            />
            <Pressable
              accessibilityLabel="Trimite"
              onPress={send}
              disabled={!text.trim() || sending}
              style={[styles.send, (!text.trim() || sending) && { backgroundColor: "#e7e5e4" }]}
            >
              <Icon name="arrowUp" color={!text.trim() || sending ? colors.textMuted : colors.white} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  dayPill: {
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  bubble: { maxWidth: "82%", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, borderRadius: 20 },
  bubbleMine: { backgroundColor: colors.accent, borderBottomRightRadius: 6 },
  bubbleTheirs: { backgroundColor: colors.white, borderWidth: 1, borderColor: "#eee2d6", borderBottomLeftRadius: 6 },
  quote: { borderLeftWidth: 3, borderLeftColor: colors.accent, backgroundColor: "#f8efe7", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6 },
  composer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: "rgba(255,255,255,0.95)", padding: spacing.sm },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 132,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#e3d3c3",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: colors.text,
  },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
});
