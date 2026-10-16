import "server-only";

export type CustomerSubmission = {
  name: string;
  company: string;
  phone: string;
  mobile: string;
  cnpj: string;
  title: string;
  message: string;
};

export type CustomerSubmissionResult =
  | { success: true; value: CustomerSubmission }
  | { success: false; errors: Partial<Record<keyof CustomerSubmission, string>> };

const FIELD_LIMITS = {
  name: 120,
  company: 160,
  phone: 32,
  mobile: 32,
  cnpj: 18,
  title: 160,
  message: 3000,
} as const;

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateCustomerSubmission(input: unknown): CustomerSubmissionResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { success: false, errors: { name: "Envie os dados do cadastro." } };
  }

  const raw = input as Record<string, unknown>;
  const value: CustomerSubmission = {
    name: cleanString(raw.name),
    company: cleanString(raw.company),
    phone: digitsOnly(cleanString(raw.phone)),
    mobile: digitsOnly(cleanString(raw.mobile)),
    cnpj: digitsOnly(cleanString(raw.cnpj)),
    title: cleanString(raw.title),
    message: cleanString(raw.message),
  };

  const errors: Partial<Record<keyof CustomerSubmission, string>> = {};

  for (const [field, limit] of Object.entries(FIELD_LIMITS) as Array<
    [keyof CustomerSubmission, number]
  >) {
    if (value[field].length > limit) {
      errors[field] = `Este campo deve ter no máximo ${limit} caracteres.`;
    }
  }

  if (!value.name) errors.name = "Informe seu nome.";
  if (!value.phone && !value.mobile) {
    errors.phone = "Informe um telefone ou celular.";
    errors.mobile = "Informe um telefone ou celular.";
  }

  for (const field of ["phone", "mobile"] as const) {
    if (value[field] && (value[field].length < 8 || value[field].length > 15)) {
      errors[field] = "Informe um telefone válido, com DDD.";
    }
  }

  if (value.cnpj && value.cnpj.length !== 14) {
    errors.cnpj = "O CNPJ deve conter 14 dígitos.";
  }

  if (!value.title) errors.title = "Informe o título do orçamento.";
  if (!value.message) errors.message = "Descreva o que você precisa.";

  return Object.keys(errors).length > 0
    ? { success: false, errors }
    : { success: true, value };
}
