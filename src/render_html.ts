import { marked } from "./deps/marked.ts";
import { Renderer } from "./renderer.ts";
import { HTMLDocument } from "./deps/deno-dom.ts";
import { Parser } from "./parser.ts";

export function renderHtml(
  markdown: string,
  renderer: Renderer,
  templateDocument: HTMLDocument,
): string {
  const tokens = marked.lexer(markdown);
  const output = Parser.parse(renderer, tokens);
  templateDocument.body.innerHTML = output;
  return "<!DOCTYPE html>\n" + templateDocument.documentElement?.outerHTML;
}
