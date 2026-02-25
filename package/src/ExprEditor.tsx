import React, { useEffect, useState, useMemo } from 'react';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { linter, lintGutter } from '@codemirror/lint';
import { autocompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { getExprLinter } from './linter';
import { getExprAutocomplete } from './autocomplete';
import { initWasm, isWasmReady } from './wasmLoader';

export interface ExprEditorProps extends Omit<ReactCodeMirrorProps, 'extensions'> {
    environment?: Record<string, any>;
}

export const ExprEditor: React.FC<ExprEditorProps> = ({
    environment = {},
    ...props
}) => {
    const [wasmLoaded, setWasmLoaded] = useState(isWasmReady());

    useEffect(() => {
        if (!wasmLoaded) {
            initWasm()
                .then(() => setWasmLoaded(true))
                .catch(e => console.error("Failed to load expr wasm", e));
        }
    }, [wasmLoaded]);

    const envJson = useMemo(() => JSON.stringify(environment), [environment]);

    const extensions = useMemo(() => {
        let parsedEnv = {};
        try {
            parsedEnv = JSON.parse(envJson);
        } catch (e) { }

        return [
            javascript(),
            lintGutter(),
            linter(getExprLinter(envJson), { delay: 300 }),
            autocompletion({ override: [getExprAutocomplete(parsedEnv)] })
        ];
    }, [envJson, wasmLoaded]);

    return (
        <div className="expr-editor-wrapper" style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <CodeMirror
                {...props}
                extensions={extensions}
            />
        </div>
    );
};
