"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
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
  SArtworkFileBadge,
  SArtworkHeader,
  SArtworkLegend,
  SCalculateButton,
  SQuoteActions,
  SQuoteCard,
  SQuoteContact,
  SQuoteContactGrid,
  SQuoteContactHeading,
  SQuoteDimensions,
  SQuoteEngravings,
  SQuoteField,
  SQuoteForm,
  SQuoteHeading,
  SQuoteNotice,
  SQuotePreview,
  SQuotePreviewAmount,
  SQuotePreviewLabel,
  SQuotePreviewMessage,
  SQuoteSaveButton,
  SQuoteTopFields,
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

type ContactDraft = {
  name: string;
  company: string;
  phone: string;
  mobile: string;
  cnpj: string;
  title: string;
  message: string;
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
  customer?: Partial<ContactDraft>;
  requestType?: QuoteRequestType;
  hadFile?: boolean;
  // Compatibility with drafts written by the previous single-art form.
  logoWidthMm?: string;
  logoHeightMm?: string;
  colorCount?: string;
};

type QuotePricingPreview = {
  status: "calculated" | "manual-review";
  currency: "BRL";
  totalCents?: number;
  reason?: string;
};

type PreviewState =
  | { status: "idle"; key: string }
  | { status: "loading"; key: string }
  | { status: "calculated"; key: string; pricing: QuotePricingPreview }
  | { status: "manual-review"; key: string; pricing: QuotePricingPreview }
  | { status: "error"; key: string; message: string };

const acceptedFileExtensions = ["jpg", "svg", "cdr", "pdf", "png"];
const acceptedFileTypes = ".jpg,.svg,.cdr,.pdf,.png";
const maxFileBytes = 5_000_000;
const maxEngravings = 100;

const emptyCustomer: ContactDraft = {
  name: "",
  company: "",
  phone: "",
  mobile: "",
  cnpj: "",
  title: "",
  message: "",
};

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

