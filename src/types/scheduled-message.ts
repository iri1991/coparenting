/**
 * Un mesaj de chat programat cu „cooldown”: trimis după o întârziere (implicit 5 min),
 * timp în care expeditorul îl poate anula, edita sau trimite imediat. Oferă o pauză
 * de reflecție înainte ca mesajul să ajungă la celălalt părinte.
 */
export interface ScheduledMessage {
  id: string;
  text: string;
  /** Momentul la care va fi livrat (ISO). */
  sendAt: string;
  createdAt: string;
  replyTo?: {
    id: string;
    senderId: string;
    text: string;
  } | null;
}
