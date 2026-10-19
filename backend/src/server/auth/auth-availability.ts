import "server-only";

export function getAuthAvailability() {
  const verificationEmail = Boolean(process.env.RESEND_API_KEY?.trim() && process.env.STORAGE_ALERT_FROM?.trim());
  return {
    emailPassword: true,
    emailSignUp: verificationEmail,
    verificationEmail,
    google: Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()),
  };
}
