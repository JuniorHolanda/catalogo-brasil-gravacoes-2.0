import "server-only";

import { randomUUID } from "node:crypto";
import { ObjectId, type WithId } from "mongodb";
import { ApplicationError } from "@/server/core/application-error";
import {
  getQuotesCollection,
  getOrdersCollection,
  type OrderRecord,
} from "@/server/database/mongodb";

export async function listOrders(ownerUserId: string, isAdmin = false, recentOnly = false) {
  const orders = await (await getOrdersCollection())
    .find(isAdmin ? {} : { ownerUserId })
    .sort({ createdAt: -1 })
    .limit(recentOnly ? 3 : 100)
    .toArray();
  return orders.map(serializeOrder);
}

export async function listRecentAccountActivity(ownerUserId: string) {
  const [orders, quotes] = await Promise.all([
    listOrders(ownerUserId, false, true),
    (await getQuotesCollection())
      .find({ ownerUserId })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray(),
  ]);
  return [
    ...orders.map((order) => ({ ...order, kind: "order" as const })),
    ...quotes.map((quote) => ({
      id: quote._id.toHexString(),
      number: quote.number,
      status: quote.status,
      createdAt: quote.createdAt,
      kind: "quote" as const,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
    .map(({ number, status, kind }) => ({ number, status, kind }));
}

export async function getOrder(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const order = await (await getOrdersCollection()).findOne({ _id: new ObjectId(id) });
  return order ? serializeOrder(order) : null;
}

export async function createOrder(ownerUserId: string, isAdmin: boolean, payload: unknown) {
  const body = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as Record<string, unknown>
    : null;
  const quoteId = typeof body?.quoteId === "string" ? body.quoteId : "";
  if (!ObjectId.isValid(quoteId)) throw new ApplicationError("Informe um orçamento válido.", 400);

  const quotes = await getQuotesCollection();
  const quoteObjectId = new ObjectId(quoteId);
  const quote = await quotes.findOne({ _id: quoteObjectId });
  if (!quote) throw new ApplicationError("Orçamento não encontrado.", 404);
  if (!isAdmin && quote.ownerUserId !== ownerUserId) {
    throw new ApplicationError("Este orçamento não pertence à sua conta.", 403);
  }
  if (quote.status !== "approved") {
    throw new ApplicationError("O orçamento precisa estar aprovado antes de virar pedido.", 409);
  }

  const now = new Date();
  const order: OrderRecord = {
    ownerUserId: quote.ownerUserId,
    quoteId: quoteObjectId.toHexString(),
    quoteNumber: quote.number,
    number: `BG-P-${now.getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
    serviceSlug: quote.serviceSlug,
    serviceName: quote.serviceName,
    requestType: quote.requestType,
    customer: quote.customer,
    product: quote.product,
    quantity: quote.quantity,
    pricing: quote.pricing,
    engravings: quote.engravings,
    status: "awaiting",
    createdAt: now,
    updatedAt: now,
  };
  const result = await (await getOrdersCollection()).insertOne(order);
  return { ...order, id: result.insertedId.toHexString() };
}

export async function updateOrder(
  id: string,
  ownerUserId: string,
  isAdmin: boolean,
  payload: unknown,
) {
  if (!ObjectId.isValid(id)) throw new ApplicationError("Pedido não encontrado.", 404);
  const collection = await getOrdersCollection();
  const order = await collection.findOne({ _id: new ObjectId(id) });
  if (!order || (!isAdmin && order.ownerUserId !== ownerUserId)) {
    throw new ApplicationError("Pedido não encontrado.", 404);
  }
  const body = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as Record<string, unknown>
    : null;
  const status = body?.status;
  const customerStatuses = ["cancelled"];
  const adminStatuses = ["awaiting", "producing", "problem", "completed", "cancelled"];
  if (typeof status !== "string" || !(isAdmin ? adminStatuses : customerStatuses).includes(status)) {
    throw new ApplicationError("Status de pedido inválido ou sem permissão.", 400);
  }
  if (!isAdmin && order.status !== "awaiting") {
    throw new ApplicationError("Este pedido não pode mais ser cancelado pela conta.", 409);
  }
  const updatedAt = new Date();
  const nextStatus = status as OrderRecord["status"];
  await collection.updateOne({ _id: order._id }, { $set: { status: nextStatus, updatedAt } });
  return serializeOrder({ ...order, status: nextStatus, updatedAt });
}

export async function deleteOrder(id: string, ownerUserId: string, isAdmin: boolean) {
  if (!ObjectId.isValid(id)) throw new ApplicationError("Pedido não encontrado.", 404);
  const collection = await getOrdersCollection();
  const order = await collection.findOne({ _id: new ObjectId(id) });
  if (!order || (!isAdmin && order.ownerUserId !== ownerUserId)) {
    throw new ApplicationError("Pedido não encontrado.", 404);
  }
  if (!isAdmin && order.status !== "awaiting") {
    throw new ApplicationError("Este pedido não pode ser excluído pela conta.", 409);
  }
  await collection.deleteOne({ _id: order._id });
}

function serializeOrder(order: WithId<OrderRecord>) {
  return { ...order, id: order._id.toHexString(), _id: undefined };
}
