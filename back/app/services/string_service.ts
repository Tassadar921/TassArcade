export default class StringService {
    /**
     * Capitalizes the first letter of a string.
     *
     * @param {string} str - The input string to be capitalized.
     * @returns {string} A capitalized version of the input string.
     */
    public capitalize(str: string): string {
        if (!str) {
            return '';
        }

        return str[0].toUpperCase() + str.slice(1);
    }

    /**
     * Converts a string to snake_case.
     *
     * @param {string} str - The input string to convert.
     * @returns {string} The snake_cased string.
     */
    public toSnakeCase(str: string): string {
        if (!str) {
            return '';
        }

        return str
            .split('.')
            .map((part: string): string =>
                part
                    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
                    .replace(/[\s-]+/g, '_')
                    .replace(/[^\w_]/g, '')
                    .toLowerCase()
            )
            .join('.');
    }
}
