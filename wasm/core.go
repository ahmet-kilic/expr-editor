package main

import (
	"encoding/json"

	"github.com/expr-lang/expr"
	"github.com/expr-lang/expr/file"
)

var (
	lastLintEnvJson string
	cachedLintEnv   map[string]interface{}

	lastRunEnvJson string
	cachedRunEnv   map[string]interface{}
)

func lintInternal(code string, envJson string) map[string]any {
	var env map[string]interface{}

	if envJson != "" {
		if envJson == lastLintEnvJson {
			env = cachedLintEnv
		} else {
			err := json.Unmarshal([]byte(envJson), &env)
			if err != nil {
				return map[string]any{
					"valid":  false,
					"error":  "Failed to parse environment JSON: " + err.Error(),
					"line":   1,
					"column": 0,
				}
			}
			lastLintEnvJson = envJson
			cachedLintEnv = env
		}
	} else {
		lastLintEnvJson = ""
		cachedLintEnv = nil
	}

	options := []expr.Option{}
	if env != nil {
		options = append(options, expr.Env(env))
	}

	_, err := expr.Compile(code, options...)
	if err != nil {
		if fileErr, ok := err.(*file.Error); ok {
			return map[string]any{
				"valid":   false,
				"error":   fileErr.Message,
				"line":    fileErr.Line,
				"column":  fileErr.Column,
				"snippet": fileErr.Snippet,
			}
		}
		return map[string]any{
			"valid":   false,
			"error":   err.Error(),
			"line":    1,
			"column":  0,
			"snippet": "",
		}
	}

	return map[string]any{
		"valid": true,
	}
}

func runInternal(code string, envJson string) map[string]any {
	var env map[string]interface{}

	if envJson != "" {
		if envJson == lastRunEnvJson {
			env = cachedRunEnv
		} else {
			err := json.Unmarshal([]byte(envJson), &env)
			if err != nil {
				return map[string]any{
					"valid": false,
					"error": "Failed to parse environment JSON: " + err.Error(),
				}
			}
			lastRunEnvJson = envJson
			cachedRunEnv = env
		}
	} else {
		lastRunEnvJson = ""
		cachedRunEnv = nil
	}

	options := []expr.Option{}
	if env != nil {
		options = append(options, expr.Env(env))
	}

	program, err := expr.Compile(code, options...)
	if err != nil {
		return map[string]any{
			"valid": false,
			"error": err.Error(),
		}
	}

	output, err := expr.Run(program, env)
	if err != nil {
		return map[string]any{
			"valid": false,
			"error": err.Error(),
		}
	}

	outBytes, err := json.Marshal(output)
	if err != nil {
		return map[string]any{
			"valid":  true,
			"result": nil,
		}
	}

	return map[string]any{
		"valid":  true,
		"result": string(outBytes),
	}
}
