export type AuthAvailability = {
  emailPassword: boolean;
  emailSignUp: boolean;
  verificationEmail: boolean;
  google: boolean;
};

export function authErrorMessage(error: { code?: string; status?: number }) {
  if (error.status === 429) return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "E-mail ou senha incorretos.";
    case "EMAIL_NOT_VERIFIED":
      return "Confirme seu e-mail antes de entrar. Você pode solicitar outro link abaixo.";
    case "INVALID_EMAIL":
      return "Informe um endereço de e-mail válido.";
    case "PASSWORD_TOO_SHORT":
      return "Use uma senha com pelo menos 8 caracteres.";
    case "PASSWORD_TOO_LONG":
      return "Use uma senha com no máximo 128 caracteres.";
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Já existe uma conta com este e-mail. Entre na sua conta.";
    case "EMAIL_SERVICE_UNAVAILABLE":
    case "RESET_PASSWORD_DISABLED":
    case "EMAIL_PASSWORD_SIGN_UP_DISABLED":
      return "O envio de e-mails está temporariamente indisponível. Tente novamente mais tarde.";
    default:
      return "Não foi possível concluir o acesso. Tente novamente em instantes.";
  }
}
