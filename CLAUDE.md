## Commands

- `bun install` — install dependencies
- `bun run dev` — build in watch mode (tsdown)
- `bun run build` — production build (tsdown)
- `bun test` — run tests (bun:test)
- `bun test --watch` — run tests in watch mode

## Code style

- Strict TypeScript with `verbatimModuleSyntax` — use `import type` for type-only imports.
- JSX with `react-jsx` transform — no need to import React for JSX.
- No comments in source code.
- No semicolons.
- Single quotes for strings.
- Export public API from `src/index.ts` only.
- Barrel exports with named exports — no default exports.
- Test files use `.test.tsx` extension and sit in `src/__test__/`.

## Testing

- Use `bun:test` (`test`, `expect`, `mock`).
- Mock external providers — never make real network calls.
- Use `mockClear()` between test cases.
