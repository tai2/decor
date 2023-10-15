import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "./deps/std/assert.ts";
import * as path from "./deps/std/path.ts";
import * as fs from "./deps/std/fs.ts";

function runDecor(...args: string[]): Deno.CommandOutput {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url));
  const mainFilePath = path.join(dirname, "main.ts");

  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-read", "--allow-write", mainFilePath, ...args],
  });
  return command.outputSync();
}

Deno.test("decor emits output with a filename with `.md` extention", () => {
  // Create temp directory
  const tempDirPath = Deno.makeTempDirSync({
    prefix: "decor_test_fixture",
  });

  // Copy default content to temp directory
  const dirname = path.dirname(path.fromFileUrl(import.meta.url));
  const defaultContentPath = path.join(
    dirname,
    "../contents/default_content.md"
  );
  const tempContentPath = path.join(tempDirPath, "test.md");
  Deno.copyFileSync(defaultContentPath, tempContentPath);

  // Run decor
  const { code } = runDecor(tempContentPath);
  assertEquals(code, 0);
  assert(fs.existsSync(path.join(tempDirPath, "test.html")));

  // Clean up temp directory
  Deno.removeSync(tempDirPath, { recursive: true });
});

Deno.test("When no template file exists, decor raises an error", () => {
  const { code, stderr } = runDecor("--template", "nonexistent.html");
  assertEquals(code, 1);
  assertStringIncludes(
    new TextDecoder().decode(stderr),
    "No such file or directory"
  );
});
