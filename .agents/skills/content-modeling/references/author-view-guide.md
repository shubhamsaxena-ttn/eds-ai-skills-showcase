# Author View Guide

Use this reference when documenting how authors create block content in **Google
Docs**, **Google Sheets**, or **Document Authoring (DA)**. The Author View is a
**required deliverable** — include it in content-modeling output (Step 4) and
repeat it when building-blocks completes implementation.

For DA HTML and cell-formatting rules, consult the **da-content** skill
(`references/html-content.md` §3 and §3.9).

Block-specific examples live in `blocks/{block-name}/AUTHORING.md` after
implementation — not in this file.

---

## When to produce an Author View

| Situation | Required? |
|-----------|-----------|
| New block | **Yes** — always |
| Block structure change (rows/columns/semantics) | **Yes** |
| CSS-only or decoration-only change | No |
| Bug fix with no authoring impact | No |

---

## What authors see vs. what developers see

| Audience | Document | Purpose |
|----------|----------|---------|
| **Authors** | Author View | Google Docs table layout with example values |
| **Developers** | Content Model | Row/column semantics, decoration contract |

Both ship together from content-modeling. building-blocks repeats the Author View
in chat and may persist it to `blocks/{block-name}/AUTHORING.md`.

---

## Required sections (copy this template)

Every Author View MUST include all sections below. Replace placeholders with
block-specific content derived from the content model.

```markdown
## Author View: [Block Name]

### Canonical model
[Standalone | Collection | Configuration | Auto-Blocked]

### Where content goes
- **Section intro:** [default content above the block — or "none"]
- **Block table:** [one table in Google Docs / DA — or "auto-blocked from sections"]

### Table layout (example values)

[Markdown table showing **every row** the author creates, with **realistic
example content**. Never use abstract labels like "Cell 1" or "Column A".]

### Row / column rules

| Row or column | Author enters | Formatting |
|---------------|---------------|------------|
| ... | ... | headings, bold, italic, links, images |

### Do / Don't

| Do | Don't |
|----|-------|
| ... | ... |

### What authors control vs. what code handles

| Authors control | Code handles automatically |
|-----------------|------------------------------|
| ... | ... |

### Optional variants
- `[Block Name (variant-a, variant-b)]` — [what changes for authors]
```

---

## Authoring patterns by canonical model

Use the pattern that matches the content model. See
[canonical-models.md](canonical-models.md) for full guidance.

### Standalone (Hero, Blockquote, Form, …)

**Table shape:** Variable rows/columns — authors group related content in cells;
decoration uses semantic selectors, not fixed positions.

**Author View must show:**
- Which rows are optional vs. required
- Semantic formatting per element (H1 = title, paragraph = body, link = CTA)
- Flexible layouts authors may use (image + text in one row or two)

**Example table layout (Hero):**

| Hero |
|:---:|
| ![image](hero.jpg) |
| # Welcome to our site |
| Discover amazing content. [Get Started](link) |

**Example table layout (Blockquote):**

| Blockquote (Bordered) |
|:---:|
| The best way to predict the future is to invent it. |
| *Alan Kay* |

---

### Collection (Cards, Carousel, Gallery, …)

**Table shape:** Block name row + **one row per item** + **consistent columns**
across all item rows.

**Author View must show:**
- Exact column count (≤ 4)
- What each column contains (image, heading+body, link, etc.)
- How to add/remove items (add/remove rows)

**Example table layout (Cards):**

| Cards |
|:---:|
| ![Product](p1.jpg) | ## Product name<p>Description text.</p><p>[Learn more](link)</p> |
| ![Product](p2.jpg) | ## Another product<p>Description text.</p><p>[Learn more](link)</p> |

---

### Configuration (Blog Listing, Search Results, …)

**Table shape:** Block name row + **key/value rows** — only for API-driven or
dynamic behavior, never for static visible content.

**Author View must show:**
- Each config key, accepted values, and defaults
- Clear statement that authors are **not** entering visible copy here

**Example table layout (Blog Listing):**

| Blog Listing |
|:---:|
| limit | 10 |
| sort | date-desc |
| tags | news, technology |

---

### Auto-Blocked (Tabs, YouTube Embed, …)

**Table shape:** Authors may **not** use a block table at all. Document the
**section pattern** or **default-content pattern** instead.

**Author View must show:**
- What authors write (section metadata, headings, URLs, consecutive sections)
- What gets auto-detected and merged into a block
- Example of the **authored** structure, not the post-decoration DOM

**Example authored structure (Tabs):**

```
Section Metadata → style | tabs
## Tab title one
[default content and/or nested blocks]

---

Section Metadata → style | tabs
## Tab title two
[default content and/or nested blocks]
```

---

## Universal Google Docs / DA conventions

Apply to **all** block types:

| Rule | Detail |
|------|--------|
| Block name row | Single merged cell: `Block Name` or `Block Name (variant)` |
| No label header rows | Never `Image \| Title \| CTA` spreadsheet rows |
| Semantic formatting | Headings, **bold**, *italic*, links — not cell position — carry meaning |
| Lists inside cells | One `<p>` per item preferred; decoration may build `<ul>` |
| CTA links | Own paragraph; wrap link in **bold** or *italic* for button styling |
| Variants | Parenthetical on block name: `Cards (Dark)` — not config cells |
| Section intro | Headlines and subcopy **above** the block table as normal doc text |
| Max 4 cells/row | Split across rows if more content groups are needed |
| Images | Insert in cell; use alt text; reachable URLs for DA preview |

---

## DA / table-form technical notes

| Rule | Reference |
|------|-----------|
| Header row = one merged cell; `colspan` = widest row width | da-content §3 |
| Block name → first class token → `blocks/{name}/{name}.{js,css}` | da-content §3 |
| Cell tags: `<strong>`, `<em>`, `<p>`, `<h2>`–`<h6>`, `<a>`, `<ul>/<li>` | da-content §3.9 |
| No `style=`, `<script>`, nested blocks in cells | da-content §1, §3 |

---

## Writing effective example values

The table layout section is the most important part for authors. Follow these rules:

1. **Use realistic copy** — "Enterprise Plan", "$99/month", not "Tier 2" or "Price cell"
2. **Show every row** — block name, config/toggle rows, and all item rows
3. **Show optional rows** — mark with "(optional)" in the rules table if applicable
4. **Match the content model** — same row/column count as the developer structure
5. **Call out special rows** — toggle labels, featured badges, config keys

---

## Persisting in the repo

After building-blocks implements a new or changed block, save the Author View to:

```
blocks/{block-name}/AUTHORING.md
```

Keep this generic guide in the skill; keep block-specific tables in each block's
`AUTHORING.md`.

---

## Anti-patterns in Author Views

| Anti-pattern | Why it fails |
|--------------|--------------|
| "See content model for structure" | Authors don't read developer docs |
| Abstract placeholders (`Cell 1`, `Value`) | Authors can't copy into Google Docs |
| Only developer semantics, no visual table | Authors need a concrete layout |
| Block-specific examples in this generic guide | Belongs in `blocks/{name}/AUTHORING.md` |
| Deferring Author View to a follow-up message | Authors need it at block delivery |
