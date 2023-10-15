import { parse } from "./deps/std/flags.ts";
import * as path from "./deps/std/path.ts";
import { DOMParser } from "./deps/deno-dom.ts";
import { extractTemplate } from "./extract_template.ts";
import { templateRenderer } from "./template_renderer.ts";
import { renderHtml } from "./render_html.ts";
import assets from "./assets.json" assert { type: "json" };

function main() {
  try {
    const { _: inputs, ...options } = parse(Deno.args, {
      string: ["template", "output"],
    });

    let templateString = assets.defaultTemplate;
    if (options.template) {
      templateString = Deno.readTextFileSync(options.template);
    }

    if (inputs.length === 0) {
      // TODO: output usage to stderr when no inputs are given
      Deno.exit(1);
    }

    if (options.output && inputs.length > 1) {
      throw new Error(
        "Cannot specify --output when generating multiple output files"
      );
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

    for (const input of inputs) {
      const filepath = input.toString();
      const inputString = Deno.readTextFileSync(filepath);

      const htmlString = renderHtml(inputString, renderer, templateDocument);

      // TODO: support default content
      const extname = path.extname(filepath);
      const filepathWithHtmlExt =
        filepath.substring(0, filepath.length - extname.length) + ".html";
      const outputFilepath = options.output
        ? options.output
        : filepathWithHtmlExt;

      Deno.writeTextFileSync(outputFilepath, htmlString);
    }
  } catch (e) {
    console.error(e.message);
    Deno.exit(1);
  }
}

main();