function asCustomerDraft(input: Partial<ContactDraft> | undefined): ContactDraft {
  return {
    name: typeof input?.name === "string" ? input.name : "",
    company: typeof input?.company === "string" ? input.company : "",
    phone: typeof input?.phone === "string" ? input.phone : "",
    mobile: typeof input?.mobile === "string" ? input.mobile : "",
    cnpj: typeof input?.cnpj === "string" ? input.cnpj : "",
    title: typeof input?.title === "string" ? input.title : "",
    message: typeof input?.message === "string" ? input.message : "",
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
  const [customer, setCustomer] = useState<ContactDraft>(emptyCustomer);
  const [pricingPreview, setPricingPreview] = useState<PreviewState>({
    status: "idle",
    key: "",
  });
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

  const effectiveCustomer = useMemo(() => ({
    ...customer,
    name: customer.name || session?.user?.name || "",
  }), [customer, session?.user?.name]);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const stored = window.sessionStorage.getItem(draftStorageKey(service.slug));
        if (stored) {
          const draft = JSON.parse(stored) as StoredDraft;
          if (draft.product && service.products.includes(draft.product)) setProduct(draft.product);
          if (typeof draft.quantity === "string") setQuantity(draft.quantity);
          setCustomer(asCustomerDraft(draft.customer));

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

  const previewRequestBody = useMemo(() => {
    const validQuantity = Number.isSafeInteger(Number(quantity)) && Number(quantity) > 0;
    const completeEngravings = engravings.every((item) => (
      item.location.trim()
      && Number.isSafeInteger(Number(item.logoWidthMm))
      && Number(item.logoWidthMm) > 0
      && Number.isSafeInteger(Number(item.logoHeightMm))
      && Number(item.logoHeightMm) > 0
      && Number.isSafeInteger(Number(item.colorCount))
      && Number(item.colorCount) > 0
    ));

    if (!validQuantity || !completeEngravings || !product) return "";
    return JSON.stringify({
      serviceSlug: service.slug,
      serviceName: service.name,
      product,
      quantity: Number(quantity),
      engravings: engravings.map((item) => ({
        location: item.location,
        logoWidthMm: Number(item.logoWidthMm),
        logoHeightMm: Number(item.logoHeightMm),
        colorCount: Number(item.colorCount),
      })),
    });
  }, [engravings, product, quantity, service.name, service.slug]);

  useEffect(() => {
    if (!draftLoaded || !service.supportsPreQuote || !previewRequestBody) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setPricingPreview({ status: "loading", key: previewRequestBody });
      try {
        const response = await fetch("/api/quotes/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: previewRequestBody,
        });
        const result = await response.json().catch(() => ({})) as {
          error?: string;
          pricing?: QuotePricingPreview;
        };
        if (!response.ok || !result.pricing) {
          throw new Error(result.error || "Não foi possível calcular a prévia.");
        }
        if (result.pricing.status === "calculated") {
          setPricingPreview({ status: "calculated", key: previewRequestBody, pricing: result.pricing });
        } else {
          setPricingPreview({ status: "manual-review", key: previewRequestBody, pricing: result.pricing });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setPricingPreview({
          status: "error",
          key: previewRequestBody,
          message: error instanceof Error ? error.message : "Não foi possível calcular a prévia.",
        });
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [draftLoaded, previewRequestBody, service.supportsPreQuote]);

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
          customer: effectiveCustomer,
          product,
          quantity: Number(quantity),
          engravings: submittedEngravings,
        }),
      });
      const result = await response.json().catch(() => ({})) as {
        error?: string;
        number?: string;
        serviceName?: string;
        pricing?: QuotePricingPreview;
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
  }, [effectiveCustomer, engravings, product, quantity, service.name, service.slug, session?.user, updateEngraving]);

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
    const submitTimer = window.setTimeout(() => {
      setAccountMenuOpen(false);
      void submitRequest(pendingRequest);
    }, 0);
    return () => window.clearTimeout(submitTimer);
  }, [draftLoaded, engravings, session?.user, sessionPending, submitRequest]);

  function saveCurrentDraft(requestType?: QuoteRequestType) {
    window.sessionStorage.setItem(draftStorageKey(service.slug), JSON.stringify({
      product,
      quantity,
      customer,
      engravings: engravings.map((item) => ({
        id: item.id,
        location: item.location,
        logoWidthMm: item.logoWidthMm,
        logoHeightMm: item.logoHeightMm,
        colorCount: item.colorCount,
        fileId: item.fileId,
        hadFile: Boolean(item.file || item.fileId || item.needsReselect),
      })),
      ...(requestType ? { requestType } : {}),
    } satisfies StoredDraft));
  }

  function handleRequest(requestType: QuoteRequestType) {
    if (!formRef.current?.reportValidity()) return;
    setNotice("");
    setNoticeIsError(false);
    setWhatsAppUrl("");

    if (!session?.user) {
      pendingRequestRef.current = requestType;
      saveCurrentDraft(requestType);
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
    saveCurrentDraft();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (service.supportsPreQuote) handleRequest("automatic");
  }

  const previewIsCurrent = pricingPreview.key === previewRequestBody;
  const previewAmount = !service.supportsPreQuote
    ? "Sob consulta"
    : !previewRequestBody
      ? "—"
      : !previewIsCurrent || pricingPreview.status === "loading"
        ? "Calculando…"
        : pricingPreview.status === "calculated"
          ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
              .format((pricingPreview.pricing.totalCents ?? 0) / 100)
          : pricingPreview.status === "manual-review"
            ? "Sob consulta"
            : "—";
  const previewMessage = !service.supportsPreQuote
    ? "Este serviço será calculado pela equipe."
    : !previewRequestBody
      ? "Preencha a quantidade e os detalhes das gravações para ver o valor."
      : !previewIsCurrent || pricingPreview.status === "loading"
        ? "Calculando pré-orçamento…"
        : pricingPreview.status === "calculated"
          ? "Prévia calculada com base na tabela atual. O valor final será confirmado pela equipe."
          : pricingPreview.status === "manual-review"
            ? pricingPreview.pricing.reason || "A equipe finalizará o orçamento."
            : pricingPreview.status === "error"
              ? pricingPreview.message
              : "Preencha os dados da gravação para ver o valor.";

  return (
    <>
      <SQuoteCard aria-labelledby="service-quote-title">
        <SQuoteHeading>
          <h2 id="service-quote-title">Orçamento de {service.name}</h2>
          <p>Descreva cada arte para calcular ou solicitar seu orçamento.</p>
        </SQuoteHeading>

        <SQuoteForm onSubmit={handleSubmit} ref={formRef}>
          <SQuoteTopFields>
            <SQuoteField>
              Produto
              <select
                onChange={(event) => setProduct(event.target.value)}
                required
                value={product}
              >
                {service.products.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </SQuoteField>

            <SQuoteField>
              Quantidade de peças
              <input
                inputMode="numeric"
                max="100000"
                min="1"
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Digite a quantidade de produtos"
                required
                type="number"
                value={quantity}
              />
            </SQuoteField>
          </SQuoteTopFields>

          <SQuoteEngravings aria-label="Artes e gravações do pedido">
            {engravings.map((engraving, index) => (
              <SArtworkCard aria-label={`Gravação ${index + 1}`} key={engraving.id}>
                <SArtworkHeader>
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
                  <SArtworkLegend>Gravação {index + 1}</SArtworkLegend>
                </SArtworkHeader>

                <SQuoteUpload $disabled={isSubmitting}>
                  <strong>
                    <FaCloudUploadAlt aria-hidden="true" />
                    {uploadProgress.startsWith(`Arte ${index + 1}:`) || uploadProgress.startsWith(`Enviando arte ${index + 1}:`)
                      ? uploadProgress
                      : engraving.file?.name || (engraving.fileId ? "Arte enviada" : "Anexe sua arte")}
                  </strong>
                  <span>Máximo 5 MB · 1 arquivo por gravação · até 15 arquivos por dia</span>
                  <span>CDR · SVG · PDF · JPG · PNG</span>
                  <input
                    accept={acceptedFileTypes}
                    aria-label={`Anexar arte da gravação ${index + 1}`}
                    disabled={isSubmitting}
                    onChange={(event) => selectFile(event, engraving.id)}
                    type="file"
                  />
                </SQuoteUpload>
                {(engraving.file || engraving.fileId) && (
                  <SArtworkFileBadge aria-label="Arte anexada">
                    {engraving.file?.name.split(".").pop()?.toUpperCase() || "ARTE"}
                  </SArtworkFileBadge>
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

                <SQuoteDimensions>
                  <SQuoteField>
                    Largura do logo (mm)
                    <input
                      max={maxLogoWidthMm}
                      min="1"
                      onChange={(event) => updateEngraving(engraving.id, { logoWidthMm: event.target.value })}
                      placeholder={productLogoLimits?.maxWidthMm
                        ? `Máx. ${productLogoLimits.maxWidthMm} mm`
                        : "Digite a largura em mm"}
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
                      placeholder={`Máx. ${maxLogoHeightMm} mm`}
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

          <SQuotePreview aria-live="polite" aria-atomic="true">
            <SQuotePreviewLabel>Pré orçamento</SQuotePreviewLabel>
            <SQuotePreviewAmount>{service.supportsPreQuote ? previewAmount : "Sob consulta"}</SQuotePreviewAmount>
            <SQuotePreviewMessage>{service.supportsPreQuote
              ? previewMessage
              : "Este serviço será calculado pela equipe."}</SQuotePreviewMessage>
          </SQuotePreview>

          <SQuoteContact aria-labelledby="quote-contact-title">
            <SQuoteContactHeading id="quote-contact-title">Seus dados</SQuoteContactHeading>
            <SQuoteContactGrid>
              <SQuoteField>
                Nome
                <input
                  autoComplete="name"
                  maxLength={120}
                  onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Digite o seu nome"
                  required
                value={customer.name || session?.user?.name || ""}
                />
              </SQuoteField>
              <SQuoteField>
                Empresa
                <input
                  autoComplete="organization"
                  maxLength={160}
                  onChange={(event) => setCustomer((current) => ({ ...current, company: event.target.value }))}
                  placeholder="Digite o nome da empresa"
                  value={customer.company}
                />
              </SQuoteField>
              <SQuoteField>
                Telefone
                <input
                  autoComplete="tel"
                  maxLength={32}
                  onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Digite seu número"
                  required={!customer.mobile.trim()}
                  type="tel"
                  value={customer.phone}
                />
              </SQuoteField>
              <SQuoteField>
                Celular
                <input
                  autoComplete="tel-national"
                  maxLength={32}
                  onChange={(event) => setCustomer((current) => ({ ...current, mobile: event.target.value }))}
                  placeholder="Digite seu número"
                  required={!customer.phone.trim()}
                  type="tel"
                  value={customer.mobile}
                />
              </SQuoteField>
              <SQuoteField>
                CNPJ
                <input
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={18}
                  onChange={(event) => setCustomer((current) => ({ ...current, cnpj: event.target.value }))}
                  placeholder="Digite seu CNPJ"
                  value={customer.cnpj}
                />
              </SQuoteField>
              <SQuoteField>
                Título
                <input
                  maxLength={160}
                  onChange={(event) => setCustomer((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Adicione um título para o orçamento"
                  required
                  value={customer.title}
                />
              </SQuoteField>
            </SQuoteContactGrid>
            <SQuoteField>
              Mensagem
              <textarea
                maxLength={3000}
                onChange={(event) => setCustomer((current) => ({ ...current, message: event.target.value }))}
                placeholder="Adicione detalhes e observações"
                required
                value={customer.message}
              />
            </SQuoteField>
          </SQuoteContact>

          {!service.supportsPreQuote && (
            <SWhatsAppQuoteButton
              disabled={isSubmitting || !draftLoaded || sessionPending}
              onClick={() => handleRequest("whatsapp")}
              type="button"
            >
              <FaWhatsapp aria-hidden="true" />
              Pedir orçamento pelo WhatsApp
            </SWhatsAppQuoteButton>
          )}

          <SQuoteActions>
            <SQuoteSaveButton
              disabled={!draftLoaded || isSubmitting}
              onClick={() => {
                saveCurrentDraft();
                setNotice("Rascunho salvo nesta sessão.");
                setNoticeIsError(false);
                setWhatsAppUrl("");
              }}
              type="button"
            >
              Salvar
            </SQuoteSaveButton>
            <SCalculateButton
              $unavailable={!service.supportsPreQuote}
              aria-disabled={!service.supportsPreQuote ? "true" : undefined}
              disabled={isSubmitting || !service.supportsPreQuote || !draftLoaded || sessionPending}
              type={service.supportsPreQuote ? "submit" : "button"}
            >
              {isSubmitting ? "Enviando pedido..." : service.supportsPreQuote ? "Gerar pedido" : "Calcular orçamento"}
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
