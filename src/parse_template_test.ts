import * as path from "./deps/std/path.ts";
import { assertThrows } from "./deps/std/assert.ts";
import { DOMParser } from "./deps/deno-dom.ts";
import { parseTemplate } from "./parse_template.ts";

Deno.test("default template contains all necessary elements", () => {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url));
  const templateString = Deno.readTextFileSync(
    path.join(dirname, "../content/default_template.html")
  );

  // Do not throw any error
  parseTemplate(templateString);
});

Deno.test("`parseTemplate` reports lacking elements", () => {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url));
  const templateString = Deno.readTextFileSync(
    path.join(dirname, "../content/default_template.html")
  );

  const template = new DOMParser().parseFromString(
    templateString,
    "text/html"
  )!;

  // Remove some elements
  const linkElement = template.querySelector("[data-decor-element=link]");
  linkElement?.parentElement?.removeChild(linkElement);
  const imageElement = template.querySelector("[data-decor-element=image]");
  imageElement?.parentElement?.removeChild(imageElement);

  assertThrows(
    () => {
      parseTemplate(template.body.outerHTML);
    },
    Error,
    "Missing elements in template: link,image"
  );
});
