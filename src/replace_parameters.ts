import { Element, HTMLDocument } from './deps/deno-dom.ts'
import { PartialTemplate, Template } from './template.ts'

const attributeRegex = /^data-decor-attribute-(.+)$/
const parameterRegex = /^param:(.+)$/

function replaceElementAttributes(
  element: Element,
  parameters: Record<string, string>,
): void {
  for (const attribute of element.attributes) {
    const parametersMatch = parameterRegex.exec(attribute.value)
    if (!parametersMatch) {
      continue
    }

    const parameterKey = parametersMatch[1]
    if (!parameters[parameterKey]) {
      continue
    }

    const attrebuteMatch = attributeRegex.exec(attribute.name)
    if (attrebuteMatch) {
      const attributeName = attrebuteMatch[1]
      element.setAttribute(attributeName, parameters[parameterKey])
      continue
    }

    if (attribute.name === 'data-decor-content') {
      element.innerHTML = parameters[parameterKey]
    }
  }
}

export function replaceDocumentParameters(
  document: HTMLDocument,
  parameters: Record<string, string>,
): void {
  document.querySelectorAll('*').forEach((element) => {
    replaceElementAttributes(element as Element, parameters)
  })
}

export function replaceTemplateParameters(
  template: PartialTemplate,
  parameters: Record<string, string>,
): void {
  for (
    const key of Object.keys(template) as Array<keyof Template>
  ) {
    const element = template[key]
    if (element) {
      replaceElementAttributes(element, parameters)
    }
  }
}
