# Slash Command: /fix-links

## Description

Finds and fixes broken links in documentation, including internal cross-references, external URLs, and anchor links.

## When to Use

- **Before releases**: Ensure all documentation links work
- **After restructuring**: Fix links broken by file moves
- **In CI/CD**: Automated link validation
- **After external changes**: Check if referenced external resources moved
- **Monthly maintenance**: Proactive link health check

## What It Does

1. **Scans documentation for links**
   - Markdown links: `[text](url)`
   - Reference links: `[text][ref]`
   - Anchor links: `#heading-name`
   - Image links: `![alt](url)`
   - HTML links in markdown

2. **Validates each link**
   - Internal links: Check file exists
   - Anchor links: Verify heading exists
   - External links: HTTP GET request
   - Relative paths: Resolve and check

3. **Identifies broken links**
   - 404 Not Found
   - Moved files (file system)
   - Changed headings
   - Typos in URLs
   - Redirects (301/302)

4. **Attempts automatic fixes**
   - Find moved files
   - Update anchor to match new heading
   - Follow redirects
   - Fix common typos

5. **Reports issues and fixes**
   - List of broken links
   - Automatic fixes applied
   - Manual intervention needed
   - Suggestions for ambiguous cases

## Command Prompt

```markdown
---
description: Find and fix broken links in documentation
---

You are fixing broken links in documentation, validating both internal and external references.

## Context

Working directory: (auto-detected)
Documentation: docs/
Scope: ${SCOPE:-"docs/**/*.md"} (which files to check)
Fix mode: ${FIX:-true} (attempt automatic fixes)
Check external: ${EXTERNAL:-true} (check external URLs)
Follow redirects: ${FOLLOW_REDIRECTS:-true}

## Task

1. **Extract all links from documentation:**
   - Use Glob to find markdown files in scope
   - Read each file with Read tool
   - Parse for links:
     ```regex
     Markdown: \[([^\]]+)\]\(([^)]+)\)
     Reference: \[([^\]]+)\]\[([^\]]+)\]
     Anchor: \[([^\]]+)\]\(#([^)]+)\)
     Image: !\[([^\]]*)\]\(([^)]+)\)
     HTML: <a href="([^"]+)">
     ```
   - Collect:
     - Link text
     - URL/path
     - Source file and line number
     - Link type (internal, external, anchor, image)

2. **Categorize links:**

   **Internal Links** (relative paths):
   - `../concepts/architecture.md`
   - `./guides/setup.md`
   - `/docs/reference/api.md` (absolute from root)

   **Anchor Links** (headings):
   - `#installation`
   - `concepts.md#key-concepts`
   - `https://example.com/docs#section`

   **External Links**:
   - `https://github.com/user/repo`
   - `http://example.com/page`

   **Image Links**:
   - `images/diagram.png`
   - `https://example.com/image.jpg`

3. **Validate each link:**

   **For Internal Links:**
   ```bash
   # Resolve relative path
   resolved_path=$(resolve_relative_path "$source_file" "$link_path")

   # Check if file exists
   if [ ! -f "$resolved_path" ]; then
     echo "BROKEN: $resolved_path (referenced in $source_file:$line)"
     # Try to find moved file
     find_moved_file "$resolved_path"
   fi
   ```

   **For Anchor Links:**
   ```bash
   # Extract heading from link
   heading="${link##*#}"

   # Read target file
   target_file="${link%%#*}"
   if [ -z "$target_file" ]; then
     target_file="$source_file"  # Same file anchor
   fi

   # Check if heading exists (markdown heading → slug)
   # "## Key Concepts" → #key-concepts
   if ! grep -q "^#* $(heading_to_text "$heading")" "$target_file"; then
     echo "BROKEN ANCHOR: #$heading in $target_file"
     # Try to find similar heading
     find_similar_heading "$heading" "$target_file"
   fi
   ```

   **For External Links:**
   ```bash
   # HTTP HEAD request (faster than GET)
   status=$(curl -s -o /dev/null -w "%{http_code}" "$url")

   case $status in
     200) echo "OK: $url" ;;
     301|302)
       if [ "$FOLLOW_REDIRECTS" = true ]; then
         new_url=$(curl -s -o /dev/null -w "%{redirect_url}" "$url")
         echo "REDIRECT: $url → $new_url"
         suggest_update "$url" "$new_url"
       fi
       ;;
     404) echo "BROKEN: $url (404 Not Found)" ;;
     *) echo "ERROR: $url (HTTP $status)" ;;
   esac
   ```

   **For Image Links:**
   - Check if file exists (internal)
   - Verify image loads (external)
   - Check dimensions if possible

