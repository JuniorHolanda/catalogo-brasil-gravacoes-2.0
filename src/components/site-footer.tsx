import type { IconType } from "react-icons";
import {
  FaEnvelope,
  FaIdCard,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import {
  SFooter,
  SFooterBrand,
  SFooterContacts,
  SFooterMain,
  SFooterSignature,
  SFooterItem,
  SFooterLink,
  SFooterLogo,
} from "@/styles/site-footer.styles";

type FooterContact = {
  label: string;
  Icon: IconType;
  href?: string;
  external?: boolean;
  separated?: boolean;
};

const footerContacts: FooterContact[] = [
  {
    label: "brasil.gravacoes",
    Icon: FaInstagram,
    href: "https://www.instagram.com/brasil.gravacoes/",
    external: true,
  },
  {
    label: "vendas@brasilgravacoes.com.br",
    Icon: FaEnvelope,
    href: "mailto:vendas@brasilgravacoes.com.br",
  },
  {
    label: "11 32270968",
    Icon: FaPhoneAlt,
    href: "tel:+551132270968",
  },
  { label: "1459.6587.0001-45", Icon: FaIdCard, separated: true },
  { label: "R. Mauá - Nº 1200 - Luz - São Paulo - SP", Icon: FaMapMarkerAlt },
];

/** Apresenta a marca e os canais de contato no rodapé do site. */
export function SiteFooter() {
  return (
    <SFooter aria-label="Informações de contato da Brasil Gravações">
      <SFooterMain>
        <SFooterBrand href="/" aria-label="Brasil Gravações, início">
          <SFooterLogo>BRASIL</SFooterLogo>
          <SFooterLogo>GRAVAÇÕES</SFooterLogo>
        </SFooterBrand>

        <SFooterContacts>
          {footerContacts.map(({ label, Icon, href, external, separated }) => {
            const content = (
              <>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </>
            );

            return href ? (
              <SFooterLink
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                data-separated={separated ? "" : undefined}
              >
                {content}
              </SFooterLink>
            ) : (
              <SFooterItem key={label} data-separated={separated ? "" : undefined}>
                {content}
              </SFooterItem>
            );
          })}
        </SFooterContacts>
      </SFooterMain>

      <SFooterSignature type="paragraph" size="sm" weight={500}>
        Desenvolvido por Pedro de Holanda
      </SFooterSignature>
    </SFooter>
  );
}
