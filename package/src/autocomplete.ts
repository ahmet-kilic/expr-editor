import { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';

export function getExprAutocomplete(environment: Record<string, any>) {
    return (context: CompletionContext): CompletionResult | null => {
        let match = context.matchBefore(/[\w.\[\]'"]*/);
        if (!match || (match.from === match.to && !context.explicit)) return null;

        const text = match.text;
        if (text.endsWith(']')) return null;

        const normalizedText = text.replace(/\[['"]?([^'"\[\]]+)['"]?\]/g, '.$1');
        const parts = normalizedText.split('.');

        let currentObj = environment;
        let pathFound = true;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (currentObj && typeof currentObj === 'object' && part in currentObj) {
                currentObj = currentObj[part];
            } else {
                pathFound = false;
                break;
            }
        }

        if (!pathFound || !currentObj || typeof currentObj !== 'object') return null;

        const options: Completion[] = [];
        const isArray = Array.isArray(currentObj);

        // Arrays in expr do not have string properties (methods or attributes), 
        // they are accessed via `arr[0]` or global functions like `len(arr)`.
        if (!isArray) {
            for (const key in currentObj) {
                const val = currentObj[key];
                let type = 'property';
                let detail: string = typeof val;

                if (typeof val === 'function') {
                    type = 'function';
                    detail = 'func';
                } else if (typeof val === 'object') {
                    type = 'class';
                    detail = Array.isArray(val) ? 'array' : 'object';
                }

                options.push({
                    label: key,
                    type,
                    detail
                });
            }
        }

        if (parts.length === 1) {
            const builtins: Record<string, { signature: string, info: string }> = {
                len: { signature: 'len(any) int', info: 'Return length of an array, a map or a string.' },
                filter: { signature: 'filter(collection, predicate) []any', info: 'Filter a collection by a predicate.' },
                map: { signature: 'map(collection, closure) []any', info: 'Map a collection with a closure.' },
                all: { signature: 'all(collection, predicate) bool', info: 'Return true if all elements satisfy the predicate.' },
                none: { signature: 'none(collection, predicate) bool', info: 'Return true if all elements no elements satisfy the predicate.' },
                any: { signature: 'any(collection, predicate) bool', info: 'Return true if any element satisfies the predicate.' },
                one: { signature: 'one(collection, predicate) bool', info: 'Return true if exactly one element satisfies the predicate.' },
                count: { signature: 'count(collection, predicate) int', info: 'Returns the number of elements that satisfy the predicate.' },
                trim: { signature: 'trim(str[, chars]) string', info: 'Removes white spaces from both ends of a string.' },
                trimPrefix: { signature: 'trimPrefix(str, prefix) string', info: 'Removes the specified prefix from the string.' },
                trimSuffix: { signature: 'trimSuffix(str, suffix) string', info: 'Removes the specified suffix from the string.' },
                upper: { signature: 'upper(str) string', info: 'Converts all the characters in string to uppercase.' },
                lower: { signature: 'lower(str) string', info: 'Converts all the characters in string to lowercase.' },
                split: { signature: 'split(str, delimiter[, n]) []string', info: 'Splits the string at each instance of the delimiter.' },
                splitAfter: { signature: 'splitAfter(str, delimiter[, n]) []string', info: 'Splits the string after each instance of the delimiter.' },
                replace: { signature: 'replace(str, old, new) string', info: 'Replaces all occurrences of old in string with new.' },
                repeat: { signature: 'repeat(str, n) string', info: 'Repeats the string n times.' },
                indexOf: { signature: 'indexOf(str, substring) int', info: 'Returns the index of the first occurrence of the substring.' },
                lastIndexOf: { signature: 'lastIndexOf(str, substring) int', info: 'Returns the index of the last occurrence of the substring.' },
                hasPrefix: { signature: 'hasPrefix(str, prefix) bool', info: 'Returns true if string starts with the given prefix.' },
                hasSuffix: { signature: 'hasSuffix(str, suffix) bool', info: 'Returns true if string ends with the given suffix.' },
                now: { signature: 'now() time.Time', info: 'Returns the current date.' },
                duration: { signature: 'duration(str) time.Duration', info: 'Returns time.Duration value of the given string.' },
                date: { signature: 'date(str[, format[, timezone]]) time.Time', info: 'Converts the given string into a date representation.' },
                timezone: { signature: 'timezone(str) time.Location', info: 'Returns the timezone of the given string.' },
                max: { signature: 'max(n1, n2) float', info: 'Returns the maximum of the two numbers.' },
                min: { signature: 'min(n1, n2) float', info: 'Returns the minimum of the two numbers.' },
                abs: { signature: 'abs(n) float', info: 'Returns the absolute value of a number.' },
                ceil: { signature: 'ceil(n) float', info: 'Returns the least integer value greater than or equal to x.' },
                floor: { signature: 'floor(n) float', info: 'Returns the greatest integer value less than or equal to x.' },
                round: { signature: 'round(n) float', info: 'Returns the nearest integer, rounding half away from zero.' },
                find: { signature: 'find(array, predicate) any', info: 'Finds the first element in an array that satisfies the predicate.' },
                findIndex: { signature: 'findIndex(array, predicate) int', info: 'Finds the index of the first element in an array that satisfies the predicate.' },
                findLast: { signature: 'findLast(array, predicate) any', info: 'Finds the last element in an array that satisfies the predicate.' },
                findLastIndex: { signature: 'findLastIndex(array, predicate) int', info: 'Finds the index of the last element in an array that satisfies the predicate.' },
                groupBy: { signature: 'groupBy(array, predicate) map', info: 'Groups the elements of an array by the result of the predicate.' },
                concat: { signature: 'concat(array1, array2[, ...]) []any', info: 'Concatenates two or more arrays.' },
                flatten: { signature: 'flatten(array) []any', info: 'Flattens given array into one-dimensional array.' },
                uniq: { signature: 'uniq(array) []any', info: 'Removes duplicates from an array.' },
                join: { signature: 'join(array[, delimiter]) string', info: 'Joins an array of strings into a single string.' },
                reduce: { signature: 'reduce(array, predicate[, initialValue]) any', info: 'Applies a predicate to each element in the array, reducing the array to a single value.' },
                sum: { signature: 'sum(array[, predicate]) float', info: 'Returns the sum of all numbers in the array.' },
                mean: { signature: 'mean(array) float', info: 'Returns the average of all numbers in the array.' },
                median: { signature: 'median(array) float', info: 'Returns the median of all numbers in the array.' },
                first: { signature: 'first(array) any', info: 'Returns the first element from an array.' },
                last: { signature: 'last(array) any', info: 'Returns the last element from an array.' },
                take: { signature: 'take(array, n) []any', info: 'Returns the first n elements from an array.' },
                reverse: { signature: 'reverse(array) []any', info: 'Return new reversed copy of the array.' },
                sort: { signature: 'sort(array[, order]) []any', info: 'Sorts an array in ascending order.' },
                sortBy: { signature: 'sortBy(array[, predicate, order]) []any', info: 'Sorts an array by the result of the predicate.' },
                keys: { signature: 'keys(map) []string', info: 'Returns an array containing the keys of the map.' },
                values: { signature: 'values(map) []any', info: 'Returns an array containing the values of the map.' },
                type: { signature: 'type(v) string', info: 'Returns the type of the given value.' },
                int: { signature: 'int(v) int', info: 'Returns the integer value of a number or a string.' },
                float: { signature: 'float(v) float', info: 'Returns the float value of a number or a string.' },
                string: { signature: 'string(v) string', info: 'Converts the given value into a string representation.' },
                toJSON: { signature: 'toJSON(v) string', info: 'Converts the given value to its JSON string representation.' },
                fromJSON: { signature: 'fromJSON(v) any', info: 'Parses the given JSON string and returns the corresponding value.' },
                toBase64: { signature: 'toBase64(v) string', info: 'Encodes the string into Base64 format.' },
                fromBase64: { signature: 'fromBase64(v) string', info: 'Decodes the Base64 encoded string back to its original form.' },
                toPairs: { signature: 'toPairs(map) [][]any', info: 'Converts a map to an array of key-value pairs.' },
                fromPairs: { signature: 'fromPairs(array) map', info: 'Converts an array of key-value pairs to a map.' },
                get: { signature: 'get(v, index) any', info: 'Retrieves the element at the specified index from an array or map.' },
                bitand: { signature: 'bitand(int, int) int', info: 'Returns the values resulting from the bitwise AND operation.' },
                bitor: { signature: 'bitor(int, int) int', info: 'Returns the values resulting from the bitwise OR operation.' },
                bitxor: { signature: 'bitxor(int, int) int', info: 'Returns the values resulting from the bitwise XOR operation.' },
                bitnand: { signature: 'bitnand(int, int) int', info: 'Returns the values resulting from the bitwise AND NOT operation.' },
                bitnot: { signature: 'bitnot(int) int', info: 'Returns the values resulting from the bitwise NOT operation.' },
                bitshl: { signature: 'bitshl(int, int) int', info: 'Returns the values resulting from the Left Shift operation.' },
                bitshr: { signature: 'bitshr(int, int) int', info: 'Returns the values resulting from the Right Shift operation.' },
                bitushr: { signature: 'bitushr(int, int) int', info: 'Returns the values resulting from the unsigned Right Shift operation.' }
            };

            for (const [key, b] of Object.entries(builtins)) {
                options.push({
                    label: key,
                    type: 'function',
                    detail: b.signature.replace(key, ''),
                    info: b.info
                });
            }

            const keywords = [
                'true', 'false', 'nil', 'null', 'in', 'not',
                'and', 'or', 'contains', 'startsWith', 'endsWith', 'matches', 'let'
            ];
            for (const kw of keywords) {
                options.push({
                    label: kw,
                    type: 'keyword'
                });
            }
        }

        const lastPartLength = parts[parts.length - 1].length;
        const from = match.to - lastPartLength;

        return {
            from,
            options
        };
    };
}
