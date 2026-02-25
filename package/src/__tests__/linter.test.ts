import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getExprLinter } from '../linter';
import { EditorView } from '@codemirror/view';
import * as wasmLoader from '../wasmLoader';

describe('getExprLinter', () => {
    let mockIsWasmReady: any;

    beforeEach(() => {
        mockIsWasmReady = vi.spyOn(wasmLoader, 'isWasmReady').mockReturnValue(true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete (globalThis as any).lintExpr;
    });

    const createMockView = (text: string): EditorView => {
        return {
            state: {
                doc: {
                    toString: () => text,
                    lines: text.split('\n').length,
                    line: (n: number) => {
                        const lines = text.split('\n');
                        const lineText = lines[n - 1] || '';
                        let offset = 0;
                        for (let i = 0; i < n - 1; i++) {
                            offset += lines[i].length + 1;
                        }
                        return { number: n, from: offset, to: offset + lineText.length, text: lineText };
                    }
                }
            }
        } as unknown as EditorView;
    };

    it('should return empty diagnostics if wasm is not ready', () => {
        mockIsWasmReady.mockReturnValue(false);
        const linter = getExprLinter('{}');
        const view = createMockView('user.Age > 18');
        expect(linter(view)).toEqual([]);
    });

    it('should return empty diagnostics for valid code', () => {
        (globalThis as any).lintExpr = vi.fn().mockReturnValue({ valid: true });
        const linter = getExprLinter('{}');
        const view = createMockView('user.Age > 18');

        const result = linter(view);
        expect(result).toEqual([]);
        expect((globalThis as any).lintExpr).toHaveBeenCalledWith('user.Age > 18', '{}');
    });

    it('should map go expr file errors to codemirror diagnostics', () => {
        (globalThis as any).lintExpr = vi.fn().mockReturnValue({
            valid: false,
            error: "unknown name foo",
            line: 1,
            column: 0,
            snippet: "foo"
        });

        const linter = getExprLinter('{}');
        const view = createMockView('foo > 18');
        const result = linter(view);

        expect(result.length).toBe(1);
        expect(result[0].message).toBe('unknown name foo');
        expect(result[0].severity).toBe('error');
        expect(result[0].from).toBe(0); // 'foo' starts at 0
        expect(result[0].to).toBe(3);   // 'foo' length is 3
    });

    it('should map generic errors to the entire line', () => {
        (globalThis as any).lintExpr = vi.fn().mockReturnValue({
            valid: false,
            error: "generic error",
        }); // no line/col provided

        const linter = getExprLinter('{}');
        const view = createMockView('invalid code snippet');
        const result = linter(view);

        expect(result.length).toBe(1);
        expect(result[0].message).toBe('generic error');
        expect(result[0].from).toBe(0);
        expect(result[0].to).toBe(20); // to end of line
    });
});
