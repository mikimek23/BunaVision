---
trigger: always_on
---

# Engineering Rules (apply to every response, every project)

## 1. Fail fast. No fallbacks, anywhere.
- Never write code that silently recovers from missing or invalid input, config, data, or a failed dependency. If something required is missing or wrong, stop and raise an error.
- Forbidden, in config and in every other line of code:
  - default values for required inputs (`getenv("X", "default")`, `.get(key, default)`, `x or default`, `x ?? default`, `x || default`)
  - `try/except` that swallows an error and continues
  - returning `None`, `0`, `""`, `[]` or `{}` to mean "failed"
  - catch-all handlers (`except Exception`, bare `except`, `catch {}`) that hide the cause
  - mock, demo, cached, or "offline" data standing in for real results
  - silent retries or silent feature disabling when something errors
- Validate at the boundary: configuration at startup, input at the entry point. The error must name exactly what is missing or invalid.
- Catch only specific exceptions you can actually handle. Otherwise re-raise, or wrap with the original as the cause.
- "Missing", "empty", "zero" and "failed" are different states. Never merge them.
- A default is allowed only if the user explicitly asked for it, or the value is a documented optional setting. If unsure, treat the value as required.

## 2. Write exactly what was asked
- Implement the request and nothing else. No extra features, parameters, abstractions, files, endpoints, or "improvements".
- Do not change code outside the request. If you spot a problem elsewhere, mention it; do not fix it.
- If the request is ambiguous, ask one short question before writing code. Do not guess.
- Never invent APIs, fields, libraries, versions, file contents, or results. Check the codebase or docs. If you cannot verify something, say so.
- Follow the conventions already in the repo (naming, structure, style).
- If an instruction conflicts with these rules, follow the instruction and point out the conflict (security rules excepted).

## 3. Be honest about results
- Never say code works, passes, or was tested unless you ran it. State which commands you ran and what happened.
- Never fabricate output, numbers, benchmarks, or sources.
- End with a short list of what you did not run, did not verify, or left out.

## 4. Code quality, every time
- Full type hints. Small functions with one job. Clear names.
- No dead code, commented-out code, or TODO placeholders presented as finished work.
- One source of truth: never duplicate constants, mappings, or logic.
- Separate concerns: I/O, business logic, configuration, presentation. Inject external systems so they can be faked in tests.
- No side effects at import time. No mutable global state. No network or disk access in constructors.
- Read configuration through one module. Never put secrets in code, logs, or the repo.
- Treat all external input as untrusted: check type, size, range, and format.
- Set an explicit timeout on every network call. Bound everything that can grow (sizes, retries, result counts).
- Security basics: parameterized queries, least privilege, no secrets or personal data in logs. Send safe messages to users and put details in logs.
- Use specific error types with stable codes and actionable messages.

## 5. Tests and delivery
- Cover the failure paths too: a test must prove that missing config or bad input fails loudly.
- Run the linter, type checker, and tests when you can, and fix problems before finishing.
- Keep diffs small. No unrelated reformatting.
- Ask before adding a dependency. Pin versions.

## 6. Check before you answer
1. Did I add a default, fallback, swallowed error, mock, or placeholder? Remove it.
2. Did I add anything that was not requested? Remove it.
3. Did I verify every name, API, and version I used?
4. Did I say plainly what I did not run or could not check?