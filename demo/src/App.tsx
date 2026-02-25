import { useState, useEffect, useMemo } from 'react'
import { ExprEditor } from 'package'
import { dracula } from '@uiw/codemirror-theme-dracula';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

function App() {
  const [code, setCode] = useState('user.Age > 18 && filter(tweets, .Len > 140)');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'dracula' | 'vscode'>('dark');
  const [result, setResult] = useState<string>('');

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

  const environment = useMemo(() => ({
    user: {
      Name: "string",
      Age: 18,
      IsAdmin: false
    },
    tweets: [
      { Text: "string", Len: 10 }
    ],
  }), []);

  useEffect(() => {
    if (typeof (globalThis as any).runExpr === 'function') {
      try {
        const out = (globalThis as any).runExpr(code, JSON.stringify(environment));
        if (out.valid) {
          setResult(out.result !== undefined ? out.result : 'null');
        } else {
          setResult(`Error: ${out.error}`);
        }
      } catch (err: any) {
        setResult(`Execution Error: ${err.message || String(err)}`);
      }
    } else {
      setResult('WASM not loaded yet...');
    }
  }, [code, environment]);

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
          onChange={(e) => setThemeMode(e.target.value as any)}
          style={{ padding: '5px', borderRadius: '4px', border: preStyles.border, background: preStyles.background, color: preStyles.color }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="dracula">Custom: Dracula</option>
          <option value="vscode">Custom: VS Code Dark</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Environment context:</strong>
        <pre style={{ padding: '10px', borderRadius: '4px', ...preStyles }}>
          {JSON.stringify(environment, null, 2)}
        </pre>
      </div>

      <ExprEditor
        value={code}
        onChange={(val) => setCode(val)}
        environment={environment}
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
