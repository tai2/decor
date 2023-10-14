import { DOMParser, HTMLDocument } from "./deps/deno-dom.ts";
import { Template } from "./template.ts";

export function extractTemplate(templateDocument: HTMLDocument): Template {
  const emptyFragment = new DOMParser().parseFromString(
    "<div></div>",
    "text/html"
  )!.body;

  const template: Template = {
    heading1: emptyFragment,
    heading2: emptyFragment,
    heading3: emptyFragment,
    heading4: emptyFragment,
    heading5: emptyFragment,
    heading6: emptyFragment,
    thematic_break: emptyFragment,
    paragraph: emptyFragment,
    code_block: emptyFragment,
    block_quote: emptyFragment,
    table: emptyFragment,
    table_header: emptyFragment,
    table_header_cell: emptyFragment,
    table_row: emptyFragment,
    table_row_cell: emptyFragment,
    ordered_list: emptyFragment,
    ordered_list_item: emptyFragment,
    unordered_list: emptyFragment,
    unordered_list_item: emptyFragment,
    link: emptyFragment,
    image: emptyFragment,
    video: emptyFragment,
    code_span: emptyFragment,
    emphasis: emptyFragment,
    strong_emphasis: emptyFragment,
    strikethrough: emptyFragment,
    hard_line_break: emptyFragment,
  };

  const missingElements: Array<keyof Template> = [];
  for (const key of Object.keys(template) as Array<keyof Template>) {
    const fragment = templateDocument.querySelector(
      `[data-decor-element=${key}]`
    );
    if (!fragment) {
      missingElements.push(key);
      continue;
    }

    template[key] = fragment;
  }

  if (missingElements.length > 0) {
    throw new Error(`Missing elements in template: ${missingElements}`);
  }

  return template;
}
