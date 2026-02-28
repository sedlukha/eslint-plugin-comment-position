# eslint-plugin-comment-position

[![npm](https://img.shields.io/npm/v/eslint-plugin-comment-position)](https://www.npmjs.com/package/eslint-plugin-comment-position)
[![license](https://img.shields.io/npm/l/eslint-plugin-comment-position)](./LICENSE)

Enforce a consistent comment position in your JavaScript/TypeScript code — either **above** the code or **beside** it (inline). Auto-fixable.

## Why?

ESLint does not enforce consistent comment placement.
This plugin ensures comments are always placed either:

- above the code
- or inline with it

This improves readability, diff clarity, and team consistency.

### ❌ Before

```js
const foo = 1; // explanation
```

### ✅ After (position: "above")

```js
// explanation
const foo = 1;
```

## Installation

```bash
npm install -D eslint-plugin-comment-position
```

Supports ESLint 9 and 10.

## Usage

```js
// eslint.config.js
import commentPosition from "eslint-plugin-comment-position";

export default [
  {
    plugins: { "comment-position": commentPosition },
    rules: {
      // Enforce all comments above the code:
      "comment-position/position": ["error", { position: "above" }],

      // — or — enforce all comments beside the code (inline):
      // "comment-position/position": ["error", { position: "beside" }],
    },
  },
];
```

### Built-in configs (shorthand)

```js
import commentPosition from "eslint-plugin-comment-position";

export default [
  // position: "above"  (recommended default)
  ...commentPosition.configs.recommended,

  // — or — position: "beside"
  // ...commentPosition.configs["recommended-beside"],
];
```

## Rules

| Rule                        | Description                                     | Fixable |
| --------------------------- | ----------------------------------------------- | ------- |
| `comment-position/position` | Enforce comment position (above or beside code) | ✅      |

## `comment-position/position`

Enforces that all line (`//`) and single-line block (`/* */`) comments are
placed either **above** or **beside** the code they describe.

Multi-line block comments (`/* \n ... \n */`) are intentionally ignored — they
are typically used for JSDoc or file headers.

Unlike the built-in `no-inline-comments` and `line-comment-position` rules (and
`@stylistic/line-comment-position`), this rule supports `--fix` and will
automatically move comments to the correct position.

### Options

| Option                       | Type                    | Required | Default | Description                                                                                               |
| ---------------------------- | ----------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `position`                   | `"above"` \| `"beside"` | **yes**  | —       | Where comments must be placed                                                                             |
| `ignorePattern`              | `string`                | no       | —       | Regex string. Comments matching this pattern are skipped                                                  |
| `applyDefaultIgnorePatterns` | `boolean`               | no       | `true`  | When `true`, ESLint directive comments (`eslint-disable`, `eslint-disable-line`, etc.) are always ignored |

### `position: "above"`

Examples of 👎 incorrect code for these options:

```js
const x = 1; // this is a comment
//            ^^^^^^^^^^^^^^^^^^^^ move above

/* block comment */ const y = 2;
// ^^^^^^^^^^^^^^^^ move to its own line above
```

Examples of 👍 correct code for these options:

```js
// this is a comment
const x = 1;

/* block comment */
const y = 2;
```

### `position: "beside"`

Examples of 👎 incorrect code for these options:

```js
// this is a comment
const x = 1;
// ^^^^^^^^^^^^^^^^^ move beside the code below

/* block comment */ const y = 2;
// ^^^^^^^^^^^^^^^^ move to end of line
```

Examples of 👍 correct code for these options:

```js
const x = 1; // this is a comment
const y = 2; /* block comment */
```

### Example with options

```js
// eslint.config.js
export default [
  {
    plugins: { "comment-position": commentPosition },
    rules: {
      "comment-position/position": [
        "error",
        {
          position: "above",
          ignorePattern: "^\\s*TODO", // ignore TODO comments
          applyDefaultIgnorePatterns: true, // ignore eslint directives (default)
        },
      ],
    },
  },
];
```

## See also

- [`no-inline-comments`](https://eslint.org/docs/rules/no-inline-comments) — ESLint built-in, no `--fix` support
- [`line-comment-position`](https://eslint.org/docs/rules/line-comment-position) — ESLint built-in, no `--fix` support
- [`@stylistic/line-comment-position`](https://eslint.style/rules/js/line-comment-position) — ESLint Stylistic, no `--fix` support

## License

MIT
