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
  const rawMobile = cleanString(raw.mobile);
  const value: CustomerSubmission = {
    name: cleanString(raw.name),
    company: cleanString(raw.company),
    phone: digitsOnly(cleanString(raw.phone)),
    mobile: digitsOnly(rawMobile),
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
  if (!value.company) errors.company = "Informe o nome da empresa.";
  if (!value.mobile) errors.mobile = "Informe seu celular.";
  if (value.mobile && !/^\+?[\d\s().-]+$/.test(rawMobile)) {
    errors.mobile = "Digite somente números no celular.";
  }

  if (value.phone && (value.phone.length < 8 || value.phone.length > 15)) {
    errors.phone = "Informe um telefone válido, com DDD.";
  }

  if (value.cnpj && value.cnpj.length !== 14) {
    errors.cnpj = "O CNPJ deve conter 14 dígitos.";
  }

  return Object.keys(errors).length > 0
    ? { success: false, errors }
    : { success: true, value };
}
