//go:build js && wasm

package main

import (
	"syscall/js"
)

func lintExpr(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return map[string]any{
			"valid": false,
			"error": "Invalid arguments: expected expression",
		}
	}
	code := args[0].String()
	envJson := ""

	if len(args) > 1 && args[1].Type() == js.TypeString {
		envJson = args[1].String()
	}

	return lintInternal(code, envJson)
}

func runExpr(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return map[string]any{
			"valid": false,
			"error": "Invalid arguments: expected expression",
		}
	}
	code := args[0].String()
	envJson := ""

	if len(args) > 1 && args[1].Type() == js.TypeString {
		envJson = args[1].String()
	}

	return runInternal(code, envJson)
}

func main() {
	c := make(chan struct{})
	js.Global().Set("lintExpr", js.FuncOf(lintExpr))
	js.Global().Set("runExpr", js.FuncOf(runExpr))
	<-c
}
