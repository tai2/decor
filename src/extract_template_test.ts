import * as path from "./deps/std/path.ts";
import { assertThrows } from "./deps/std/assert.ts";
import { DOMParser, HTMLDocument } from "./deps/deno-dom.ts";
import { extractTemplate } from "./extract_template.ts";

function parseDefaultTemplate(): HTMLDocument {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url));
  const templateString = Deno.readTextFileSync(
    path.join(dirname, "../contents/default_template.html"),
  );

  return new DOMParser().parseFromString(templateString, "text/html")!;
}

Deno.test("default template contains all necessary elements", () => {
  // Do not throw any error
  extractTemplate(parseDefaultTemplate());
});

Deno.test("`createTemplate` reports lacking elements", () => {
  const templateDocument = parseDefaultTemplate();

  // Remove some elements
  const linkElement = templateDocument.querySelector(
    "[data-decor-element=link]",
  );
  linkElement?.parentElement?.removeChild(linkElement);
  const imageElement = templateDocument.querySelector(
    "[data-decor-element=image]",
  );
  imageElement?.parentElement?.removeChild(imageElement);

  assertThrows(
    () => {
      extractTemplate(templateDocument);
    },
    Error,
    "Missing elements in template: link,image",
  );
});
