export const raw: (str: string) => string = (str: string): string => {
    return str.split('\n').join('<br>');
};

export const toPascalCase = (str: string): string => {
    if (str.length === 0) {
        return '';
    }
    return str[0].toUpperCase() + str.slice(1);
};

export const formatForCompany = (sentence: string, limit: number = 2): string => {
    if (sentence.length === 0) {
        return '';
    }

    return sentence
        .split(' ')
        .map((word: string): string => {
            if (word.length <= limit) {
                return word.toLowerCase();
            }
            return toPascalCase(word.toLowerCase());
        })
        .join(' ');
};
