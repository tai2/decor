import { assertEquals, assertStringIncludes } from "./deps/std/assert.ts";
import * as path from "./deps/std/path.ts";

Deno.test("When no template file exists, decor raises an error", () => {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url));
  const mainFilePath = path.join(dirname, "main.ts");

  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-read",
      mainFilePath,
      "--template",
      "nonexistent.html",
    ],
  });
  const { code, stderr } = command.outputSync();
  assertEquals(code, 1);
  assertStringIncludes(
    new TextDecoder().decode(stderr),
    "No such file or directory"
  );
});
