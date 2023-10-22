import { parse } from './deps/std/flags.ts'
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

async function main() {
  try {
    const {
      _: [input],
      ...options
    } = parse(Deno.args, {
      string: ['help', 'template', 'output', 'show-default-template'],
    })

    if (
      options.help ||
      (input === undefined &&
        options.template === undefined &&
        options['show-default-template'] === undefined)
    ) {
      console.log(assets.helpText)
      Deno.exit(1)
    }

    let outputString
    if (options['show-default-template']) {
      outputString = assets.defaultTemplate
    } else {
      let templateString = assets.defaultTemplate
      if (options.template) {
        templateString = Deno.readTextFileSync(options.template)
      }

      let contentString = assets.defaultContent
      if (input !== undefined) {
        contentString = Deno.readTextFileSync(input.toString())
      }

      outputString = render(contentString, templateString)
    }

    let writableStream = Deno.stdout.writable
    if (options.output) {
      const file = Deno.openSync(options.output, { write: true, create: true })
      writableStream = file.writable
    }

    await writableStream
      .getWriter()
      .write(new TextEncoder().encode(outputString))
  } catch (e) {
    console.error(e.message)
    Deno.exit(1)
  }
}

if (import.meta.main) {
  await main()
}
