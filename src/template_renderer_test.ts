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

Deno.test("`templateRenderer.html` renders HTML as it is", () => {
  assertEquals(
    templateRenderer(testTemplate).html(
      '<address><a href="tel:+13115552368">(311) 555-2368</a></address>'
    ),
    '<address><a href="tel:+13115552368">(311) 555-2368</a></address>'
  );
});

Deno.test("`templateRenderer.heading` renders received parameters", () => {
  const document = new DOMParser().parseFromString(
    `<h1 data-decor-content="content">Headding 1</h1>
    <h2 data-decor-content="content">Headding 2</h2>
    <h3 data-decor-content="content">Headding 3</h3>
    <h4 data-decor-content="content">Headding 4</h4>
    <h5 data-decor-content="content">Headding 5</h5>
    <h6 data-decor-content="content">Headding 6</h6>`,
    "text/html"
  )!;

  const renderer = templateRenderer({
    ...testTemplate,
    heading1: document.body.children[0],
    heading2: document.body.children[1],
    heading3: document.body.children[2],
    heading4: document.body.children[3],
    heading5: document.body.children[4],
    heading6: document.body.children[5],
  });

  for (let i = 1; i <= 6; i++) {
    assertEquals(
      renderer.heading(
        "Sphinx of black quartz, judge my vow.",
        i,
        "Sphinx of black quartz, judge my vow."
      ),
      `<h${i} data-decor-content="content">Sphinx of black quartz, judge my vow.</h${i}>`
    );
  }
});

Deno.test("`templateRenderer.hr` renders the given template", () => {
  const document = new DOMParser().parseFromString(`<hr>`, "text/html")!;
  const thematicBreakTemplate = document.body.children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      thematicBreak: thematicBreakTemplate,
    }).hr(),
    `<hr>`
  );
});

Deno.test("`templateRenderer.link` renders received parameters", () => {
  const document = new DOMParser().parseFromString(
    `<a data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">
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
    `<a data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content" href="https://example.com" title="title text">link text</a>`
  );
});

Deno.test("`templateRenderer.link` omits title when it's not provided", () => {
  const document = new DOMParser().parseFromString(
    `<a data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">
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
    `<a data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content" href="https://example.com">link text</a>`
  );
});

Deno.test(
  "successive calls of two different render methods works correctly (meant fo attribute key cache)",
  () => {
    const document = new DOMParser().parseFromString(
      `<pre>
<code>
console.log("Hello, World!");
</code>
</pre>
<a href data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">
example
</a>
`,
      "text/html"
    )!;

    const codeBlockTemplate = document.body.children[0];
    const linkTemplate = document.body.children[1];

    const renderer = templateRenderer({
      ...testTemplate,
      codeBlock: codeBlockTemplate,
      link: linkTemplate,
    });

    // This call caches its attribute keys with the key `codeBlock` and should not affect the
    // result of the next call.
    renderer.code('alert("Hello, World!");', "javascript", false);

    assertEquals(
      renderer.link("https://example.com", null, "link text"),
      `<a href="https://example.com" data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">link text</a>`
    );
  }
);

Deno.test(
  "`templateRenderer.image` renders received parameters with image template when the file extention is a image one",
  () => {
    const document = new DOMParser().parseFromString(
      `<img data-decor-attribute-src="url" data-decor-attribute-title="title" data-decor-attribute-alt="description">`,
      "text/html"
    )!;
    const imageTemplate = document.body.children[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        image: imageTemplate,
      }).image("https://example.com/a.jpeg", "title text", "description text"),
      `<img data-decor-attribute-src="url" data-decor-attribute-title="title" data-decor-attribute-alt="description" src="https://example.com/a.jpeg" title="title text" alt="description text">`
    );
  }
);

Deno.test(
  "`templateRenderer.image` renders received parameters with video template when the file extention is a video one",
  () => {
    const document = new DOMParser().parseFromString(
      `<video data-decor-attribute-title="title">
<source data-decor-attribute-src="url">
<a data-decor-attribute-href="url" data-decor-content="description">link text</a>
</video>`,
      "text/html"
    )!;
    const videoTemplate = document.body.children[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        video: videoTemplate,
      }).image("https://example.com/a.mp4", "title text", "description text"),
      `<video data-decor-attribute-title="title" title="title text">
<source data-decor-attribute-src="url" src="https://example.com/a.mp4">
<a data-decor-attribute-href="url" data-decor-content="description" href="https://example.com/a.mp4">description text</a>
</video>`
    );
  }
);
