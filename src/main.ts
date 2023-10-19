import { parse } from "./deps/std/flags.ts";
import { DOMParser } from "./deps/deno-dom.ts";
import { extractTemplate } from "./extract_template.ts";
import { templateRenderer } from "./template_renderer.ts";
import { renderHtml } from "./render_html.ts";
import assets from "./assets.json" assert { type: "json" };

async function main() {
  try {
    const {
      _: [input],
      ...options
    } = parse(Deno.args, {
      string: ["template", "output", "help"],
    });

    let templateString = assets.defaultTemplate;
    if (options.template) {
      templateString = Deno.readTextFileSync(options.template);
    }

    if (options.help) {
      // TODO: output usage to stdout
      Deno.exit(1);
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

    let inputString = assets.defaultContent;
    if (input !== undefined) {
      inputString = Deno.readTextFileSync(input.toString());
    }

    const htmlString = renderHtml(inputString, renderer, templateDocument);

    let writableStream = Deno.stdout.writable;
    if (options.output) {
      const file = Deno.openSync(options.output, { write: true, create: true });
      writableStream = file.writable;
    }

    await writableStream
      .getWriter()
      .write(new TextEncoder().encode(htmlString));
  } catch (e) {
    console.error(e.message);
    Deno.exit(1);
  }
}

await main();
