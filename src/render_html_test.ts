import { assertEquals, assertStringIncludes } from './deps/std/assert.ts'
import { DOMParser } from './deps/deno-dom.ts'
import { extractTemplate } from './extract_template.ts'
import { templateRenderer } from './template_renderer.ts'
import { renderHtml } from './render_html.ts'
import assets from './assets.json' with { type: 'json' }

Deno.test(
  '`renderHtml` receives a markdown content and renders it as a HTML',
  () => {
    const templateDocument = new DOMParser().parseFromString(
      assets.defaultTemplate,
      'text/html',
    )!

    const template = extractTemplate(templateDocument)
    const renderer = templateRenderer(template)

    const htmlString = renderHtml(
      assets.defaultContent,
      renderer,
      templateDocument,
    )

    const renderedDocument = new DOMParser().parseFromString(
      htmlString,
      'text/html',
    )!

    assertEquals(renderedDocument.title, 'Decor default template')

    // Make sure that the body is replaced with the rendered content
    assertStringIncludes(
      renderedDocument.body.innerHTML,
      'Inline elements showcase',
    )
  },
)