4. **Attempt automatic fixes:**

   **Moved Files:**
   ```bash
   # If docs/guides/old-name.md not found
   # Search for file with similar name
   find docs/ -name "*old-name*.md"

   # If found single match: docs/guides/setup/new-name.md
   # Update link automatically
   old: [Guide](guides/old-name.md)
   new: [Guide](guides/setup/new-name.md)
   ```

   **Changed Headings:**
   ```bash
   # If #installation not found
   # Find similar headings
   grep "^#* " "$file" | grep -i "install"

   # Found: "## Installation Guide"
   # Suggest: Update #installation → #installation-guide
   ```

   **Redirects:**
   ```bash
   # If URL returns 301
   # Update to new URL automatically
   old: https://old-domain.com/page
   new: https://new-domain.com/page
   ```

   **Common Typos:**
   ```bash
   # Fix known issues
   http://github.com → https://github.com
   /docs//file.md → /docs/file.md
   file.md# → file.md#
   ```

5. **Apply fixes (if --fix mode):**
   - Use Edit tool to update documentation
   - One link at a time
   - Preserve surrounding context
   - Update all occurrences of same broken link
   - Log each change made

6. **Generate report using link-validation-report style:**
   - Total links checked
   - Broken links found
   - Fixes applied automatically
   - Manual intervention needed
   - Suggestions for ambiguous cases

## Fix Strategies

**Strategy 1: Exact Match**
```
docs/guides/auth.md → docs/guides/authentication.md
Confidence: 100% (only one file contains "auth")
Action: Auto-fix
```

**Strategy 2: High Confidence Match**
```
#setup → #initial-setup
Confidence: 95% (very similar heading found)
Action: Auto-fix with notice
```

**Strategy 3: Multiple Candidates**
```
docs/api.md → Could be:
  1. docs/reference/api.md
  2. docs/guides/api.md
Confidence: 50%
Action: Request user choice
```

**Strategy 4: No Match Found**
```
docs/deleted-feature.md → Not found
Confidence: 0%
Action: Report as broken, suggest removal
```

## Special Cases

**Case: Anchor Links to Other Files**
```markdown
[Architecture](concepts/architecture.md#system-design)
```
Check both:
1. File exists: concepts/architecture.md
2. Heading exists: ## System Design

**Case: URL-Encoded Links**
```markdown
[Docs](https://example.com/docs%20page)
```
Decode before checking: "docs page"

**Case: Link Fragments**
```markdown
See the [installation](#installation) section.
```
Check current file for heading.

**Case: External Link Rate Limiting**
```bash
# Don't check external links too frequently
# Cache results for 24 hours
# Add delay between requests
sleep 1
```

**Case: Authentication Required**
```markdown
[Private Repo](https://github.com/private/repo)
```
May return 404 even if valid.
Mark as "Needs Manual Verification"

## Output Format

Use link-validation-report style.

Summary:
```
📊 Link Validation Report

Total links checked: 342
✅ Valid: 315 (92%)
🔧 Fixed automatically: 18
⚠️  Needs manual fix: 9
❌ Broken: 9
```

Details per file:
```
docs/guides/setup.md:
  Line 45: [Guide](./old-guide.md)
  Status: ❌ Broken (file not found)
  Fixed: ✅ Updated to ./guides/getting-started.md

  Line 67: [Docs](https://old-site.com)
  Status: 🔧 Redirect (301 → https://new-site.com)
  Fixed: ✅ Updated to new URL

  Line 89: [Section](#old-heading)
  Status: ⚠️  Needs manual fix
  Reason: Multiple similar headings found
  Candidates:
    - #new-heading-v2
    - #new-heading-updated
```

## Performance Optimization

**Parallel Checking:**
```bash
# Check multiple links simultaneously
echo "$links" | xargs -P 10 -I {} check_link "{}"
```

**Caching:**
```bash
# Cache external link checks
cache_file="$HOME/.cache/doc-link-check.json"
if cache_valid "$url" "$cache_file"; then
  use_cached_result
else
  check_url_fresh
  cache_result
fi
```

**Skip Patterns:**
```bash
# Don't check certain URLs
skip_patterns=(
  "localhost"
  "127.0.0.1"
  "example.com"
  "*.test"
)
```

## Success Criteria

- All links extracted accurately
- Each link validated correctly
- Broken links identified with line numbers
- Automatic fixes applied safely
- Clear report of issues and fixes
- No false positives
- Performance acceptable (< 1 min for typical project)
