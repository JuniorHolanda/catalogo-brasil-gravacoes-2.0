"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence } from "motion/react";
import { FaCloudUploadAlt, FaWhatsapp } from "react-icons/fa";
import { AccountMenu } from "@/components/account-menu";
import { authClient } from "@/lib/auth-client";
import { uploadCustomerFile } from "@/lib/customer-file-upload";
import { createWhatsAppLink } from "@/lib/whatsapp";
import type { AccountUser } from "@/lib/account";
import {
  SCalculateButton,
  SProductOption,
  SProductOptions,
  SQuoteActions,
  SQuoteCard,
  SQuoteDimensions,
  SQuoteField,
  SQuoteForm,
  SQuoteHeading,
  SQuoteNotice,
  SQuoteUpload,
  SWhatsAppQuoteButton,
} from "@/styles/service-order.styles";

type ServiceOrderFormProps = {
  service: {
    slug: string;
    name: string;
    supportsPreQuote: boolean;
    products: string[];
  };
};

type QuoteRequestType = "automatic" | "whatsapp";

type StoredDraft = {
  product?: string;
  quantity?: string;
  logoWidthMm?: string;
  logoHeightMm?: string;
  colorCount?: string;
  requestType?: QuoteRequestType;
  hadFile?: boolean;
};

const acceptedFileExtensions = ["jpg", "svg", "cdr", "pdf", "png"];
const acceptedFileTypes = ".jpg,.svg,.cdr,.pdf,.png";
const maxFileBytes = 5_000_000;

function draftStorageKey(slug: string) {
  return `brasil-gravacoes:service-quote:${slug}`;
}

