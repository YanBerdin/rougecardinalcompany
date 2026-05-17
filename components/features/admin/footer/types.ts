import type { FooterConfigDTO, FooterConfigFormValues } from "@/lib/schemas/footer-config";

export interface FooterConfigViewProps {
    initialConfig: FooterConfigDTO;
}

export interface FooterConfigFormProps {
    initialConfig: FooterConfigFormValues;
}
