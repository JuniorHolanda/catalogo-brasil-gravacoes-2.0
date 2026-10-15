import { Text } from "@/components/text";
import {
  SCompanyValues,
  SCompanyValuesItem,
  SCompanyValuesList,
} from "@/styles/company-values.styles";

const companyValues = [
  "Qualidade em cada etapa do processo",
  "Compromisso com o cliente",
  "Criatividade e inovação",
  "Produção consciente",
  "Transparência e ética",
];

/** Apresenta a missão, a visão e os valores que orientam o trabalho da empresa. */
export function CompanyValues() {
  return (
    <SCompanyValues aria-labelledby="company-mission-title">
      <SCompanyValuesItem>
        <Text
          type="title"
          headingLevel="h2"
          size="md"
          weight={700}
          id="company-mission-title"
        >
          Missão
        </Text>
        <Text type="paragraph" size="lg" weight={400}>
          Oferecer soluções criativas em estamparia, unindo técnica, qualidade e
          atenção aos detalhes para entregar produtos que representem a identidade
          de cada cliente.
        </Text>
      </SCompanyValuesItem>

      <SCompanyValuesItem>
        <Text type="title" headingLevel="h2" size="md" weight={700}>
          Visão
        </Text>
        <Text type="paragraph" size="lg" weight={400}>
          Ser referência em serigrafia criativa e produção independente,
          reconhecida pela originalidade, consistência e compromisso com cada
          projeto.
        </Text>
      </SCompanyValuesItem>

      <SCompanyValuesItem>
        <Text type="title" headingLevel="h2" size="md" weight={700}>
          Valores
        </Text>
        <SCompanyValuesList>
          {companyValues.map((value) => (
            <li key={value}>
              <Text type="paragraph" size="lg" weight={400}>
                {value}
              </Text>
            </li>
          ))}
        </SCompanyValuesList>
      </SCompanyValuesItem>
    </SCompanyValues>
  );
}
