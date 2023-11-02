import {
  assert,
  assertEquals,
  assertStringIncludes,
} from './deps/std/assert.ts'
import * as path from './deps/std/path.ts'
import * as fs from './deps/std/fs.ts'
import { delay } from './deps/std/async.ts'

function decor(...args: string[]): Deno.Command {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url))
  const mainFilePath = path.join(dirname, 'decor.ts')

  return new Deno.Command(Deno.execPath(), {
    args: ['run', '--allow-read', '--allow-write', mainFilePath, ...args],
  })
}

Deno.test('decor emits output to the standard output', () => {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url))
  const defaultContentPath = path.join(
    dirname,
    '../contents/default_content.md',
  )

  const { code, stdout } = decor(defaultContentPath).outputSync()
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

    const { code, stdout } = decor(defaultContentPath).outputSync()
    assertEquals(code, 0)
    assertStringIncludes(
      new TextDecoder().decode(stdout),
      'Inline elements showcase',
    )
  },
)

Deno.test('When no template file exists, decor raises an error', () => {
  const { code, stderr } = decor('--template', 'nonexistent.html').outputSync()
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
    const { code } = decor(inputPath, '--output', outputPath).outputSync()
    assertEquals(code, 0)
    assert(fs.existsSync(outputPath))

    // Clean up temp directory
    Deno.removeSync(tempDirPath, { recursive: true })
  },
)

Deno.test(
  'decor emits the default template when --show-defualt-template is specified',
  () => {
    const { code, stdout } = decor('--show-default-template').outputSync()
    assertEquals(code, 0)
    assertStringIncludes(
      new TextDecoder().decode(stdout),
      'Decor default template',
    )
  },
)

Deno.test(
  'decor writes the default template to a file when both --show-defualt-template and --output are specified',
  () => {
    // Create temp directory
    const tempDirPath = Deno.makeTempDirSync({
      prefix: 'decor_test_fixture',
    })

    // Prepare arguments
    const outputPath = path.join(tempDirPath, 'output.html')

    // Run decor
    const { code } = decor(
      '--show-default-template',
      '--output',
      outputPath,
    ).outputSync()
    assertEquals(code, 0)
    assert(fs.existsSync(outputPath))

    // Clean up temp directory
    Deno.removeSync(tempDirPath, { recursive: true })
  },
)

Deno.test('decor shows help text when --help is specified', () => {
  const { code, stderr } = decor('--help').outputSync()
  assertEquals(code, 1)
  assertStringIncludes(new TextDecoder().decode(stderr), 'Usage : decor')
})

Deno.test(
  'decor shows help text when neither content nor template is specified',
  () => {
    const { code, stderr } = decor().outputSync()
    assertEquals(code, 1)
    assertStringIncludes(new TextDecoder().decode(stderr), 'Usage : decor')
  },
)

// Deno.watchFs doesn't work on CI. It seems that it's because of the issue of Docker.
// https://github.com/denoland/deno/issues/14684
//
// When I tried the --watch option on an Intel Linux container inside my Apple Silicon, it raised
// the "Function not implemented" error. And, I also tried macos-13 and windows-latest on GitHub
// but all of them failed too.
//
// Let's skip this test case on CI for now and revisit it when the issue is resolved.
if (!Deno.env.get('CI')) {
  Deno.test(
    'decor detects updates of the input file when --watch is specified',
    async () => {
      // Create temp directory
      const tempDirPath = Deno.makeTempDirSync({
        prefix: 'decor_test_fixture',
      })

      // Prepare arguments
      const outputPath = path.join(tempDirPath, 'output.html')

      const dirname = path.dirname(path.fromFileUrl(import.meta.url))
      const inputPath = path.join(dirname, '../contents/default_content.md')
      const copiedInputPath = path.join(tempDirPath, 'input.md')
      Deno.copyFileSync(inputPath, copiedInputPath)

      // Run decor
      const process = decor(
        '--watch',
        copiedInputPath,
        '--output',
        outputPath,
      ).spawn()

      // Wait for the process gets ready and the first output is emitted
      await delay(50)

      // Update the watched file
      Deno.writeTextFileSync(
        copiedInputPath,
        '# A new section appended in tests\n',
      )

      // Wait for the output updated
      await delay(100)

      // Validation
      const outputContent = Deno.readTextFileSync(outputPath)
      assertStringIncludes(
        outputContent,
        'A new section appended in tests',
      )

      // Terminate the process
      process.kill('SIGINT')
      await process.output()

      // Clean up temp directory
      Deno.removeSync(tempDirPath, { recursive: true })
    },
  )
}

Deno.test(
  'decor raise an error when --watch is specified without --output',
  () => {
    const dirname = path.dirname(path.fromFileUrl(import.meta.url))
    const inputPath = path.join(dirname, '../contents/default_content.md')

    const { code, stderr } = decor('--watch', inputPath).outputSync()
    assertEquals(code, 1)
    assertStringIncludes(
      new TextDecoder().decode(stderr),
      '--output is required when --watch is specified',
    )
  },
)
