# Expr Editor Monorepo

Welcome to the `expr-editor` workspace! This project bridges the [antonmedv/expr](https://github.com/expr-lang/expr) Go evaluation engine with a React-ready `CodeMirror` frontend utilizing WebAssembly.

## Workspace Structure

This repo is structured as an npm workspace monorepo with three main directories:

- `/package`: The core React Component library (`npm install expr-editor`). It exports the `ExprEditor` UI piece along with CodeMirror extensions like autocomplete, linting, and WASM fetching logic.
- `/demo`: A minimal Vite + React application that consumes the local `/package` component. Useful for local development and testing. 
- `/wasm`: Go source files and tests representing the core lexer/parser logic that compiles down to the required `expr-linter.wasm` file.

## Getting Started

Because this is a monorepo, you can manage both the `package` and `demo` dependencies from the root directory. 

### 1. Installation

Install all dependencies for both the library and the demo simultaneously:

```bash
npm install
```

### 2. Building

Build the package and the demo simultaneously:

```bash
npm run build
```

This ensures TypeScript compiles to CommonJS/ES Modules inside `/package`, and the Demo app binds to the fresh build.

### 3. Running the Demo locally

Once the package is built, you can run the local demo:

```bash
npm run dev
```

Visit the provided URL (typically `http://localhost:5200` or `http://localhost:5173`) to view the interactive editor.

### 4. Running Tests

Run the testing suites across the workspaces:

```bash
npm test
```
*(This triggers Vitest inside the `package` workspace)*

To run the Go WebAssembly core tests, navigate to the `/wasm` folder and run standard Go commands:
```bash
cd wasm
go test -v ./...
```

## Compilation (Go to WASM)

If you modify the Go logic inside `/wasm`, you will need to re-compile the `expr-linter.wasm` binary and place it in the package's public directory. 

From the `/wasm` folder, run:
```bash
GOOS=js GOARCH=wasm go build -o ../package/public/expr-linter.wasm main.go core.go
```
