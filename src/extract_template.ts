import { HTMLDocument } from './deps/deno-dom.ts'
import { PartialTemplate, Template } from './template.ts'

export function extractPartialTemplate(
  templateDocument: HTMLDocument,
): PartialTemplate {
  const template: PartialTemplate = {
    heading1: null,
    heading2: null,
    heading3: null,
    heading4: null,
    heading5: null,
    heading6: null,
    thematic_break: null,
    paragraph: null,
    code_block: null,
    block_quote: null,
    table: null,
    table_header: null,
    table_header_cell: null,
    table_row: null,
    table_row_cell: null,
    ordered_list: null,
    ordered_list_item: null,
    unordered_list: null,
    unordered_list_item: null,
    link: null,
    image: null,
    video: null,
    code_span: null,
    emphasis: null,
    strong_emphasis: null,
    strikethrough: null,
    hard_line_break: null,
  }

  for (const key of Object.keys(template) as Array<keyof PartialTemplate>) {
    const fragment = templateDocument.querySelector(
      `[data-decor-element=${key}]`,
    )

    template[key] = fragment
  }

  return template
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
