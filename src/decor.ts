import { parseArgs } from './deps/std/cli.ts'
import { debounce } from './deps/std/async.ts'
import { HTMLDocument } from './deps/deno-dom.ts'
import { PartialTemplate, Template } from './template.ts'
import { parsePartialTemplate, parseTemplate } from './extract_template.ts'
import { templateRenderer } from './template_renderer.ts'
import { renderHtml } from './render_html.ts'
import {
  replaceDocumentParameters,
  replaceTemplateParameters,
} from './replace_parameters.ts'
import assets from './assets.json' with { type: 'json' }

async function renderDefaultTemplate(options: { output?: string }) {
  let file, writableStream
  if (options.output) {
    file = Deno.openSync(options.output, { write: true, create: true })
    writableStream = file.writable
  } else {
    writableStream = Deno.stdout.writable
  }

  await writableStream
    .getWriter()
    .write(new TextEncoder().encode(assets.defaultTemplate))

  if (file) {
    await file.close()
  }
}

async function runOneshot(options: {
  template?: string
  input?: string
  output?: string
  defaultTemplate: [HTMLDocument, Template]
  parameters: Record<string, string>
}) {
  // Prepare the template
  const [defaultHtmlDocument, defaultTemplate] = options.defaultTemplate

  let template: Template, document: HTMLDocument
  if (options.template) {
    const templateString = Deno.readTextFileSync(options.template)
    const [templateDocument, partialTemplate] = parsePartialTemplate(
      templateString,
    )

    // Fill the missing elements with the default template.
    for (
      const key of Object.keys(partialTemplate) as Array<keyof PartialTemplate>
    ) {
      if (!partialTemplate[key]) {
        partialTemplate[key] = defaultTemplate[key]
      }
    }

    document = templateDocument
    template = partialTemplate as Template

    replaceDocumentParameters(document, options.parameters)
    replaceTemplateParameters(template, options.parameters)
  } else {
    // Use the default template but clone the document so that we can reuse the original data.
    document = defaultHtmlDocument.cloneNode(true) as HTMLDocument
    template = defaultTemplate
  }

  // Execute rendering
  const renderer = templateRenderer(template)

  const contentString = options.input
    ? Deno.readTextFileSync(options.input)
    : assets.defaultContent

  const outputString = renderHtml(contentString, renderer, document)

  // Write the output
  let file, writableStream
  if (options.output) {
    file = Deno.openSync(options.output, {
      write: true,
      create: true,
      truncate: true,
    })
    writableStream = file.writable
  } else {
    writableStream = Deno.stdout.writable
  }

  await writableStream
    .getWriter()
    .write(new TextEncoder().encode(outputString))

  if (file) {
    await file.close()
  }
}

async function runWatch(options: {
  template?: string
  input?: string
  output: string
  defaultTemplate: [HTMLDocument, Template]
  parameters: Record<string, string>
}) {
  const watchTargets: string[] = []
  if (options.template) {
    watchTargets.push(options.template)
  }
  if (options.input) {
    watchTargets.push(options.input)
  }

  await runOneshot(options)

  const runOneshotDebounced = debounce((event: Deno.FsEvent) => {
    console.log('Updated:', event.paths)
    runOneshot(options).catch((e) => {
      console.error(e.message)
    })
  }, 100)

  const watcher = Deno.watchFs(watchTargets)
  for await (const event of watcher) {
    if (event.kind !== 'modify') {
      continue
    }

    runOneshotDebounced(event)
  }
}

async function main() {
  try {
    const {
      _: [input],
      ...options
    } = parseArgs(Deno.args, {
      boolean: ['help', 'show-default-template', 'watch'],
      string: ['template', 'output', 'parameters'],
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

    const defaultTemplate = parseTemplate(
      assets.defaultTemplate,
    )

    let parameters: Record<string, string>
    if (options.parameters) {
      const parametersString = Deno.readTextFileSync(options.parameters)
      parameters = JSON.parse(parametersString)
    } else {
      parameters = {}
    }

    replaceDocumentParameters(defaultTemplate[0], parameters)
    replaceTemplateParameters(defaultTemplate[1], parameters)

    if (options.watch) {
      if (options.output === undefined) {
        console.error('--output is required when --watch is specified')
        Deno.exit(1)
      }

      await runWatch({
        template: options.template,
        input: input?.toString(),
        output: options.output,
        defaultTemplate,
        parameters,
      })
    } else {
      await runOneshot({
        template: options.template,
        input: input?.toString(),
        output: options.output,
        defaultTemplate,
        parameters,
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
