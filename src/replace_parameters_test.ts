import { DOMParser } from './deps/deno-dom.ts'
import { assertEquals } from './deps/std/assert.ts'
import { createPartialTemplate } from './template.ts'
import {
  replaceDocumentParameters,
  replaceTemplateParameters,
} from './replace_parameters.ts'

Deno.test(
  'replaceDocumentParameters handles parameter replacement in a document',
  () => {
    const document = new DOMParser().parseFromString(
      '<div data-decor-attribute-foo="param:bar" data-decor-content="param:bar"></div>',
      'text/html',
    )!
    replaceDocumentParameters(document, { bar: 'baz' })
    const element = document.querySelector('div')!
    assertEquals(element.getAttribute('foo'), 'baz')
    assertEquals(element.innerHTML, 'baz')
  },
)

Deno.test(
  'replaceTemplateParameters handles parameter replacement in a template',
  () => {
    const document = new DOMParser().parseFromString(
      '<h1 data-decor-attribute-foo="param:bar" data-decor-content="param:bar"></h1>',
      'text/html',
    )!
    const template = {
      ...createPartialTemplate(),
      heading1: document.querySelector('h1')!,
    }
    replaceTemplateParameters(template, { bar: 'baz' })
    const element = template.heading1
    assertEquals(element.getAttribute('foo'), 'baz')
    assertEquals(element.innerHTML, 'baz')
  },
)
