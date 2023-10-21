import { Element } from './deps/deno-dom.ts'

// Having snake case property names brings a benefit that we can look up templates from a template
// HTML using keys of this type since `data-decor-element` is defined in snake case.
export type Template = {
  heading1: Element
  heading2: Element
  heading3: Element
  heading4: Element
  heading5: Element
  heading6: Element
  thematic_break: Element
  paragraph: Element
  code_block: Element
  block_quote: Element
  table: Element
  table_header: Element
  table_header_cell: Element
  table_row: Element
  table_row_cell: Element
  ordered_list: Element
  ordered_list_item: Element
  unordered_list: Element
  unordered_list_item: Element
  link: Element
  image: Element
  video: Element
  code_span: Element
  emphasis: Element
  strong_emphasis: Element
  strikethrough: Element
  hard_line_break: Element
}
