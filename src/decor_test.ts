import {
  assert,
  assertEquals,
  assertExists,
  assertStringIncludes,
} from './deps/std/assert.ts'
import * as path from './deps/std/path.ts'
import * as fs from './deps/std/fs.ts'
import { delay } from './deps/std/async.ts'
import { DOMParser } from './deps/deno-dom.ts'

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

    // Make sure the first output is emitted
    while (!fs.existsSync(outputPath)) {
      await delay(100)
    }

    // Validation
    const outputBeforeUpdate = Deno.readTextFileSync(outputPath)
    assertEquals(
      outputBeforeUpdate.indexOf('A new section appended in tests'),
      -1,
    )

    // Update the watched file
    Deno.writeTextFileSync(
      copiedInputPath,
      '# A new section appended in tests\n',
    )

    // Wait for the output updated
    await delay(500)

    // Validation
    const outputAfterUpdate = Deno.readTextFileSync(outputPath)
    assertStringIncludes(
      outputAfterUpdate,
      'A new section appended in tests',
    )

    // Terminate the process
    process.kill('SIGINT')
    await process.output()

    // Clean up temp directory
    Deno.removeSync(tempDirPath, { recursive: true })
  },
)

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

Deno.test('decor runs parameter replacement', () => {
  const dirname = path.dirname(path.fromFileUrl(import.meta.url))
  const templatePath = path.join(
    dirname,
    '../contents/template_with_parameter_replacement.html',
  )
  const parametersPath = path.join(
    dirname,
    '../contents/parameters.json',
  )

  const { code, stdout, stderr } = decor(
    '--template',
    templatePath,
    '--parameters',
    parametersPath,
  ).outputSync()

  assertEquals(code, 0)

  const outputHtml = new TextDecoder().decode(stdout)
  const document = new DOMParser().parseFromString(outputHtml, 'text/html')!
  const title = document.querySelector('title')

  assertExists(title)
  assertEquals(title.getAttribute('id'), 'replaced ID')
  assertEquals(title.innerHTML, 'replaced title')
})
