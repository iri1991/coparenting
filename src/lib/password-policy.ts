/** Politica de parolă, comună pentru înregistrare, resetare și schimbare. */
export const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200;

/** Întoarce mesajul de eroare sau null dacă parola e acceptată. */
export function validateNewPassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Parola trebuie să aibă cel puțin ${MIN_PASSWORD_LENGTH} caractere.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Parola poate avea maximum ${MAX_PASSWORD_LENGTH} caractere.`;
  }
  return null;
}
