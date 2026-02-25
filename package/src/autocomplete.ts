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
        for (const key in currentObj) {
            options.push({
                label: key,
                type: typeof currentObj[key] === 'function' ? 'function' : (typeof currentObj[key] === 'object' ? 'class' : 'property')
            });
        }

        if (parts.length === 1) {
            const builtins = ['len', 'filter', 'map', 'all', 'none', 'any', 'one'];
            builtins.forEach(b => {
                options.push({ label: b, type: 'function', info: 'Built-in expr function' });
            });
        }

        const lastPartLength = parts[parts.length - 1].length;
        const from = match.to - lastPartLength;

        return {
            from,
            options
        };
    };
}
