"use client";

import { apiFetch } from "@/lib/api-client";

type FileReservation = {
  id: string;
  partSize: number;
  partCount: number;
};

async function throwResponseError(response: Response, fallback: string): Promise<never> {
  const result = await response.json().catch(() => ({})) as { error?: string };
  throw new Error(result.error || fallback);
}

/** Envia um arquivo pelos endpoints autenticados e mantém o controle de cota no servidor. */
export async function uploadCustomerFile(
  file: File,
  onProgress?: (partNumber: number, partCount: number) => void,
): Promise<string> {
  const reservationResponse = await apiFetch("/api/v1/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, sizeBytes: file.size }),
  });
  if (!reservationResponse.ok) {
    await throwResponseError(reservationResponse, "Não foi possível reservar o arquivo.");
  }

  const reservation = await reservationResponse.json() as FileReservation;
  try {
    for (let partNumber = 0; partNumber < reservation.partCount; partNumber += 1) {
      onProgress?.(partNumber + 1, reservation.partCount);
      const start = partNumber * reservation.partSize;
      const part = file.slice(start, Math.min(start + reservation.partSize, file.size));
      const uploadResponse = await apiFetch(`/api/v1/files/${reservation.id}/parts/${partNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: part,
      });
      if (!uploadResponse.ok) {
        await throwResponseError(uploadResponse, "Não foi possível enviar o arquivo.");
      }
    }

    const completeResponse = await apiFetch(`/api/v1/files/${reservation.id}/complete`, { method: "POST" });
    if (!completeResponse.ok) {
      await throwResponseError(completeResponse, "Não foi possível concluir o arquivo.");
    }
    return reservation.id;
  } catch (error) {
    await apiFetch(`/api/v1/files/${reservation.id}`, { method: "DELETE" }).catch(() => undefined);
    throw error;
  }
}
