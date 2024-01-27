import { assertEquals, assertThrows } from './deps/std/assert.ts'
import { DOMParser, HTMLDocument } from './deps/deno-dom.ts'
import { extractPartialTemplate, extractTemplate } from './extract_template.ts'
import assets from './assets.json' with { type: 'json' }

function parseDefaultTemplate(): HTMLDocument {
  return new DOMParser().parseFromString(assets.defaultTemplate, 'text/html')!
}

Deno.test('default template contains all necessary elements', () => {
  // Do not throw any error
  extractTemplate(parseDefaultTemplate())
})

Deno.test('`extractTemplate` reports lacking elements', () => {
  const templateDocument = parseDefaultTemplate()

  // Remove some elements
  const linkElement = templateDocument.querySelector(
    '[data-decor-element=link]',
  )
  linkElement?.parentElement?.removeChild(linkElement)
  const imageElement = templateDocument.querySelector(
    '[data-decor-element=image]',
  )
  imageElement?.parentElement?.removeChild(imageElement)

  assertThrows(
    () => {
      extractTemplate(templateDocument)
    },
    Error,
    'Missing elements in template: link,image',
  )
})

Deno.test('`extractPartialTemplate` allows incomplete template', () => {
  const templateDocument = parseDefaultTemplate()

  // Remove some elements
  const linkElement = templateDocument.querySelector(
    '[data-decor-element=link]',
  )
  linkElement?.parentElement?.removeChild(linkElement)
  const imageElement = templateDocument.querySelector(
    '[data-decor-element=image]',
  )
  imageElement?.parentElement?.removeChild(imageElement)

  const template = extractPartialTemplate(templateDocument)

  assertEquals(template.link, null)
  assertEquals(template.image, null)
})
