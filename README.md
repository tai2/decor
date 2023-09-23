# What's decor?

`decor` is a Markdown transformer which takes Markdown files as contents and a
standalone HTML file as a template. It is designed for rather a oneshot single
page use than a fullset static site generation.

# Installation

TBD

# How to Use

`decor` takes a template file and one or more Markdown files as arguments.

```bash
decor --template template.html content.md
```

Then it generates `content.html`. The rules for templates are described in the
following sections.

# Options

- `--template` Template file. If omitted, the default template is used.
- `--watch` Run `decor` in watch mode. It detects updates for template and
  contents then emits outputs.
- `--output` Output filename. When omitted, the input file name with the
  extension part replaced with `.md` is used.
- `--generate-template` Emit the default template to a file. You can use it as a
  starting point of your own template.

# Template Structure

Template is just a normal HTML file and has two responsibilities:

- Define metadata like `<title>`, `<link>`, etc placed between `<html>` and
  `<body>`.
- Define the markup of each supported element inside `<body>`. Mappings are
  defined by `data-decor-*` attributes.

## Supported Elements

`decor` supports these Markdown elements. Parameters for each element depends on
its type. `decor` follows the definitions in
[the GFM specification](https://github.github.com/gfm/).

| Element                                                     | Parameters                    |
| ----------------------------------------------------------- | ----------------------------- |
| `headding1` to `headding6`                                  | `content`                     |
| `thematic_break`                                            | None                          |
| `paragraph`                                                 | `content`                     |
| `code_block`                                                | `content`, `infoString`       |
| `block_quote`                                               | `content`                     |
| `table`                                                     | `header`, `body`              |
| `table_header`                                              | `content`                     |
| `table_header_cell`                                         | `content`, `align`            |
| `table_row`                                                 | `content`                     |
| `table_row_cell`                                            | `content`, `align`            |
| `ordered_list`                                              | `content`                     |
| `ordered_list_item`                                         | `content`                     |
| `unordered_list`                                            | `content`                     |
| `unordered_list_item`                                       | `content`                     |
| `link`                                                      | `content`, `title`, `url`     |
| `image`                                                     | `description`, `title`, `url` |
| `video` (when video file is referenced with image notation) | `description`, `title`, `url` |
| `code_span`                                                 | `content`                     |
| `emphasis`                                                  | `content`                     |
| `strong_emphasis`                                           | `content`                     |
| `strike_through`                                            | `content`                     |

These keywards are also used as specifiers for corresponding template elements
in template files.

## Element Specifiers

Here is a small but complete template example which contains only `headding1`
and `headding2`. The default definisions are used for all other elements.

`data-decor-element` is an attribute to specify mappings between Markdown
elements and template elements. For each occurence of Markdown element in input,
`decor` tries to look up the first element that has the corresponding element
specifier from the template file during conversion.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="/dist/output.css" rel="stylesheet" />
  </head>
  <body>
    <h1 data-decor-element="headding1" class="text-3xl font-bold underline">
      Primary Headding
    </h1>
    <h2 data-decor-element="headding2" class="text-2xl font-bold underline">
      Secondary Headding
    </h2>
  </body>
</html>
```

You can feed any markdown text like this to `decor`.

```markdown
# Markdown

Markdown is a lightweight markup language for creating formatted text using a
plain-text editor.

## History

Markdown was inspired by pre-existing conventions for marking up plain text in
email and usenet posts, such as the earlier markup languages setext (c. 1992),
Textile (c. 2002), and reStructuredText (c. 2002).

## Rise and divergence

As Markdown's popularity grew rapidly, many Markdown implementations appeared,
driven mostly by the need for additional features such as tables, footnotes,
definition lists,[note 1] and Markdown inside HTML blocks.
```

`decor` replaces the body of the template with HTML fragment rendered from the
markdown text. At last, the content and template turn into this output HTML.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="/dist/output.css" rel="stylesheet" />
  </head>
  <body>
    <h1 class="text-3xl font-bold underline">Markdown</h1>
    <p>
      Markdown is a lightweight markup language for creating formatted text
      using a plain-text editor.
    </p>
    <h2 class="text-2xl font-bold underline">History</h2>
    <p>
      Markdown was inspired by pre-existing conventions for marking up plain
      text in email and usenet posts, such as the earlier markup languages
      setext (c. 1992), Textile (c. 2002), and reStructuredText (c. 2002).
    </p>
    <h2 class="text-2xl font-bold underline">Rise and divergence</h2>
    <p>
      As Markdown's popularity grew rapidly, many Markdown implementations
      appeared, driven mostly by the need for additional features such as
      tables, footnotes, definition lists,[note 1] and Markdown inside HTML
      blocks.
    </p>
  </body>
</html>
```

## Content and Attribute Specifiers

Here is a part of an example template for image notation.

```html
<img
  data-decor-element="image"
  class="Image"
  src="image.jpg"
  alt="An example image"
  title="The title of the image"
/>
```

Note that you don't need to use a "standard" element, which is `<img>` in the
case of image, for rendering. You can even render nested elements to render a
markdown element.

```html
<figure data-decor-element="image" class="Figure">
  <img
    data-decor-attribute-src="url"
    data-decor-attribute-alt="description"
    class="Figure-image"
    src="image.jpg"
    alt="An example image"
  />
  <figcaption data-decor-content="title" class="Figure-caption">
    The caption of the image
  </figcaption>
</figure>
```

You can use `data-decor-attribute-[ATTRIBUTE_NAME]` inside an element to specify
a element and attribute an input parameter is mapped to. The last segment
represents distination attribute name and the value of the attribute represents
the source parameter.

Also, `data-decor-content` is a specifier to map a parameter to the content of a
element. The content of the element is replaced with the parameter.

If these attributes are not specified, `decor` suposes the default mappings are
applied to the root element. It depends on element type. For example, the
default mappings of the `paragraph` and `image` elements look like these.

```html
<p data-decor-content="content"></p>
```

```html
<img
  data-decor-attribute-src="url"
  data-decor-attribute-alt="description"
  data-decor-attribute-title="title"
/>
```

# Reviewing Template

Since template is just a plain HTML, you can write and review it as you want.
When contents are omitted, the default content included in `decor` is used. It's
useful when you want to review your stylesheets but you don't need to define the
whole element definitions in your template.

# Reference

- https://daringfireball.net/projects/markdown/syntax
- https://github.github.com/gfm/

# License

MIT
