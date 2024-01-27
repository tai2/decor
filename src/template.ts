import { Element } from './deps/deno-dom.ts'
import type { SetNonNullable } from './deps/type-fest.ts'

// Having snake case property names brings a benefit that we can look up templates from a template
// HTML using keys of this type since `data-decor-element` is defined in snake case.
export type PartialTemplate = {
  heading1: Element | null
  heading2: Element | null
  heading3: Element | null
  heading4: Element | null
  heading5: Element | null
  heading6: Element | null
  thematic_break: Element | null
  paragraph: Element | null
  code_block: Element | null
  block_quote: Element | null
  table: Element | null
  table_header: Element | null
  table_header_cell: Element | null
  table_row: Element | null
  table_row_cell: Element | null
  ordered_list: Element | null
  ordered_list_item: Element | null
  unordered_list: Element | null
  unordered_list_item: Element | null
  link: Element | null
  image: Element | null
  video: Element | null
  code_span: Element | null
  emphasis: Element | null
  strong_emphasis: Element | null
  strikethrough: Element | null
  hard_line_break: Element | null
}

export function createPartialTemplate(): PartialTemplate {
  return {
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
}

export type Template = SetNonNullable<PartialTemplate>
