import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ExprEditor',
      fileName: (format) => `expr-editor.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@uiw/react-codemirror', '@codemirror/state', '@codemirror/view', '@codemirror/language', '@codemirror/lint', '@codemirror/autocomplete'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@uiw/react-codemirror': 'CodeMirror',
          '@codemirror/lint': 'CMLint',
          '@codemirror/autocomplete': 'CMAutocomplete',
          '@codemirror/language': 'CMLanguage',
          '@codemirror/state': 'CMState',
          '@codemirror/view': 'CMView'
        }
      }
    }
  },
  plugins: [
    dts(),
    {
      name: 'inline-wasm',
      enforce: 'pre',
      resolveId(source, importer) {
        if (source.endsWith('.wasm?raw')) {
          if (importer && source.startsWith('.')) {
            return path.resolve(path.dirname(importer), source);
          }
          return source;
        }
      },
      load(id) {
        if (id.endsWith('.wasm?raw')) {
          const filePath = id.replace('?raw', '');
          const buffer = readFileSync(filePath);
          const base64 = buffer.toString('base64');
          return `export default "${base64}";`;
        }
      }
    }
  ]
});
