import { assertEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import {
  Template,
  getAttributeKeys,
  templateRenderer,
} from "./template_renderer.ts";

const divElement = new DOMParser().parseFromString(
  "<div></div>",
  "text/html"
)!.body;
const testTemplate: Template = {
  heading1: divElement,
  heading2: divElement,
  heading3: divElement,
  heading4: divElement,
  heading5: divElement,
  heading6: divElement,
  thematicBreak: divElement,
  paragraph: divElement,
  codeBlock: divElement,
  blockQuote: divElement,
  table: divElement,
  tableHeader: divElement,
  tableHeaderCell: divElement,
  tableRow: divElement,
  tableRowCell: divElement,
  orderedList: divElement,
  orderedListItem: divElement,
  unorderedList: divElement,
  unorderedListItem: divElement,
  link: divElement,
  image: divElement,
  video: divElement,
  codeSpan: divElement,
  emphasis: divElement,
  strongEmphasis: divElement,
  strikeThrough: divElement,
};

Deno.test(
  "`getAttributeKeys` returns all attribute keys start with 'data-decor-attribute-' in the template",
  () => {
    const document = new DOMParser().parseFromString(
      `<figure data-decor-element="image" data-decor-attribute-title="title" class="Figure">
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
        </figure>`,
      "text/html"
    )!;
    const template = document.body.children[0];
    assertEquals(getAttributeKeys(template), [
      "data-decor-attribute-title",
      "data-decor-attribute-src",
      "data-decor-attribute-alt",
    ]);
  }
);

Deno.test("`templateRenderer.code` renders received parameters", () => {
  const document = new DOMParser().parseFromString(
    `<pre>
<code data-decor-attribute-data-langauge="infoString" data-decor-content="content">
console.log("Hello, World!");
</code>
</pre>`,
    "text/html"
  )!;
  const codeBlockTemplate = document.body.children[0];

  assertEquals(
    templateRenderer({ ...testTemplate, codeBlock: codeBlockTemplate }).code(
      'alert("Hello, World!");',
      "javascript",
      false
    ),
    `<pre><code data-decor-attribute-data-langauge="infoString" data-decor-content="content" data-langauge="javascript">alert(&amp;quot;Hello, World!&amp;quot;);
</code>
</pre>`
  );
});

Deno.test(
  "`templateRenderer.code` renders received parameters to the root element when no specifier found",
  () => {
    const document = new DOMParser().parseFromString(
      `<pre>
<code>
console.log("Hello, World!");
</code>
</pre>`,
      "text/html"
    )!;
    const codeBlockTemplate = document.body.children[0];

    assertEquals(
      templateRenderer({ ...testTemplate, codeBlock: codeBlockTemplate }).code(
        'alert("Hello, World!");',
        "javascript",
        false
      ),
      `<pre data-language="javascript">alert(&amp;quot;Hello, World!&amp;quot;);
</pre>`
    );
  }
);

Deno.test("`templateRenderer.blockquote` renders received parameters", () => {
  const document = new DOMParser().parseFromString(
    `<blockquote data-decor-content="content">
The quick brown fox jumps over the lazy dog.
</blockquote>`,
    "text/html"
  )!;
  const blockQuoteTemplate = document.body.children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      blockQuote: blockQuoteTemplate,
    }).blockquote("Sphinx of black quartz, judge my vow."),
    `<blockquote data-decor-content="content">Sphinx of black quartz, judge my vow.</blockquote>`
  );
});

Deno.test(
  "`templateRenderer.blockquote` can render content parameter to an attribute",
  () => {
    const document = new DOMParser().parseFromString(
      `<blockquote data-decor-attribute-title="content">
The quick brown fox jumps over the lazy dog.
</blockquote>`,
      "text/html"
    )!;
    const blockQuoteTemplate = document.body.children[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        blockQuote: blockQuoteTemplate,
      }).blockquote("Sphinx of black quartz, judge my vow."),
      `<blockquote data-decor-attribute-title="content" title="Sphinx of black quartz, judge my vow.">
The quick brown fox jumps over the lazy dog.
</blockquote>`
    );
  }
);

Deno.test("`templateRenderer.link` renders received parameters", () => {
  const document = new DOMParser().parseFromString(
    `<a href data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">
example
</a>`,
    "text/html"
  )!;
  const linkTemplate = document.body.children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      link: linkTemplate,
    }).link("https://example.com", "title text", "link text"),
    `<a href="https://example.com" data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content" title="title text">link text</a>`
  );
});

Deno.test("`templateRenderer.link` omits title when it's not provided", () => {
  const document = new DOMParser().parseFromString(
    `<a href data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">
example
</a>`,
    "text/html"
  )!;
  const linkTemplate = document.body.children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      link: linkTemplate,
    }).link("https://example.com", null, "link text"),
    `<a href="https://example.com" data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">link text</a>`
  );
});
