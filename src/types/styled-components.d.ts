import "styled-components";
import type { AppTheme } from "../styles/theme";

declare module "styled-components" {
  // Module augmentation precisa estender a interface do pacote sem declarar membros extras.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
