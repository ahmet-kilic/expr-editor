import { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';

export function getExprAutocomplete(environment: Record<string, any>) {
    return (context: CompletionContext): CompletionResult | null => {
        let match = context.matchBefore(/[\w.]*/);
        if (!match || (match.from === match.to && !context.explicit)) return null;

        const text = match.text;
        const parts = text.split('.');

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
                none: { signature: 'none(collection, predicate) bool', info: 'Return true if all elements does not satisfy the predicate.' },
                any: { signature: 'any(collection, predicate) bool', info: 'Return true if any element satisfy the predicate.' },
                one: { signature: 'one(collection, predicate) bool', info: 'Return true if exactly one element satisfy the predicate.' },
                count: { signature: 'count(collection, predicate) int', info: 'Returns the number of elements that satisfy the predicate.' }
            };

            for (const [key, b] of Object.entries(builtins)) {
                options.push({
                    label: key,
                    type: 'function',
                    detail: b.signature.replace(key, ''),
                    info: b.info
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
