import { OpenAiRequestHeader } from '#types/open-ai/open_ai_request_header';
import { OpenAiRequestContent } from '#types/open-ai/open_ai_request_content';
import env from '#start/env';
import { OpenAiCompanyVerificationResult } from '#types/open-ai/open_ai_company_verification_result';

interface CompanyVerificationInput {
    name: string;
    siret: string;
    address: string;
    email?: string;
    phone?: string;
    documents: {
        mimeType: string;
        data: string; // base64 data URL (PDF or image)
    }[];
}

export default class OpenAiApiService {
    private headers: OpenAiRequestHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.get('OPENAI_API_KEY')}`,
    };

    private content: OpenAiRequestContent = {
        model: env.get('OPENAI_API_MODEL'),
        messages: [],
        max_tokens: 2048,
    };

    public async verifyCompanyDocument({ name, siret, address, email, phone, documents }: CompanyVerificationInput): Promise<OpenAiCompanyVerificationResult | null> {
        this.content.messages = [
            {
                role: 'system',
                content: [
                    {
                        type: 'text',
                        text: `
                            You are an assistant that validates business documents (like French Kbis or INPI certificates).

                            1. Extract key company details from the uploaded document ONLY (name, SIRET, address, email, phone).
                            2. Compare them with the following user-provided company data:
                               - Name: ${name}
                               - SIRET: ${siret}
                               - Address: ${address}
                               - Email: ${email ?? 'Not provided'}
                               - Phone: ${phone ?? 'Not provided'}
                            3. Be tolerant to minor differences in names and addresses (accents, abbreviations, "SARL"/"S.A.R.L.", punctuation, capitalization).
                            4. If no matching data is found in the document, set "match" to false and "confidence" to 0.
                            5. Respond strictly with a JSON object following this structure ONLY:

                            {
                              "match": boolean,
                              "confidence": number (0–1),
                              "fields": {
                                "name": "ok" | "minor_diff" | "mismatch",
                                "siret": "ok" | "mismatch",
                                "address": "ok" | "minor_diff" | "mismatch",
                                "email": "ok" | "missing_in_document" | "mismatch",
                                "phone": "ok" | "missing_in_document" | "mismatch"
                              },
                              "extracted": {
                                "name": string,
                                "siret": string,
                                "address": string,
                                "email": string,
                                "phone": string
                              }
                            }

                            Ensure your response is pure JSON, with no markdown, comments, or extra text.
                        `,
                    },
                ],
            },
            {
                role: 'user',
                content: [],
            },
        ];

        for (const document of documents) {
            if (!document.data.startsWith('data:')) {
                throw new Error('400: Invalid file format – must be a base64 data URL (image or PDF).');
            }

            this.content.messages[1].content.push({
                type: 'image_url',
                image_url: {
                    url: document.data,
                    detail: 'high',
                },
            });
        }

        try {
            const response: Response = await fetch(env.get('OPENAI_API_URL'), {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(this.content),
            });

            if (!response.ok) {
                console.error('OpenAI API error', await response.text());
                return null;
            }

            const data = await response.json();
            let raw = data.choices?.[0]?.message?.content ?? '';
            raw = raw.replace(/```json|```/g, '').trim();

            return JSON.parse(raw) as OpenAiCompanyVerificationResult;
        } catch (err) {
            console.error('OpenAI parsing or network error:', err);
            return null;
        }
    }
}
