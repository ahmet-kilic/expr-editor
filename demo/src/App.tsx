import { useState, useEffect, useMemo } from 'react'
import { ExprEditor, initWasm, isWasmReady } from 'package'
import { dracula } from '@uiw/codemirror-theme-dracula';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

function App() {
  const [code, setCode] = useState('user.Age > 18 && filter(tweets, .Len > 140)');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'dracula' | 'vscode'>('dark');
  const [result, setResult] = useState<string>('');
  const [wasmLoaded, setWasmLoaded] = useState(isWasmReady());

  useEffect(() => {
    if (!wasmLoaded) {
      initWasm()
        .then(() => setWasmLoaded(true))
        .catch(e => console.error("Failed to init wasm in demo", e));
    }
  }, [wasmLoaded]);

  useEffect(() => {
    if (themeMode === 'light') {
      document.body.style.backgroundColor = '#f4f4f4';
      document.body.style.color = '#333';
    } else {
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#e0e0e0';
    }
    document.body.style.margin = '0';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.margin = '';
    }
  }, [themeMode]);

  const [envJson, setEnvJson] = useState('{\n  "user": {\n    "Name": "string",\n    "Age": 18,\n    "IsAdmin": false\n  },\n  "tweets": [\n    {\n      "Text": "string",\n      "Len": 10\n    }\n  ]\n}');

  const environment = useMemo(() => {
    try {
      return JSON.parse(envJson);
    } catch {
      return null;
    }
  }, [envJson]);

  useEffect(() => {
    type RunExprFunc = (code: string, env: string) => { valid: boolean; result?: string; error?: string };
    const runExpr = (globalThis as unknown as { runExpr?: RunExprFunc }).runExpr;

    if (wasmLoaded && typeof runExpr === 'function') {
      try {
        const out = runExpr(code, JSON.stringify(environment || {}));
        if (out.valid) {
          setResult(out.result !== undefined ? String(out.result) : 'null');
        } else {
          setResult(`Error: ${out.error}`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setResult(`Execution Error: ${message}`);
      }
    } else {
      setResult('WASM not loaded yet...');
    }
  }, [code, environment, wasmLoaded]);

  const getTheme = () => {
    switch (themeMode) {
      case 'dracula': return dracula;
      case 'vscode': return vscodeDark;
      default: return themeMode; // 'light' or 'dark'
    }
  }

  const preStyles = themeMode === 'light'
    ? { background: '#fff', color: '#333', border: '1px solid #ddd' }
    : { background: '#1e1e1e', color: '#d4d4d4', border: '1px solid #333' };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', minHeight: '100vh', transition: 'background-color 0.3s' }}>
      <h1>Expr Code Editor Demo</h1>
      <p style={{ color: themeMode === 'light' ? '#666' : '#a0a0a0' }}>A WebAssembly-powered real-time linter and autocomplete editor for antonmedv/expr.</p>

      <div style={{ marginBottom: '20px' }}>
        <strong>Theme: </strong>
        <select
          value={themeMode}
          onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark' | 'dracula' | 'vscode')}
          style={{ padding: '5px', borderRadius: '4px', border: preStyles.border, background: preStyles.background, color: preStyles.color }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="dracula">Custom: Dracula</option>
          <option value="vscode">Custom: VS Code Dark</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Environment context (JSON):</strong>
        <textarea
          value={envJson}
          onChange={(e) => setEnvJson(e.target.value)}
          spellCheck={false}
          style={{ width: '100%', boxSizing: 'border-box', height: '150px', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', ...preStyles }}
        />
        {!environment && <div style={{ color: '#ff4444', marginTop: '5px' }}>Invalid JSON</div>}
      </div>

      <ExprEditor
        value={code}
        onChange={(val) => setCode(val)}
        environment={environment || {}}
        height="200px"
        theme={getTheme()}
      />

      <div style={{ marginTop: '20px' }}>
        <strong>Live Execution Result:</strong>
        <pre style={{ padding: '10px', borderRadius: '4px', ...preStyles, minHeight: '40px' }}>
          {result}
        </pre>
      </div>
    </div>
  )
}

export default App
