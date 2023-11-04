import { marked } from './deps/marked.ts'
import { Renderer } from './renderer.ts'
import { HTMLDocument } from './deps/deno-dom.ts'
import { Parser } from './parser.ts'

export function renderHtml(
  markdown: string,
  renderer: Renderer,
  templateDocument: HTMLDocument,
): string {
  const tokens = marked.lexer(markdown)
  const output = Parser.parse(renderer, tokens)
  // Due to a bug of deno-dom, tempalteDocument.body becomes null when the document is cloned with
  //  `cloneNode(true)`. So we instead use `querySelector`. Let's fix this when the bug is fixed.
  templateDocument.querySelector('body')!.innerHTML = output
  return '<!DOCTYPE html>\n' + templateDocument.documentElement?.outerHTML
}