export function ServiceOrderForm({ service }: ServiceOrderFormProps) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const pendingRequestRef = useRef<QuoteRequestType | null>(null);
  const submissionStartedRef = useRef(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [product, setProduct] = useState(service.products[0] ?? "");
  const [quantity, setQuantity] = useState("");
  const [logoWidthMm, setLogoWidthMm] = useState("");
  const [logoHeightMm, setLogoHeightMm] = useState("");
  const [colorCount, setColorCount] = useState("1");
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState("");
  const [needsReselect, setNeedsReselect] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeIsError, setNoticeIsError] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");

  const user: AccountUser | null = session?.user
    ? {
        name: session.user.name || session.user.email,
        email: session.user.email,
        profileImageUrl: session.user.image || undefined,
        recentOrders: [],
      }
    : null;

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const stored = window.sessionStorage.getItem(draftStorageKey(service.slug));
        if (stored) {
          const draft = JSON.parse(stored) as StoredDraft;
          if (draft.product && service.products.includes(draft.product)) setProduct(draft.product);
          if (typeof draft.quantity === "string") setQuantity(draft.quantity);
          if (typeof draft.logoWidthMm === "string") setLogoWidthMm(draft.logoWidthMm);
          if (typeof draft.logoHeightMm === "string") setLogoHeightMm(draft.logoHeightMm);
          if (typeof draft.colorCount === "string") setColorCount(draft.colorCount);
          if (draft.requestType === "automatic" || draft.requestType === "whatsapp") {
            pendingRequestRef.current = draft.requestType;
            setAccountMenuOpen(true);
          }
          if (draft.hadFile) {
            setNeedsReselect(true);
            setNotice("Entre para continuar. Por segurança, selecione sua arte novamente depois do acesso.");
          }
        }
      } catch {
        window.sessionStorage.removeItem(draftStorageKey(service.slug));
      } finally {
        setDraftLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [service.products, service.slug]);

  const submitRequest = useCallback(async (requestType: QuoteRequestType) => {
    if (!session?.user || submissionStartedRef.current) return;
    if (!formRef.current?.reportValidity()) return;
    submissionStartedRef.current = true;
    setIsSubmitting(true);
    setNotice("");
    setNoticeIsError(false);
    setWhatsAppUrl("");

    try {
      let attachedFileId = fileId;
      if (file && !attachedFileId) {
        setUploadProgress(`Enviando ${file.name}`);
        attachedFileId = await uploadCustomerFile(file, (part, total) => {
          setUploadProgress(`Enviando ${file.name} (${part}/${total})`);
        });
        setFileId(attachedFileId);
      }

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: service.slug,
          serviceName: service.name,
          requestType,
          product,
          quantity: Number(quantity),
          logoWidthMm: Number(logoWidthMm),
          logoHeightMm: Number(logoHeightMm),
          colorCount: Number(colorCount),
          ...(attachedFileId ? { fileId: attachedFileId } : {}),
        }),
      });
      const result = await response.json().catch(() => ({})) as {
        error?: string;
        number?: string;
        serviceName?: string;
      };
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar o orçamento.");

      setNotice(requestType === "whatsapp"
        ? `Pedido ${result.number} registrado para ${result.serviceName}. Continue pelo WhatsApp.`
        : `Pedido ${result.number} de ${result.serviceName} registrado para análise.`);
      setNoticeIsError(false);
      if (requestType === "whatsapp") {
        setWhatsAppUrl(createWhatsAppLink(result.serviceName || service.name, result.number));
      }
      window.sessionStorage.removeItem(draftStorageKey(service.slug));
      pendingRequestRef.current = null;
      setNeedsReselect(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível enviar o orçamento.");
      setNoticeIsError(true);
    } finally {
      submissionStartedRef.current = false;
      setIsSubmitting(false);
      setUploadProgress("");
    }
  }, [colorCount, file, fileId, logoHeightMm, logoWidthMm, product, quantity, service.name, service.slug, session?.user]);

  useEffect(() => {
    if (!draftLoaded || sessionPending || !session?.user) return;
    const pendingRequest = pendingRequestRef.current;
    if (!pendingRequest) return;

    if (needsReselect) {
      const reselectTimer = window.setTimeout(() => {
        setAccountMenuOpen(false);
        setNotice("Selecione novamente sua arte para continuar com o pedido.");
      }, 0);
      return () => window.clearTimeout(reselectTimer);
    }

    pendingRequestRef.current = null;
    window.sessionStorage.removeItem(draftStorageKey(service.slug));
    const submitTimer = window.setTimeout(() => {
      setAccountMenuOpen(false);
      void submitRequest(pendingRequest);
    }, 0);
    return () => window.clearTimeout(submitTimer);
  }, [draftLoaded, needsReselect, service.slug, session?.user, sessionPending, submitRequest]);

  function handleRequest(requestType: QuoteRequestType) {
    if (!formRef.current?.reportValidity()) return;
    setNotice("");
    setNoticeIsError(false);
    setWhatsAppUrl("");

    if (!session?.user) {
      pendingRequestRef.current = requestType;
      window.sessionStorage.setItem(draftStorageKey(service.slug), JSON.stringify({
        product,
        quantity,
        logoWidthMm,
        logoHeightMm,
        colorCount,
        requestType,
        hadFile: Boolean(file || fileId),
      } satisfies StoredDraft));
      setAccountMenuOpen(true);
      return;
    }

    pendingRequestRef.current = null;
    if (needsReselect) {
      setNeedsReselect(false);
      setFile(null);
      setFileId("");
    }
    void submitRequest(requestType);
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!extension || !acceptedFileExtensions.includes(extension)) {
      setNotice("Escolha um arquivo JPG, SVG, CDR, PDF ou PNG.");
      setNoticeIsError(true);
      return;
    }
    if (selectedFile.size < 1 || selectedFile.size > maxFileBytes) {
      setNotice("A arte precisa ter até 5 MB.");
      setNoticeIsError(true);
      return;
    }

    setFile(selectedFile);
    setFileId("");
    setNeedsReselect(false);
    setNotice("");
    setNoticeIsError(false);
  }

  function closeAccountMenu() {
    setAccountMenuOpen(false);
    pendingRequestRef.current = null;
    window.sessionStorage.removeItem(draftStorageKey(service.slug));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (service.supportsPreQuote) handleRequest("automatic");
  }

  return (
    <>
      <SQuoteCard aria-labelledby="service-quote-title">
        <SQuoteHeading>
          <div>
            <h2 id="service-quote-title">Monte seu pedido</h2>
            <p>Informe os detalhes para solicitar um orçamento de {service.name}.</p>
          </div>
        </SQuoteHeading>

        <SQuoteForm onSubmit={handleSubmit} ref={formRef}>
          <div>
            <SQuoteField as="div">Produto</SQuoteField>
            <SProductOptions aria-label="Selecione o produto">
              {service.products.map((item) => (
                <SProductOption
                  aria-pressed={product === item}
                  key={item}
                  onClick={() => setProduct(item)}
                  type="button"
                  $selected={product === item}
                >
                  {item}
                </SProductOption>
              ))}
            </SProductOptions>
          </div>

          <SQuoteField>
            Quantidade de peças
            <input
              max="100000"
              min="1"
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Digite a quantidade de produtos"
              required
              type="number"
              value={quantity}
            />
          </SQuoteField>

          <SQuoteUpload $disabled={isSubmitting}>
            <strong><FaCloudUploadAlt aria-hidden="true" /> {uploadProgress || file?.name || "Anexe sua arte"}</strong>
            <span>JPG, SVG, CDR, PDF ou PNG · até 5 MB · até 15 arquivos por dia</span>
            <input
              accept={acceptedFileTypes}
              disabled={isSubmitting}
              onChange={selectFile}
              type="file"
            />
          </SQuoteUpload>

          <SQuoteDimensions>
            <SQuoteField>
              Largura do logo (mm)
              <input
                max="1000"
                min="1"
                onChange={(event) => setLogoWidthMm(event.target.value)}
                placeholder="Ex.: 70 mm"
                required
                type="number"
                value={logoWidthMm}
              />
            </SQuoteField>
            <SQuoteField>
              Altura do logo (mm)
              <input
                max="1000"
                min="1"
                onChange={(event) => setLogoHeightMm(event.target.value)}
                placeholder="Ex.: 60 mm"
                required
                type="number"
                value={logoHeightMm}
              />
            </SQuoteField>
          </SQuoteDimensions>

          <SQuoteField>
            Quantidade de cores
            <input
              max="16"
              min="1"
              onChange={(event) => setColorCount(event.target.value)}
              required
              type="number"
              value={colorCount}
            />
          </SQuoteField>

          <SQuoteActions>
            {!service.supportsPreQuote && (
              <SWhatsAppQuoteButton
                disabled={isSubmitting || !draftLoaded}
                onClick={() => handleRequest("whatsapp")}
                type="button"
              >
                <FaWhatsapp aria-hidden="true" />
                Pedir orçamento pelo WhatsApp
              </SWhatsAppQuoteButton>
            )}
            <SCalculateButton
              $unavailable={!service.supportsPreQuote}
              aria-disabled={!service.supportsPreQuote ? "true" : undefined}
              disabled={isSubmitting || !service.supportsPreQuote || !draftLoaded}
              type="submit"
            >
              {isSubmitting ? "Enviando pedido..." : "Calcular orçamento"}
            </SCalculateButton>
          </SQuoteActions>

          {needsReselect && !session?.user && (
            <SQuoteNotice role="status">Depois de entrar, selecione novamente a arte que deseja anexar.</SQuoteNotice>
          )}
          {notice && <SQuoteNotice $error={noticeIsError} role="status">
            {notice}
            {whatsAppUrl && <> <a href={whatsAppUrl} rel="noopener noreferrer" target="_blank">Abrir WhatsApp</a></>}
          </SQuoteNotice>}
        </SQuoteForm>
      </SQuoteCard>

      <AnimatePresence initial={false}>
        {accountMenuOpen && (
          <AccountMenu
            initialAuthMode="signUp"
            onClose={closeAccountMenu}
            standalone
            user={user}
          />
        )}
      </AnimatePresence>
    </>
  );
}
