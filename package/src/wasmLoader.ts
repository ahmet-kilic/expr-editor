/// <reference path="./declarations.d.ts" />
// @ts-ignore
import './wasm_exec.js';

let wasmInitializing: Promise<void> | null = null;
let wasmReady = false;

export async function initWasm(wasmUrl: string): Promise<void> {
    if (wasmReady) return;
    if (!wasmInitializing) {
        wasmInitializing = new Promise<void>(async (resolve, reject) => {
            try {
                const go = new (globalThis as any).Go();

                let response;
                if (typeof fetch !== 'undefined') {
                    response = await fetch(wasmUrl);
                } else {
                    throw new Error('fetch is not defined. Cannot load WASM.');
                }

                const { instance } = await WebAssembly.instantiateStreaming(response, go.importObject);
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

export function isWasmReady() {
    return wasmReady;
}
