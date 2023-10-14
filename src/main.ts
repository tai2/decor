import { marked } from "./deps/marked.ts";
import { parseTemplate } from "./parse_template.ts";
import { Parser } from "./parser.ts";
import { templateRenderer } from "./template_renderer.ts";
import assets from "./assets.json" assert { type: "json" };
import { parse } from "./deps/std/flags.ts";

function main() {
  const template = parseTemplate(assets.defaultTemplate);

  const renderer = templateRenderer(template);

  const tokens = marked.lexer(assets.defaultContent);

  const output = Parser.parse(renderer, tokens);

  console.dir(parse(Deno.args));
  console.log(output);
}

main();
