# Expr Editor Demo

This is a Vite + React application demonstrating the usage of the [`expr-editor`](../package) component.

## How to Run

Before running the demo, ensure you have built the core `expr-editor` package.

### 1. Build the Package

Navigate to the `package` directory and build the library. This will generate the necessary ES modules and TypeScript declarations:

```bash
cd ../package
npm install
npm run build
```

*(Note: Building the package is required because the demo links to the `package` directory locally via `file:../package`.)*

### 2. Start the Demo

Install the dependencies for the demo application and start the Vite development server:

```bash
npm install
npm run dev
```

The application will typically be available at `http://localhost:5173` (or another port specified by Vite). Open it in your browser to see the real-time CodeMirror expression editor in action!
