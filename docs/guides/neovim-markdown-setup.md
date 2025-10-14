# Neovim Markdown Setup for Docent

This guide helps you configure Neovim to auto-format markdown files consistent with docent's linting rules.

## Goal

- **Auto-format on save** that matches `markdownlint-cli2` rules
- **No conflicts** between editor formatting and CI/CD linting
- **Consistent** markdown across manual edits and agent-generated files

## Recommended Approach

Use `markdownlint-cli2 --fix` directly as your formatter. This ensures 100% consistency with linting rules.

### Option 1: Using conform.nvim (Recommended)

[conform.nvim](https://github.com/stevearc/conform.nvim) is a modern formatting plugin that supports custom formatters.

**Installation (lazy.nvim):**

```lua
{
  "stevearc/conform.nvim",
  opts = {
    formatters_by_ft = {
      markdown = { "markdownlint" },
    },
    -- Auto-format on save
    format_on_save = {
      timeout_ms = 500,
      lsp_fallback = true,
    },
    formatters = {
      markdownlint = {
        command = "npx",
        args = { "markdownlint-cli2", "--fix", "$FILENAME" },
        stdin = false,
      },
    },
  },
}
```

**Manual Format:**

```vim
:ConformInfo  " Check formatter status
:Format       " Format current buffer
```

### Option 2: Using null-ls / none-ls

[none-ls](https://github.com/nvimtools/none-ls.nvim) (fork of null-ls) provides LSP-based formatting.

**Installation (lazy.nvim):**

```lua
{
  "nvimtools/none-ls.nvim",
  dependencies = { "nvim-lua/plenary.nvim" },
  config = function()
    local null_ls = require("null-ls")

    null_ls.setup({
      sources = {
        null_ls.builtins.diagnostics.markdownlint,
        null_ls.builtins.formatting.markdownlint,
      },
    })
  end,
}
```

**Format on save:**

```lua
-- In your LSP config
vim.api.nvim_create_autocmd("BufWritePre", {
  pattern = "*.md",
  callback = function()
    vim.lsp.buf.format()
  end,
})
```

### Option 3: Simple Autocmd (Minimal Setup)

If you don't want plugins, use a simple autocmd:

```lua
-- In your init.lua or after/ftplugin/markdown.lua
vim.api.nvim_create_autocmd("BufWritePost", {
  pattern = "*.md",
  callback = function()
    -- Run markdownlint --fix after save
    vim.fn.system({ "npx", "markdownlint-cli2", "--fix", vim.fn.expand("%") })
    -- Reload buffer to show changes
    vim.cmd("edit")
  end,
})
```

**Note:** This runs *after* save, so you'll see a brief flicker as the file is reloaded.

## Verification

After setup, test the integration:

### 1. Create a test file with formatting issues

```markdown
# Test Heading
Some text.
- List item 1
- List item 2
More text.

```bash
echo "test"
```

Save the file.

### 2. Verify auto-formatting

The file should automatically fix to:

```markdown
# Test Heading

Some text.

- List item 1
- List item 2

More text.

​```bash
echo "test"
​```
```

(Note: Blank lines added around heading, list, and code fence)

### 3. Verify linting passes

```bash
npx markdownlint-cli2 your-test-file.md
```

Should show: `Summary: 0 error(s)`

## Configuration Discovery

Neovim will automatically discover `.markdownlint-cli2.jsonc` in your project root. No additional configuration needed.

**Config location:** `/Users/tnez/Code/tnez/docent/.markdownlint-cli2.jsonc`

## Enabled Rules (Auto-Fixable)

Our config enables only auto-fixable formatting rules:

- **MD022** - Blank lines around headings
- **MD031** - Blank lines around fences
- **MD032** - Blank lines around lists

**Disabled rules** (style preferences, not auto-fixable):

- MD013 (line length)
- MD024 (duplicate headings)
- MD026 (trailing punctuation)
- MD034 (bare URLs)
- MD036 (emphasis as heading)
- MD040 (fenced code language)
- MD041 (first line h1)
- MD051 (link fragments)

## Troubleshooting

### Formatter not found

```bash
# Verify markdownlint-cli2 is installed
npm install

# Test manually
npx markdownlint-cli2 --fix path/to/file.md
```

### Formatting doesn't match linting

```bash
# Check config is being used
npx markdownlint-cli2 --fix your-file.md

# If issues persist, check for conflicting configs
ls -la .markdownlint*
```

### Format on save not working

```lua
-- Debug conform.nvim
:ConformInfo

-- Debug none-ls
:NullLsInfo

-- Check autocmd is registered
:autocmd BufWritePre *.md
```

## Alternative: Prettier (Not Recommended)

Prettier is popular but its markdown formatting doesn't match markdownlint rules exactly. This can cause formatting conflicts.

**If you must use Prettier:**

1. Disable Prettier for markdown files
2. Use markdownlint-cli2 instead (as shown above)

```lua
-- Disable prettier for markdown
formatters_by_ft = {
  markdown = { "markdownlint" },  -- NOT "prettier"
}
```

## Integration with Other Editors

### VS Code

Install the [markdownlint extension](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) which auto-discovers `.markdownlint-cli2.jsonc`.

### IntelliJ/WebStorm

Install the [Markdown Navigator plugin](https://plugins.jetbrains.com/plugin/7896-markdown-navigator-enhanced) or use File Watchers with markdownlint-cli2.

### Sublime Text

Use [SublimeLinter-contrib-markdownlint](https://packagecontrol.io/packages/SublimeLinter-contrib-markdownlint).

## Summary

**Recommended flow:**

1. Install dependencies: `npm install`
2. Add conform.nvim with custom markdownlint formatter (Option 1 above)
3. Enable format on save
4. Edit markdown files - formatting happens automatically
5. No conflicts between editor and CI/CD

**Key principle:** Use the same tool (markdownlint-cli2) for both editor formatting and CI/CD linting. Zero configuration drift.
