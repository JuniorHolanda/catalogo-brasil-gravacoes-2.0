"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence } from "motion/react";
import { FaCloudUploadAlt, FaTrashAlt, FaWhatsapp } from "react-icons/fa";
import { AccountMenu } from "@/components/account-menu";
import { authClient } from "@/lib/auth-client";
import { uploadCustomerFile } from "@/lib/customer-file-upload";
import { createWhatsAppLink } from "@/lib/whatsapp";
import type { AccountUser } from "@/lib/account";
import {
  SAddEngravingButton,
  SArtworkCard,
  SArtworkLegend,
  SCalculateButton,
  SProductOption,
  SProductOptions,
  SQuoteActions,
  SQuoteCard,
  SQuoteDimensions,
  SQuoteEngravings,
  SQuoteField,
  SQuoteForm,
  SQuoteHeading,
  SQuoteNotice,
  SQuoteUpload,
  SRemoveEngravingButton,
  SWhatsAppQuoteButton,
} from "@/styles/service-order.styles";

type ServiceOrderFormProps = {
  service: {
    slug: string;
    name: string;
    supportsPreQuote: boolean;
    products: string[];
    productLogoLimits?: Record<string, { maxWidthMm: number | null; maxHeightMm: number }>;
  };
};

type QuoteRequestType = "automatic" | "whatsapp";

type EngravingDraft = {
  id: string;
  location: string;
  logoWidthMm: string;
  logoHeightMm: string;
  colorCount: string;
  file: File | null;
  fileId: string;
  needsReselect: boolean;
};

type StoredEngravingDraft = {
  id?: string;
  location?: string;
  logoWidthMm?: string;
  logoHeightMm?: string;
  colorCount?: string;
  fileId?: string;
  hadFile?: boolean;
};

type StoredDraft = {
  product?: string;
  quantity?: string;
  engravings?: StoredEngravingDraft[];
  requestType?: QuoteRequestType;
  hadFile?: boolean;
  // Compatibility with drafts written by the previous single-art form.
  logoWidthMm?: string;
  logoHeightMm?: string;
  colorCount?: string;
};

const acceptedFileExtensions = ["jpg", "svg", "cdr", "pdf", "png"];
const acceptedFileTypes = ".jpg,.svg,.cdr,.pdf,.png";
const maxFileBytes = 5_000_000;
const maxEngravings = 100;

function draftStorageKey(slug: string) {
  return `brasil-gravacoes:service-quote:${slug}`;
}

function createEngravingDraft(id: string): EngravingDraft {
  return {
    id,
    location: "Frente",
    logoWidthMm: "",
    logoHeightMm: "",
    colorCount: "1",
    file: null,
    fileId: "",
    needsReselect: false,
  };
}

