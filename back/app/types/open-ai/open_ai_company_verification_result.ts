import { OpenAiResponseFieldEnum } from '#types/open-ai/open_ai_response_field_enum';

export interface OpenAiCompanyVerificationResult {
    match: boolean;
    confidence: number;
    fields: {
        name?: OpenAiResponseFieldEnum | 'minor_diff';
        siret?: OpenAiResponseFieldEnum;
        address?: OpenAiResponseFieldEnum | 'minor_diff';
        email?: OpenAiResponseFieldEnum | 'missing_in_document';
        phone?: OpenAiResponseFieldEnum | 'missing_in_document';
    };
    extracted: {
        name?: string;
        siret?: string;
        address?: string;
        email?: string;
        phone?: string;
    };
}
