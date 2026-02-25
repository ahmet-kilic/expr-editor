import { Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { isWasmReady } from './wasmLoader';

export function getExprLinter(environmentJson?: string) {
    return (view: EditorView): Diagnostic[] => {
        if (!isWasmReady() || !globalThis.lintExpr) return [];

        const doc = view.state.doc.toString();
        if (!doc.trim()) return [];

        try {
            const result = globalThis.lintExpr(doc, environmentJson);

            if (!result.valid && result.error) {
                let lineIdx = (result.line || 1) - 1;
                if (lineIdx < 0) lineIdx = 0;
                if (lineIdx >= view.state.doc.lines) lineIdx = view.state.doc.lines - 1;

                const line = view.state.doc.line(lineIdx + 1);

                let colIdx = result.column || 0;
                let from = line.from + colIdx;
                let to = from + 1;

                if (result.snippet && result.snippet.trim()) {
                    const snippetIdx = line.text.indexOf(result.snippet.trim());
                    if (snippetIdx >= 0) {
                        from = line.from + snippetIdx;
                        to = from + result.snippet.trim().length;
                    } else {
                        to = line.to;
                    }
                } else {
                    to = line.to;
                }

                if (from >= to) from = Math.max(0, to - 1);

                return [{
                    from,
                    to,
                    severity: 'error',
                    message: result.error,
                }];
            }
        } catch (e) {
            console.error("WASM lintExpr error:", e);
        }

        return [];
    };
}
