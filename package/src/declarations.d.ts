declare class Go {
    importObject: any;
    run(instance: WebAssembly.Instance): Promise<void>;
}

declare function lintExpr(code: string, envJson?: string): {
    valid: boolean;
    error?: string;
    line?: number;
    column?: number;
    snippet?: string;
};

declare function runExpr(code: string, envJson?: string): {
    valid: boolean;
    error?: string;
    result?: string;
};
