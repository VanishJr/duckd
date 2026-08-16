# @duckd/cli

The `duckd` binary — the duck with no editor attached.

| Command | Does |
|---------|------|
| `duckd start` | Open an interactive session in the terminal |
| `duckd sessions` | List, inspect and resume past sessions |
| `duckd export` | Write a session out as Markdown or JSON |
| `duckd adapters` | Regenerate host artifacts from the spec, or `--check` them for drift |

## Why the CLI exists

It is the reference client, not a convenience. A session that works here — plain
stdin/stdout, same `@duckd/core` engine, no host agent in the loop — proves the
behaviour lives in the engine. Anything an editor adapter has to add beyond
rendering is a smell worth chasing.

`duckd export` also feeds `@duckd/evals`: a real transcript is the cheapest eval fixture there is.
