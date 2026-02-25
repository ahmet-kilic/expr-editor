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
  plugins: [dts()]
});
