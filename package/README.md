# Expr Editor

A WebAssembly-powered real-time linter and autocomplete code editor for the Go [antonmedv/expr](https://github.com/expr-lang/expr) library, built for React.

It uses CodeMirror internally, offering seamless performance and exact semantics directly matching the actual Go execution engine.

## Installation

```sh
npm install expr-editor
```
*Note: Make sure `react` and `react-dom` are installed as they are peer dependencies.*

## Usage in React

The `ExprEditor` component requires zero configuration! Just pass in the variables of the expression as the `environment` prop to provide contextual autocomplete and linting!

```tsx
import { useState } from 'react';
import { ExprEditor } from 'expr-editor';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

function App() {
  const [code, setCode] = useState('user.Age > 18 && filter(tweets, .Len > 140)');

  // Your expression environment
  const environment = {
    user: {
      Name: "string",
      Age: 18,
      IsAdmin: false
    },
    tweets: [
      { Text: "string", Len: 10 }
    ],
  };

  return (
    <ExprEditor
      value={code}
      onChange={(val) => setCode(val)}
      environment={environment}
      height="200px"
      theme={vscodeDark}
    />
  );
}

export default App;
```

## Props

The `ExprEditor` accepts all standard `@uiw/react-codemirror` props, with two main additions:

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `environment` | `Record<string, any>` | `{}` | The variables mapping object that provides code completion paths and typing hints to the Go linter. |

## Global Variables

Once initialized, you can use the loaded global expression evaluators anywhere:

```ts
import { isWasmReady } from 'expr-editor';

if (isWasmReady() && globalThis.runExpr) {
   const output = globalThis.runExpr('user.Age > 18', JSON.stringify({ user: { Age: 25 } }));
   console.log(output); // { valid: true, result: 'true' }
}
```
