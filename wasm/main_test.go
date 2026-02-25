package main

import (
	"encoding/json"
	"testing"
)

func TestLintInternal(t *testing.T) {
	env := map[string]any{
		"user": map[string]any{
			"Age": 18,
		},
	}
	envBytes, _ := json.Marshal(env)
	envJson := string(envBytes)

	t.Run("Valid Expression", func(t *testing.T) {
		res := lintInternal("user.Age > 10", envJson)
		if valid, ok := res["valid"].(bool); !ok || !valid {
			t.Errorf("Expected valid to be true, got %v", res)
		}
	})

	t.Run("Invalid Syntax", func(t *testing.T) {
		res := lintInternal("user.Age > ", envJson)
		if valid, ok := res["valid"].(bool); !ok || valid {
			t.Errorf("Expected valid to be false, got %v", res)
		}
		if _, ok := res["error"].(string); !ok {
			t.Errorf("Expected string error, got %v", res["error"])
		}
	})

	t.Run("Unknown Identifier", func(t *testing.T) {
		res := lintInternal("foo == 1", "{}") // Pass empty environment to force strict type checking
		if valid, ok := res["valid"].(bool); !ok || valid {
			t.Errorf("Expected valid to be false (unknown identifier), got %v", res)
		}
	})

	t.Run("Invalid Environment JSON", func(t *testing.T) {
		res := lintInternal("user.Age > 10", "{ invalid json")
		if valid, ok := res["valid"].(bool); !ok || valid {
			t.Errorf("Expected json parse failure to invalidate, got %v", res)
		}
	})
}

func TestRunInternal(t *testing.T) {
	env := map[string]any{
		"user": map[string]any{
			"Age": 25.0, // json numbers decode to float64
		},
	}
	envBytes, _ := json.Marshal(env)
	envJson := string(envBytes)

	t.Run("Valid Execution", func(t *testing.T) {
		res := runInternal("user.Age > 18", envJson)
		if valid, ok := res["valid"].(bool); !ok || !valid {
			t.Fatalf("Expected valid to be true, got %v", res)
		}
		if result, ok := res["result"].(string); !ok || result != "true" {
			t.Errorf("Expected result 'true', got %v", result)
		}
	})

	t.Run("Arithmetic Execution", func(t *testing.T) {
		res := runInternal("user.Age * 2", envJson)
		if valid, ok := res["valid"].(bool); !ok || !valid {
			t.Fatalf("Expected valid to be true, got %v", res)
		}
		if result, ok := res["result"].(string); !ok || result != "50" {
			t.Errorf("Expected result '50', got %v", result)
		}
	})

	t.Run("Invalid Execution Error", func(t *testing.T) {
		// len() requires an array/string/map. Passing a number will fail at runtime or compilation.
		res := runInternal("len(10)", "")
		if valid, ok := res["valid"].(bool); !ok || valid {
			t.Errorf("Expected len(10) to fail, got %v", res)
		}
	})
}
