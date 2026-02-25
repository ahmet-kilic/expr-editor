import { describe, it, expect } from 'vitest';
import { getExprAutocomplete } from '../autocomplete';
import { CompletionContext } from '@codemirror/autocomplete';

describe('getExprAutocomplete', () => {
    const environment = {
        user: {
            Name: "string",
            Age: 18,
            IsAdmin: false,
            Address: {
                City: "string"
            }
        },
        tweets: [
            { Text: "string", Len: 10 }
        ],
    };

    const autocomplete = getExprAutocomplete(environment);

    const createMockContext = (text: string, explicit = true): CompletionContext => {
        return {
            state: { doc: { length: text.length } },
            pos: text.length,
            explicit,
            matchBefore: (regex: RegExp) => {
                const match = text.match(new RegExp(regex.source + '$'));
                if (match) {
                    return { from: text.length - match[0].length, to: text.length, text: match[0] };
                }
                return null;
            }
        } as unknown as CompletionContext;
    };

    it('should return top-level variables when completing empty string', () => {
        const context = createMockContext('');
        const result = autocomplete(context);

        expect(result).not.toBeNull();
        const labels = result!.options.map(o => o.label);
        expect(labels).toContain('user');
        expect(labels).toContain('tweets');
        expect(labels).toContain('len'); // built-in function
        expect(labels).toContain('filter');
    });

    it('should complete properties of an object', () => {
        const context = createMockContext('user.');
        const result = autocomplete(context);

        expect(result).not.toBeNull();
        const labels = result!.options.map(o => o.label);
        expect(labels).toContain('Name');
        expect(labels).toContain('Age');
        expect(labels).toContain('IsAdmin');
        expect(labels).toContain('Address');
        expect(labels).not.toContain('user');
        expect(labels).not.toContain('len'); // built-in function shouldn't be here
    });

    it('should complete nested properties', () => {
        const context = createMockContext('user.Address.');
        const result = autocomplete(context);

        expect(result).not.toBeNull();
        const labels = result!.options.map(o => o.label);
        expect(labels).toContain('City');
        expect(labels.length).toBe(1);
    });

    it('should return null for unknown paths', () => {
        const context = createMockContext('user.Unknown.');
        const result = autocomplete(context);
        expect(result).toBeNull();
    });
});
