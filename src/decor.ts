import { parse } from './deps/std/flags.ts'
import { delay } from './deps/std/async.ts'
import { DOMParser } from './deps/deno-dom.ts'
import { extractTemplate } from './extract_template.ts'
import { templateRenderer } from './template_renderer.ts'
import { renderHtml } from './render_html.ts'
import assets from './assets.json' assert { type: 'json' }

function render(contentString: string, templateString: string): string {
  const templateDocument = new DOMParser().parseFromString(
    templateString,
    'text/html',
  )
  if (!templateDocument) {
    throw new Error('Failed to parse template')
  }

  const template = extractTemplate(templateDocument)
  const renderer = templateRenderer(template)

  return renderHtml(contentString, renderer, templateDocument)
}

async function renderDefaultTemplate(options: { output?: string }) {
  const writableStream = options.output
    ? Deno.openSync(options.output, { write: true, create: true }).writable
    : Deno.stdout.writable

  await writableStream
    .getWriter()
    .write(new TextEncoder().encode(assets.defaultTemplate))
}

async function runOneshot(options: {
  template?: string
  input?: string
  output?: string
}) {
  const templateString = options.template
    ? Deno.readTextFileSync(options.template)
    : assets.defaultTemplate

  const contentString = options.input
    ? Deno.readTextFileSync(options.input)
    : assets.defaultContent

  const outputString = render(contentString, templateString)

  const writableStream = options.output
    ? Deno.openSync(options.output, { write: true, create: true }).writable
    : Deno.stdout.writable

  await writableStream
    .getWriter()
    .write(new TextEncoder().encode(outputString))
}

async function runWatch(options: {
  template?: string
  input?: string
  output: string
}) {
  const watchTargets: string[] = []
  if (options.template) {
    watchTargets.push(options.template)
  }
  if (options.input) {
    watchTargets.push(options.input)
  }

  let updatedPaths: string[] = []
  ;(async () => {
    const watcher = Deno.watchFs(watchTargets)
    for await (const event of watcher) {
      if (event.kind !== 'modify') {
        continue
      }

      updatedPaths = [...updatedPaths, ...event.paths].filter(
        (value, index, array) => {
          return array.indexOf(value) === index
        },
      )
    }
  })()

  await runOneshot(options)

  for (;;) {
    await delay(100)

    if (updatedPaths.length > 0) {
      console.log('Updated:', updatedPaths)
      await runOneshot(options)
      updatedPaths = []
    }
  }
}

async function main() {
  try {
    const {
      _: [input],
      ...options
    } = parse(Deno.args, {
      boolean: ['help', 'show-default-template', 'watch'],
      string: ['template', 'output'],
    })

    if (options['show-default-template']) {
      await renderDefaultTemplate({
        output: options.output,
      })
      Deno.exit(0)
    }

    if (
      options.help ||
      (input === undefined &&
        options.template === undefined)
    ) {
      console.error(assets.helpText)
      Deno.exit(1)
    }

    if (options.watch) {
      if (options.output === undefined) {
        console.error('--output is required when --watch is specified')
        Deno.exit(1)
      }

      await runWatch({
        template: options.template,
        input: input?.toString(),
        output: options.output,
      })
    } else {
      await runOneshot({
        template: options.template,
        input: input?.toString(),
        output: options.output,
      })
    }
  } catch (e) {
    console.error(e.message)
    Deno.exit(1)
  }
}

if (import.meta.main) {
  await main()
}
