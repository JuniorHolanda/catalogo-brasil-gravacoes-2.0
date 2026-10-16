"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { FaDownload, FaTrash } from "react-icons/fa";
import { apiFetch } from "@/lib/api-client";
import {
  SCustomerPanel,
  SCustomerPanelHeader,
  SDailyUsage,
  SFileAction,
  SFileActions,
  SFileRow,
  SFileSection,
  SPanelNotice,
  SUploadButton,
  SUploadCard,
} from "@/styles/customer-dashboard.styles";

type CustomerFile = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  status: "pending" | "uploading" | "deleting" | "ready";
  canComplete: boolean;
  createdAt: string;
};

type FileListResponse = {
  files: CustomerFile[];
  dailyUploads: number;
  dailyLimit: number;
};

async function requestFileList(): Promise<FileListResponse> {
  const response = await apiFetch("/api/v1/files", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Não foi possível carregar os arquivos.");
  return result as FileListResponse;
}

const MAX_FILE_BYTES = 5_000_000;
const ACCEPTED_FORMATS = ".jpg,.svg,.cdr,.pdf,.png";

function sizeLabel(size: number) {
  if (size < 1_000_000) return `${Math.max(1, Math.round(size / 1_000))} KB`;
  return `${(size / 1_000_000).toFixed(2)} MB`;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CustomerFilesPanel() {
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [dailyUploads, setDailyUploads] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(15);
  const [notice, setNotice] = useState("");
  const [noticeIsError, setNoticeIsError] = useState(false);
  const [uploadingName, setUploadingName] = useState("");
  const [busyFileId, setBusyFileId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await requestFileList();
      setFiles(data.files);
      setDailyUploads(data.dailyUploads);
      setDailyLimit(data.dailyLimit);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível carregar os arquivos.");
      setNoticeIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void requestFileList()
      .then((data) => {
        if (!isMounted) return;
        setFiles(data.files);
        setDailyUploads(data.dailyUploads);
        setDailyLimit(data.dailyLimit);
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setNotice(error instanceof Error ? error.message : "Não foi possível carregar os arquivos.");
        setNoticeIsError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;
    setNotice("");
    setNoticeIsError(false);

    const remainingSlots = Math.max(0, dailyLimit - dailyUploads);
    if (remainingSlots === 0) {
      setNotice("Você já enviou 15 arquivos hoje.");
      setNoticeIsError(true);
      event.target.value = "";
      return;
    }
    if (selectedFiles.length > remainingSlots) {
      setNotice(`Hoje restam ${remainingSlots} envio(s). Os demais arquivos não serão enviados.`);
      setNoticeIsError(true);
    }

    const batch = selectedFiles.slice(0, remainingSlots);
    for (const file of batch) {
      if (file.size < 1 || file.size > MAX_FILE_BYTES) {
        setNotice(`${file.name}: cada arquivo precisa ter até 5 MB.`);
        setNoticeIsError(true);
        continue;
      }

      setUploadingName(file.name);
      try {
        const reservationResponse = await apiFetch("/api/v1/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, sizeBytes: file.size }),
        });
        const reservation = await reservationResponse.json();
        if (!reservationResponse.ok) throw new Error(reservation.error || "Não foi possível reservar o arquivo.");

        for (let partNumber = 0; partNumber < reservation.partCount; partNumber += 1) {
          setUploadingName(`${file.name} (${partNumber + 1}/${reservation.partCount})`);
          const start = partNumber * reservation.partSize;
          const part = file.slice(start, Math.min(start + reservation.partSize, file.size));
          const uploadResponse = await apiFetch(`/api/v1/files/${reservation.id}/parts/${partNumber}`, {
            method: "PUT",
            headers: { "Content-Type": "application/octet-stream" },
            body: part,
          });
          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json().catch(() => ({}));
            await apiFetch(`/api/v1/files/${reservation.id}`, { method: "DELETE" }).catch(() => undefined);
            throw new Error(uploadError.error || "Não foi possível enviar o arquivo.");
          }
        }

        const completeResponse = await apiFetch(`/api/v1/files/${reservation.id}/complete`, { method: "POST" });
        if (!completeResponse.ok) {
          const completeError = await completeResponse.json().catch(() => ({}));
          await apiFetch(`/api/v1/files/${reservation.id}`, { method: "DELETE" }).catch(() => undefined);
          throw new Error(completeError.error || "Não foi possível concluir o arquivo.");
        }
      } catch (error) {
        setNotice(error instanceof Error ? `${file.name}: ${error.message}` : `Falha ao enviar ${file.name}.`);
        setNoticeIsError(true);
        break;
      }
    }

    setUploadingName("");
    event.target.value = "";
    await loadFiles();
  }

  async function downloadFile(file: CustomerFile) {
    setBusyFileId(file.id);
    setNotice("");
    try {
      const response = await apiFetch(`/api/v1/files/${file.id}/download`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível preparar o download.");
      window.location.assign(result.url as string);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível baixar o arquivo.");
      setNoticeIsError(true);
    } finally {
      setBusyFileId("");
    }
  }

  async function completeFile(file: CustomerFile) {
    setBusyFileId(file.id);
    setNotice("");
    try {
      const response = await apiFetch(`/api/v1/files/${file.id}/complete`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível concluir o envio.");
      await loadFiles();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível concluir o envio.");
      setNoticeIsError(true);
    } finally {
      setBusyFileId("");
    }
  }

  async function deleteFile(file: CustomerFile) {
    if (!window.confirm(`Excluir o arquivo “${file.fileName}”?`)) return;
    setBusyFileId(file.id);
    setNotice("");
    try {
      const response = await apiFetch(`/api/v1/files/${file.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir o arquivo.");
      setFiles((current) => current.filter((item) => item.id !== file.id));
      await loadFiles();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível excluir o arquivo.");
      setNoticeIsError(true);
    } finally {
      setBusyFileId("");
    }
  }

  const uploadDisabled = Boolean(uploadingName) || dailyUploads >= dailyLimit || isLoading;

  return (
    <SCustomerPanel>
      <SCustomerPanelHeader>
        <div>
          <h1>Meus arquivos</h1>
          <p>Envie e acompanhe os arquivos dos seus pedidos.</p>
        </div>
        <Link href="/">Voltar ao início</Link>
      </SCustomerPanelHeader>

      <SUploadCard aria-labelledby="upload-title">
        <h2 id="upload-title">Adicionar arquivos</h2>
        <p>Formatos permitidos: JPG, SVG, CDR, PDF e PNG. Até 5 MB por arquivo, com limite de 15 envios por dia.</p>
        <SDailyUsage>{dailyUploads} de {dailyLimit} envios usados hoje</SDailyUsage>
        <SUploadButton $disabled={uploadDisabled}>
          {uploadingName ? `Enviando ${uploadingName}…` : "Selecionar arquivos"}
          <input
            accept={ACCEPTED_FORMATS}
            disabled={uploadDisabled}
            multiple
            onChange={uploadFiles}
            ref={inputRef}
            type="file"
          />
        </SUploadButton>
        {notice && <SPanelNotice $error={noticeIsError} role="status">{notice}</SPanelNotice>}
      </SUploadCard>

      <SFileSection aria-labelledby="files-title">
        <h2 id="files-title">Arquivos da sua conta</h2>
        {isLoading && <SPanelNotice>Carregando arquivos…</SPanelNotice>}
        {!isLoading && files.length === 0 && <SPanelNotice>Você ainda não enviou arquivos.</SPanelNotice>}
        {files.map((file) => (
          <SFileRow key={file.id}>
            <div>
              <strong>{file.fileName}</strong>
              <span>
                {sizeLabel(file.sizeBytes)} · {dateLabel(file.createdAt)} · {file.status === "ready" ? "Disponível" : file.status === "deleting" ? "Removendo" : file.canComplete ? "Pronto para finalizar" : "Envio pendente"}
              </span>
            </div>
            <SFileActions>
              {file.status === "ready" && (
                <SFileAction
                  aria-label={`Baixar ${file.fileName}`}
                  disabled={busyFileId === file.id}
                  onClick={() => void downloadFile(file)}
                  type="button"
                >
                  <FaDownload aria-hidden="true" /> Baixar
                </SFileAction>
              )}
              {file.status === "pending" && file.canComplete && (
                <SFileAction
                  disabled={busyFileId === file.id}
                  onClick={() => void completeFile(file)}
                  type="button"
                >
                  Concluir envio
                </SFileAction>
              )}
              {file.status !== "uploading" && (
                <SFileAction
                  aria-label={`Excluir ${file.fileName}`}
                  disabled={busyFileId === file.id}
                  onClick={() => void deleteFile(file)}
                  type="button"
                >
                  <FaTrash aria-hidden="true" /> Excluir
                </SFileAction>
              )}
            </SFileActions>
          </SFileRow>
        ))}
      </SFileSection>
    </SCustomerPanel>
  );
}
