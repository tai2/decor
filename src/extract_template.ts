import { DOMParser, HTMLDocument } from './deps/deno-dom.ts'
import { createPartialTemplate, PartialTemplate, Template } from './template.ts'

export function extractPartialTemplate(
  templateDocument: HTMLDocument,
): PartialTemplate {
  const template = createPartialTemplate()

  for (const key of Object.keys(template) as Array<keyof PartialTemplate>) {
    const fragment = templateDocument.querySelector(
      `[data-decor-element=${key}]`,
    )

    template[key] = fragment
  }

  return template
}

export function parsePartialTemplate(
  templateString: string,
): [HTMLDocument, PartialTemplate] {
  const templateDocument = new DOMParser().parseFromString(
    templateString,
    'text/html',
  )
  if (!templateDocument) {
    throw new Error('Failed to parse template')
  }

  const template = extractPartialTemplate(templateDocument)

  // Discard the content of the body since we are no longer interested in it.
  templateDocument.body.innerHTML = ''

  return [templateDocument, template]
}

export function extractTemplate(
  templateDocument: HTMLDocument,
): Template {
  const template = extractPartialTemplate(templateDocument)

  const missingElements: Array<keyof Template> = []
  for (const key of Object.keys(template) as Array<keyof Template>) {
    if (!template[key]) {
      missingElements.push(key)
    }
  }

  if (missingElements.length > 0) {
    throw new Error(`Missing elements in template: ${missingElements}`)
  }

  return template as Template
}

export function parseTemplate(
  templateString: string,
): [HTMLDocument, Template] {
  const templateDocument = new DOMParser().parseFromString(
    templateString,
    'text/html',
  )
  if (!templateDocument) {
    throw new Error('Failed to parse template')
  }

  const template = extractTemplate(templateDocument)

  // Discard the content of the body since we are no longer interested in it.
  templateDocument.body.innerHTML = ''

  return [templateDocument, template]
}
