import "server-only";

import { ApplicationError } from "@/server/core/application-error";
import { getCustomersCollection } from "@/server/database/mongodb";
import { validateCustomerSubmission } from "@/server/customers/customer-validation";

export async function createCustomerSubmission(payload: unknown): Promise<string> {
  const validation = validateCustomerSubmission(payload);
  if (!validation.success) {
    throw new ApplicationError("Confira os campos do cadastro.", 400, validation.errors);
  }

  const now = new Date();
  try {
    const result = await (await getCustomersCollection()).insertOne({
      ...validation.value,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });
    return result.insertedId.toString();
  } catch {
    throw new ApplicationError("Não foi possível salvar seu cadastro agora. Tente novamente mais tarde.", 500);
  }
}
