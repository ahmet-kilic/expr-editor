import React, { useEffect, useState, useMemo } from 'react';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { linter, lintGutter } from '@codemirror/lint';
import { autocompletion } from '@codemirror/autocomplete';
import { expr } from './language';
import { getExprLinter } from './linter';
import { getExprAutocomplete } from './autocomplete';
import { initWasm, isWasmReady } from './wasmLoader';

/**
 * Props for the ExprEditor component.
 * Extends ReactCodeMirrorProps but omits 'extensions' as it is managed internally.
 */
export interface ExprEditorProps extends Omit<ReactCodeMirrorProps, 'extensions'> {
    /**
     * The evaluation environment consisting of variables and functions.
     * This defines what autocomplete and linting features will recognize.
     */
    environment?: Record<string, any>;
}

/**
 * A React component that provides a CodeMirror editor configured for the 'expr' language.
 * Includes syntax highlighting, linting via WebAssembly, and autocompletion based on the provided environment.
 * 
 * @param props - The component props including the environment objects.
 * @returns A React CodeMirror instance tailored for expr expressions.
 */
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
            expr(),
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
