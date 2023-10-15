import { parse } from "./deps/std/flags.ts";
import { marked } from "./deps/marked.ts";
import { DOMParser } from "./deps/deno-dom.ts";
import { extractTemplate } from "./extract_template.ts";
import { Parser } from "./parser.ts";
import { templateRenderer } from "./template_renderer.ts";
import assets from "./assets.json" assert { type: "json" };

function main() {
  try {
    const { _: inputs, ...options } = parse(Deno.args);

    let templateString = assets.defaultTemplate;
    if (typeof options.template === "string") {
      templateString = Deno.readTextFileSync(options.template);
    }

    const templateDocument = new DOMParser().parseFromString(
      templateString,
      "text/html"
    );
    if (!templateDocument) {
      throw new Error("Failed to parse template");
    }

    const template = extractTemplate(templateDocument);

    const renderer = templateRenderer(template);

    const tokens = marked.lexer(assets.defaultContent);

    const output = Parser.parse(renderer, tokens);

    //console.log(inputs, options);
    templateDocument.body.innerHTML = output;
    const htmlString =
      "<!DOCTYPE html>\n" + templateDocument.documentElement?.outerHTML;
    console.log(htmlString);
  } catch (e) {
    console.error(e.message);
    Deno.exit(1);
  }
}

main();