export function ServiceOrderForm({ service }: ServiceOrderFormProps) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const pendingRequestRef = useRef<QuoteRequestType | null>(null);
  const submissionStartedRef = useRef(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [product, setProduct] = useState(service.products[0] ?? "");
  const [quantity, setQuantity] = useState("");
  const [engravings, setEngravings] = useState<EngravingDraft[]>([
    createEngravingDraft("engraving-1"),
  ]);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeIsError, setNoticeIsError] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const productLogoLimits = service.productLogoLimits?.[product];
  const maxLogoWidthMm = productLogoLimits?.maxWidthMm ?? 1_000;
  const maxLogoHeightMm = productLogoLimits?.maxHeightMm ?? 1_000;

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

          const savedEngravings = Array.isArray(draft.engravings) && draft.engravings.length > 0
            ? draft.engravings
            : [{
                id: "engraving-1",
                location: "Frente",
                logoWidthMm: draft.logoWidthMm,
                logoHeightMm: draft.logoHeightMm,
                colorCount: draft.colorCount,
                hadFile: draft.hadFile,
              }];
          const restoredEngravings = savedEngravings.slice(0, maxEngravings).map((item, index) => ({
            ...createEngravingDraft(item.id || `engraving-${index + 1}`),
            location: typeof item.location === "string" ? item.location : "Frente",
            logoWidthMm: typeof item.logoWidthMm === "string" ? item.logoWidthMm : "",
            logoHeightMm: typeof item.logoHeightMm === "string" ? item.logoHeightMm : "",
            colorCount: typeof item.colorCount === "string" ? item.colorCount : "1",
            fileId: typeof item.fileId === "string" ? item.fileId : "",
            needsReselect: Boolean(item.hadFile || item.fileId),
          }));
          setEngravings(restoredEngravings);
          if (restoredEngravings.some((item) => item.needsReselect)) {
            setNotice("Por segurança, selecione novamente cada arte anexada depois de entrar.");
          }
          if (draft.requestType === "automatic" || draft.requestType === "whatsapp") {
            pendingRequestRef.current = draft.requestType;
            setAccountMenuOpen(true);
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

  const updateEngraving = useCallback((id: string, patch: Partial<EngravingDraft>) => {
    setEngravings((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }, []);

  const submitRequest = useCallback(async (requestType: QuoteRequestType) => {
    if (!session?.user || submissionStartedRef.current) return;
    if (!formRef.current?.reportValidity()) return;
    submissionStartedRef.current = true;
    setIsSubmitting(true);
    setNotice("");
    setNoticeIsError(false);
    setWhatsAppUrl("");

    try {
      const submittedEngravings = [];
      for (const [index, engraving] of engravings.entries()) {
        let attachedFileId = engraving.fileId;
        if (engraving.file && !attachedFileId) {
          setUploadProgress(`Enviando arte ${index + 1}: ${engraving.file.name}`);
          attachedFileId = await uploadCustomerFile(engraving.file, (part, total) => {
            setUploadProgress(`Arte ${index + 1}: ${part}/${total}`);
          });
          updateEngraving(engraving.id, { fileId: attachedFileId });
        }

        submittedEngravings.push({
          location: engraving.location,
          logoWidthMm: Number(engraving.logoWidthMm),
          logoHeightMm: Number(engraving.logoHeightMm),
          colorCount: Number(engraving.colorCount),
          ...(attachedFileId ? { fileId: attachedFileId } : {}),
        });
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
          engravings: submittedEngravings,
        }),
      });
      const result = await response.json().catch(() => ({})) as {
        error?: string;
        number?: string;
        serviceName?: string;
        pricing?: {
          status?: "calculated" | "manual-review";
          currency?: "BRL";
          totalCents?: number;
          reason?: string;
        };
      };
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar o orçamento.");

      const total = result.pricing?.status === "calculated" && typeof result.pricing.totalCents === "number"
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
            .format(result.pricing.totalCents / 100)
        : null;
      const pricingMessage = total
        ? ` Total calculado: ${total}.`
        : ` ${result.pricing?.reason || "A equipe finalizará o orçamento."}`;
      setNotice(requestType === "whatsapp"
        ? `Pedido ${result.number} registrado para ${result.serviceName}. Continue pelo WhatsApp.${pricingMessage}`
        : total
          ? `Orçamento ${result.number} de ${result.serviceName}: ${total}.`
          : `Pedido ${result.number} de ${result.serviceName} registrado para análise.${pricingMessage}`);
      setNoticeIsError(false);
      if (requestType === "whatsapp") {
        setWhatsAppUrl(createWhatsAppLink(result.serviceName || service.name, result.number));
      }
      window.sessionStorage.removeItem(draftStorageKey(service.slug));
      pendingRequestRef.current = null;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível enviar o orçamento.");
      setNoticeIsError(true);
    } finally {
      submissionStartedRef.current = false;
      setIsSubmitting(false);
      setUploadProgress("");
    }
  }, [engravings, product, quantity, service.name, service.slug, session?.user, updateEngraving]);

  useEffect(() => {
    if (!draftLoaded || sessionPending || !session?.user) return;
    const pendingRequest = pendingRequestRef.current;
    if (!pendingRequest) return;

    if (engravings.some((item) => item.needsReselect)) {
      const reselectTimer = window.setTimeout(() => {
        setAccountMenuOpen(false);
        setNotice("Selecione novamente cada arte que deseja anexar para continuar.");
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
  }, [draftLoaded, engravings, service.slug, session?.user, sessionPending, submitRequest]);

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
        engravings: engravings.map((item) => ({
          id: item.id,
          location: item.location,
          logoWidthMm: item.logoWidthMm,
          logoHeightMm: item.logoHeightMm,
          colorCount: item.colorCount,
          hadFile: Boolean(item.file || item.fileId || item.needsReselect),
        })),
        requestType,
      } satisfies StoredDraft));
      setAccountMenuOpen(true);
      return;
    }

    if (engravings.some((item) => item.needsReselect)) {
      setNotice("Selecione novamente cada arte anexada para continuar.");
      setNoticeIsError(true);
      return;
    }

    pendingRequestRef.current = null;
    void submitRequest(requestType);
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>, engravingId: string) {
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
      setNotice("Cada arte pode ter até 5 MB.");
      setNoticeIsError(true);
      return;
    }

    updateEngraving(engravingId, {
      file: selectedFile,
      fileId: "",
      needsReselect: false,
    });
    setNotice("");
    setNoticeIsError(false);
  }

  function addEngraving() {
    if (engravings.length >= maxEngravings) return;
    setEngravings((current) => [
      ...current,
      createEngravingDraft(`engraving-${crypto.randomUUID()}`),
    ]);
  }

  function removeEngraving(id: string) {
    setEngravings((current) => current.length > 1 ? current.filter((item) => item.id !== id) : current);
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

          <SQuoteEngravings aria-label="Artes e gravações do pedido">
            {engravings.map((engraving, index) => (
              <SArtworkCard key={engraving.id}>
                <SArtworkLegend>Gravação {index + 1}</SArtworkLegend>
                {engravings.length > 1 && (
                  <SRemoveEngravingButton
                    aria-label={`Remover gravação ${index + 1}`}
                    disabled={isSubmitting}
                    onClick={() => removeEngraving(engraving.id)}
                    type="button"
                  >
                    <FaTrashAlt aria-hidden="true" />
                    Remover
                  </SRemoveEngravingButton>
                )}

                <SQuoteField>
                  Lado ou local da gravação
                  <input
                    maxLength={80}
                    onChange={(event) => updateEngraving(engraving.id, { location: event.target.value })}
                    placeholder="Ex.: frente, verso ou lateral"
                    required
                    value={engraving.location}
                  />
                </SQuoteField>

                <SQuoteUpload $disabled={isSubmitting}>
                  <strong>
                    <FaCloudUploadAlt aria-hidden="true" /> {uploadProgress.startsWith(`Arte ${index + 1}:`) || uploadProgress.startsWith(`Enviando arte ${index + 1}:`)
                      ? uploadProgress
                      : engraving.file?.name || (engraving.fileId ? "Arte enviada" : "Anexe sua arte")}
                  </strong>
                  <span>JPG, SVG, CDR, PDF ou PNG · até 5 MB · 1 por gravação · 15 arquivos por dia</span>
                  <input
                    accept={acceptedFileTypes}
                    disabled={isSubmitting}
                    onChange={(event) => selectFile(event, engraving.id)}
                    type="file"
                  />
                </SQuoteUpload>

                <SQuoteDimensions>
                  <SQuoteField>
                    Largura do logo (mm)
                    <input
                      max={maxLogoWidthMm}
                      min="1"
                      onChange={(event) => updateEngraving(engraving.id, { logoWidthMm: event.target.value })}
                      placeholder={productLogoLimits?.maxWidthMm
                        ? `Máx. ${productLogoLimits.maxWidthMm} mm`
                        : "Ex.: 70 mm"}
                      required
                      type="number"
                      value={engraving.logoWidthMm}
                    />
                  </SQuoteField>
                  <SQuoteField>
                    Altura do logo (mm)
                    <input
                      max={maxLogoHeightMm}
                      min="1"
                      onChange={(event) => updateEngraving(engraving.id, { logoHeightMm: event.target.value })}
                      placeholder={productLogoLimits
                        ? `Máx. ${productLogoLimits.maxHeightMm} mm`
                        : "Ex.: 60 mm"}
                      required
                      type="number"
                      value={engraving.logoHeightMm}
                    />
                  </SQuoteField>
                </SQuoteDimensions>

                <SQuoteField>
                  Quantidade de cores
                  <input
                    max="16"
                    min="1"
                    onChange={(event) => updateEngraving(engraving.id, { colorCount: event.target.value })}
                    required
                    type="number"
                    value={engraving.colorCount}
                  />
                </SQuoteField>
              </SArtworkCard>
            ))}
            <SAddEngravingButton
              disabled={isSubmitting || engravings.length >= maxEngravings}
              onClick={addEngraving}
              type="button"
            >
              + gravação
            </SAddEngravingButton>
          </SQuoteEngravings>

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

          {engravings.some((item) => item.needsReselect) && !session?.user && (
            <SQuoteNotice role="status">Depois de entrar, selecione novamente cada arte que deseja anexar.</SQuoteNotice>
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
