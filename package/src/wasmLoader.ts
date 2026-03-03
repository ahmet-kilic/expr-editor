/// <reference path="./declarations.d.ts" />
// @ts-ignore
import './wasm_exec.js';
// @ts-ignore
import wasmBase64 from './expr-linter.wasm?raw';

let wasmInitializing: Promise<void> | null = null;
let wasmReady = false;

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Initializes the WebAssembly module for the expression linter.
 * It decodes the bundled base64 WASM binary and instantiates it.
 * This must be called and awaited before the linter can be used.
 * 
 * @returns A promise that resolves when the WASM module is fully loaded and running.
 */
export async function initWasm(): Promise<void> {
    if (wasmReady) return;
    if (!wasmInitializing) {
        wasmInitializing = new Promise<void>(async (resolve, reject) => {
            try {
                const go = new (globalThis as any).Go();
                const wasmBuffer = decodeBase64ToArrayBuffer(wasmBase64);

                const { instance } = await WebAssembly.instantiate(wasmBuffer, go.importObject);
                go.run(instance);
                wasmReady = true;
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
    return wasmInitializing;
}

/**
 * Checks if the WebAssembly module has been successfully loaded and is ready for use.
 * 
 * @returns True if the WASM module is ready, otherwise false.
 */
export function isWasmReady() {
    return wasmReady;
}
