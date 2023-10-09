import { assertEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { DOMParser, Element } from "./deps/deno-dom.ts";

import {
  Template,
  getAttributeKeys,
  templateRenderer,
} from "./template_renderer.ts";

const divElement = parseDomFragment("<div></div>").children[0];

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
  hardLineBreak: divElement,
};

// This function makes it easy to switch DOM implementation.
// For example, JSDOM.fragment() returns DocumentFragment instead of Document.
function parseDomFragment(text: string): Element {
  const document = new DOMParser().parseFromString(text, "text/html")!;
  return document.body;
}

Deno.test(
  "`getAttributeKeys` returns all attribute keys start with 'data-decor-attribute-' in the template",
  () => {
    const template = parseDomFragment(
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
        </figure>`
    ).children[0];

    assertEquals(getAttributeKeys(template), [
      "data-decor-attribute-title",
      "data-decor-attribute-src",
      "data-decor-attribute-alt",
    ]);
  }
);

Deno.test("`templateRenderer.code` renders received parameters", () => {
  const codeBlockTemplate = parseDomFragment(
    `<pre>
<code data-decor-attribute-data-langauge="infoString" data-decor-content="content">
console.log("Hello, World!");
</code>
</pre>`
  ).children[0];

  assertEquals(
    templateRenderer({ ...testTemplate, codeBlock: codeBlockTemplate }).code(
      'alert("Hello, World!");',
      "javascript",
      false
    ),
    `<pre><code data-decor-attribute-data-langauge="infoString" data-decor-content="content" data-langauge="javascript">alert("Hello, World!");
</code>
</pre>`
  );
});

Deno.test(
  "`templateRenderer.code` renders received parameters to the root element when no specifier found",
  () => {
    const codeBlockTemplate = parseDomFragment(
      `<pre>
<code>
console.log("Hello, World!");
</code>
</pre>`
    ).children[0];

    assertEquals(
      templateRenderer({ ...testTemplate, codeBlock: codeBlockTemplate }).code(
        'alert("Hello, World!");',
        "javascript",
        false
      ),
      `<pre data-language="javascript">alert("Hello, World!");
</pre>`
    );
  }
);

Deno.test("`templateRenderer.blockquote` renders received parameters", () => {
  const blockQuoteTemplate = parseDomFragment(
    `<blockquote data-decor-content="content">
The quick brown fox jumps over the lazy dog.
</blockquote>`
  ).children[0];

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
    const blockQuoteTemplate = parseDomFragment(
      `<blockquote data-decor-attribute-title="content">
The quick brown fox jumps over the lazy dog.
</blockquote>`
    ).children[0];

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
  const fragment = parseDomFragment(
    `<h1 data-decor-content="content">Headding 1</h1>
    <h2 data-decor-content="content">Headding 2</h2>
    <h3 data-decor-content="content">Headding 3</h3>
    <h4 data-decor-content="content">Headding 4</h4>
    <h5 data-decor-content="content">Headding 5</h5>
    <h6 data-decor-content="content">Headding 6</h6>`
  );

  const renderer = templateRenderer({
    ...testTemplate,
    heading1: fragment.children[0],
    heading2: fragment.children[1],
    heading3: fragment.children[2],
    heading4: fragment.children[3],
    heading5: fragment.children[4],
    heading6: fragment.children[5],
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
  const thematicBreakTemplate = parseDomFragment(`<hr>`).children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      thematicBreak: thematicBreakTemplate,
    }).hr(),
    `<hr>`
  );
});

Deno.test(
  "`templateRenderer.list` renders received parameters as orderd list when ordered is true",
  () => {
    const orderedListTemplate = parseDomFragment(
      `<ol data-decor-content="content" data-decor-attribute-start="start"><li>item</li></ol>`
    ).children[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        orderedList: orderedListTemplate,
      }).list("<li>number 1</li>", true, 2),
      `<ol data-decor-content="content" data-decor-attribute-start="start" start="2"><li>number 1</li></ol>`
    );
  }
);

Deno.test(
  "`templateRenderer.list` doesn't render start attribute when start is 1",
  () => {
    const orderedListTemplate = parseDomFragment(
      `<ol data-decor-content="content" data-decor-attribute-start="start"><li>item</li></ol>`
    ).children[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        orderedList: orderedListTemplate,
      }).list("<li>number 1</li>", true, 1),
      `<ol data-decor-content="content" data-decor-attribute-start="start"><li>number 1</li></ol>`
    );
  }
);

Deno.test(
  "`templateRenderer.list` renders received parameters as unorderd list when ordered is false",
  () => {
    const unorderedListTemplate = parseDomFragment(
      `<ul data-decor-content="content"><li>item</li></ul>`
    ).children[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        unorderedList: unorderedListTemplate,
      }).list("<li>This is a list item</li>", false, ""),
      `<ul data-decor-content="content"><li>This is a list item</li></ul>`
    );
  }
);

Deno.test(
  "`templateRenderer.listitem` renders received parameters as orderd list item when ordered is true",
  () => {
    const orderedListItemTemplate = parseDomFragment(
      `<li data-decor-content="content">The quick brown fox jumps over the lazy dog.</li>`
    ).children[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        orderedListItem: orderedListItemTemplate,
      }).listitem("Sphinx of black quartz, judge my vow.", true, false, false),
      `<li data-decor-content="content">Sphinx of black quartz, judge my vow.</li>`
    );
  }
);

Deno.test(
  "`templateRenderer.listitem` renders received parameters as unorderd list item when ordered is false",
  () => {
    const unorderedListItemTemplate = parseDomFragment(
      `<li data-decor-content="content">The quick brown fox jumps over the lazy dog.</li>`
    ).children[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        unorderedListItem: unorderedListItemTemplate,
      }).listitem("Sphinx of black quartz, judge my vow.", false, false, false),
      `<li data-decor-content="content">Sphinx of black quartz, judge my vow.</li>`
    );
  }
);

Deno.test("`templateRenderer.checkbox` makes it back to markdown", () => {
  assertEquals(
    templateRenderer({
      ...testTemplate,
    }).checkbox(true),
    `[x]`
  );

  assertEquals(
    templateRenderer({
      ...testTemplate,
    }).checkbox(false),
    `[ ]`
  );
});

Deno.test("`templateRenderer.table` renders received parameters", () => {
  const tableTemplate = parseDomFragment(
    `<table>
<thead data-decor-content="header"><tr><th>header</th></tr></thead>
<tbody data-decor-content="body"><tr><td>body</td></tr></tbody>
</table>`
  ).children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      table: tableTemplate,
    }).table("<tr><th>title</th></tr>", "<tr><td>data</td></tr>"),
    `<table>
<thead data-decor-content="header"><tr><th>title</th></tr></thead>
<tbody data-decor-content="body"><tr><td>data</td></tr></tbody>
</table>`
  );
});

Deno.test(
  "`templateRenderer.table` renders received parameters as header when header is true",
  () => {
    const tableHeaderTemplate = parseDomFragment(
      '<table><tr data-decor-content="content"><th>The quick brown fox jumps over the lazy dog.</th></tr></table>'
    ).getElementsByTagName("tr")[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        tableHeader: tableHeaderTemplate,
      }).tablerow("<th>Sphinx of black quartz, judge my vow.</th>", {
        header: true,
      }),
      '<tr data-decor-content="content"><th>Sphinx of black quartz, judge my vow.</th></tr>'
    );
  }
);

Deno.test(
  "`templateRenderer.tablerow` renders received parameters as header when header is true",
  () => {
    const tableHeaderTemplate = parseDomFragment(
      '<table><tr data-decor-content="content"><th>The quick brown fox jumps over the lazy dog.</th></tr></table>'
    ).getElementsByTagName("tr")[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        tableHeader: tableHeaderTemplate,
      }).tablerow("<th>Sphinx of black quartz, judge my vow.</th>", {
        header: true,
      }),
      '<tr data-decor-content="content"><th>Sphinx of black quartz, judge my vow.</th></tr>'
    );
  }
);

Deno.test(
  "`templateRenderer.tablerow` renders received parameters as row when header is false",
  () => {
    const tableRowTemplate = parseDomFragment(
      '<table><tr data-decor-content="content"><td>The quick brown fox jumps over the lazy dog.</td></tr></table>'
    ).getElementsByTagName("tr")[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        tableRow: tableRowTemplate,
      }).tablerow("<td>Sphinx of black quartz, judge my vow.</td>", {
        header: false,
      }),
      '<tr data-decor-content="content"><td>Sphinx of black quartz, judge my vow.</td></tr>'
    );
  }
);

Deno.test(
  "`templateRenderer.tablecell` renders received parameters as header cell when header is true",
  () => {
    const tableHeaderCellTemplate = parseDomFragment(
      '<table><tr><th data-decor-content="content" data-decor-attribute-align="align">The quick brown fox jumps over the lazy dog.</th></tr></table>'
    ).getElementsByTagName("th")[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        tableHeaderCell: tableHeaderCellTemplate,
      }).tablecell("Sphinx of black quartz, judge my vow.", {
        header: true,
        align: "center",
      }),
      '<th data-decor-content="content" data-decor-attribute-align="align" align="center">Sphinx of black quartz, judge my vow.</th>'
    );
  }
);

Deno.test(
  "`templateRenderer.tablecell` renders received parameters as row cell when header is false",
  () => {
    const tableRowCellTemplate = parseDomFragment(
      '<table><tr><td data-decor-content="content" data-decor-attribute-align="align">The quick brown fox jumps over the lazy dog.</td></tr></table>'
    ).getElementsByTagName("td")[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        tableRowCell: tableRowCellTemplate,
      }).tablecell("Sphinx of black quartz, judge my vow.", {
        header: false,
        align: "center",
      }),
      '<td data-decor-content="content" data-decor-attribute-align="align" align="center">Sphinx of black quartz, judge my vow.</td>'
    );
  }
);

Deno.test(
  "`templateRenderer.tablecell` doesn't render `align` attribute when null is given",
  () => {
    const tableRowCellTemplate = parseDomFragment(
      '<table><tr><td data-decor-content="content" data-decor-attribute-align="align">The quick brown fox jumps over the lazy dog.</td></tr></table>'
    ).getElementsByTagName("td")[0];

    assertEquals(
      templateRenderer({
        ...testTemplate,
        tableRowCell: tableRowCellTemplate,
      }).tablecell("Sphinx of black quartz, judge my vow.", {
        header: false,
        align: null,
      }),
      '<td data-decor-content="content" data-decor-attribute-align="align">Sphinx of black quartz, judge my vow.</td>'
    );
  }
);

Deno.test("`templateRenderer.strong` renders received parameters", () => {
  const strongEmphasisTemplate = parseDomFragment(
    `<strong data-decor-content="content">The quick brown fox jumps over the lazy dog.</strong>`
  ).children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      strongEmphasis: strongEmphasisTemplate,
    }).strong("Sphinx of black quartz, judge my vow."),
    `<strong data-decor-content="content">Sphinx of black quartz, judge my vow.</strong>`
  );
});

Deno.test("`templateRenderer.em` renders received parameters", () => {
  const emphasisTemplate = parseDomFragment(
    `<em data-decor-content="content">The quick brown fox jumps over the lazy dog.</em>`
  ).children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      emphasis: emphasisTemplate,
    }).em("Sphinx of black quartz, judge my vow."),
    `<em data-decor-content="content">Sphinx of black quartz, judge my vow.</em>`
  );
});

Deno.test("`templateRenderer.codespan` renders received parameters", () => {
  const codeSpanTemplate = parseDomFragment(
    `<code data-decor-content="content">The quick brown fox jumps over the lazy dog.</code>`
  ).children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      codeSpan: codeSpanTemplate,
    }).codespan("Sphinx of black quartz, judge my vow."),
    `<code data-decor-content="content">Sphinx of black quartz, judge my vow.</code>`
  );
});

Deno.test("`templateRenderer.br` renders the given template", () => {
  const hardLineBreakTemplate = parseDomFragment(`<br>`).children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      hardLineBreak: hardLineBreakTemplate,
    }).br(),
    `<br>`
  );
});

Deno.test("`templateRenderer.del` renders received parameters", () => {
  const strikeThroughTemplate = parseDomFragment(
    `<del data-decor-content="content">The quick brown fox jumps over the lazy dog.</del>`
  ).children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      strikeThrough: strikeThroughTemplate,
    }).del("Sphinx of black quartz, judge my vow."),
    `<del data-decor-content="content">Sphinx of black quartz, judge my vow.</del>`
  );
});

Deno.test("`templateRenderer.link` renders received parameters", () => {
  const linkTemplate = parseDomFragment(
    `<a data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">
example
</a>`
  ).children[0];

  assertEquals(
    templateRenderer({
      ...testTemplate,
      link: linkTemplate,
    }).link("https://example.com", "title text", "link text"),
    `<a data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content" href="https://example.com" title="title text">link text</a>`
  );
});

Deno.test("`templateRenderer.link` omits title when it's not provided", () => {
  const linkTemplate = parseDomFragment(
    `<a data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">
example
</a>`
  ).children[0];

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
    const fragment = parseDomFragment(
      `<pre>
<code>
console.log("Hello, World!");
</code>
</pre>
<a href data-decor-attribute-href="url" data-decor-attribute-title="title" data-decor-content="content">
example
</a>
`
    );

    const codeBlockTemplate = fragment.children[0];
    const linkTemplate = fragment.children[1];

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
    const imageTemplate = parseDomFragment(
      `<img data-decor-attribute-src="url" data-decor-attribute-title="title" data-decor-attribute-alt="description">`
    ).children[0];

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
    const videoTemplate = parseDomFragment(
      `<video data-decor-attribute-title="title">
<source data-decor-attribute-src="url">
<a data-decor-attribute-href="url" data-decor-content="description">link text</a>
</video>`
    ).children[0];

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
