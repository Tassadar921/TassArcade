export type OpenAiRequestContent = {
    model: string;
    messages: {
        role: string;
        content: {
            type: string;
            text?: string;
            image_url?: {
                url: string;
                detail: string;
            };
        }[];
    }[];
    max_tokens: number;
};
