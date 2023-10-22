import {
  assert,
  assertEquals,
  assertStringIncludes,
} from './deps/std/assert.ts'
import * as path from './deps/std/path.ts'
import * as fs from './deps/std/fs.ts'

function runDecor(...args: string[]): Deno.CommandOutput {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url))
  const mainFilePath = path.join(dirname, 'decor.ts')

  const command = new Deno.Command(Deno.execPath(), {
    args: ['run', '--allow-read', '--allow-write', mainFilePath, ...args],
  })
  return command.outputSync()
}

Deno.test('decor emits output to the standard output', () => {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url))
  const defaultContentPath = path.join(
    dirname,
    '../contents/default_content.md',
  )

  const { code, stdout } = runDecor(defaultContentPath)
  assertEquals(code, 0)
  assertStringIncludes(
    new TextDecoder().decode(stdout),
    'Inline elements showcase',
  )
})

Deno.test(
  'decor uses the default content when input is ommited but template is specified',
  () => {
    const dirname = path.dirname(path.fromFileUrl(import.meta.url))
    const defaultContentPath = path.join(
      dirname,
      '../contents/default_content.md',
    )

    const { code, stdout } = runDecor(defaultContentPath)
    assertEquals(code, 0)
    assertStringIncludes(
      new TextDecoder().decode(stdout),
      'Inline elements showcase',
    )
  },
)

Deno.test('When no template file exists, decor raises an error', () => {
  const { code, stderr } = runDecor('--template', 'nonexistent.html')
  assertEquals(code, 1)
  assertStringIncludes(
    new TextDecoder().decode(stderr),
    'No such file or directory',
  )
})

Deno.test(
  'decor emits output with a designated filename when --output is specified',
  () => {
    // Create temp directory
    const tempDirPath = Deno.makeTempDirSync({
      prefix: 'decor_test_fixture',
    })

    // Prepare arguments
    const outputPath = path.join(tempDirPath, 'output.html')
    const dirname = path.dirname(path.fromFileUrl(import.meta.url))
    const inputPath = path.join(dirname, '../contents/default_content.md')

    // Run decor
    const { code } = runDecor(inputPath, '--output', outputPath)
    assertEquals(code, 0)
    assert(fs.existsSync(outputPath))

    // Clean up temp directory
    Deno.removeSync(tempDirPath, { recursive: true })
  },
)

Deno.test(
  'decor emits the default template when --show-defualt-template is specified',
  () => {
    const { code, stdout } = runDecor('--show-default-template')
    assertEquals(code, 0)
    assertStringIncludes(
      new TextDecoder().decode(stdout),
      'Decor default template',
    )
  },
)

Deno.test('decor shows help text when --help is specified', () => {
  const { code, stdout } = runDecor('--help')
  assertEquals(code, 1)
  assertStringIncludes(new TextDecoder().decode(stdout), 'Usage : decor')
})

Deno.test(
  'decor shows help text when neither content nor template is specified',
  () => {
    const { code, stdout } = runDecor('--help')
    assertEquals(code, 1)
    assertStringIncludes(new TextDecoder().decode(stdout), 'Usage : decor')
  },
)
