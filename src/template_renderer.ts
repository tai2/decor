import { extname } from './deps/std/path.ts'
import { contentType } from './deps/std/media_types.ts'
import { Element } from './deps/deno-dom.ts'
import { cleanUrl, escape } from './deps/marked.ts'
import { Template } from './template.ts'
import { Renderer } from './renderer.ts'

// Traverse the template and collect all attribute keys start with "data-decor-attribute-" and
// return them as an array.
export function getAttributeKeys(template: Element): string[] {
  function getAttributeKeysInner(element: Element, keys: string[]): void {
    for (const attribute of element.attributes) {
      if (attribute.name.startsWith('data-decor-attribute-')) {
        keys.push(attribute.name)
      }
    }
    for (const child of element.children) {
      getAttributeKeysInner(child, keys)
    }
  }

  const attributeKeys: string[] = []
  getAttributeKeysInner(template, attributeKeys)

  return attributeKeys.filter(
    (value, index, array) => array.indexOf(value) === index,
  )
}

type Parameters = Record<
  string,
  {
    value: string | undefined
    destination:
      | {
        type: 'content'
      }
      | {
        type: 'attribute'
        default: string
      }
    isReferenced: boolean
  }
>

function applyParameters(
  template: Element,
  attributeKeys: string[],
  parameters: Parameters,
) {
  const contentContainers = Array.from(
    template.querySelectorAll('[data-decor-content]'),
  )
  if (template.hasAttribute('data-decor-content')) {
    contentContainers.push(template)
  }
  for (const contentContainer of contentContainers) {
    const container = contentContainer as Element
    const parameterKey = container.getAttribute('data-decor-content')
    const parameter = parameterKey && parameters[parameterKey]
    if (parameter) {
      parameter.isReferenced = true
      if (parameter.value) {
        container.innerHTML = parameter.value
      }
    }
  }

  for (const attributeKey of attributeKeys) {
    const destinaionAttribute = attributeKey.substring(
      'data-decor-attribute-'.length,
    )

    const attributeContainers = Array.from(
      template.querySelectorAll(`[${attributeKey}]`),
    )
    if (template.hasAttribute(attributeKey)) {
      attributeContainers.push(template)
    }
    for (const attributeContainer of attributeContainers) {
      const container = attributeContainer as Element
      const parameterKey = container.getAttribute(attributeKey)
      const parameter = parameterKey && parameters[parameterKey]
      if (parameter) {
        parameter.isReferenced = true
        if (parameter.value) {
          container.setAttribute(destinaionAttribute, parameter.value)
        }
      }
    }
  }

  // When expected parameter is not consumed by any content or attribute, decor applies it to the
  // root element.
  for (const parameter of Object.values(parameters)) {
    if (parameter.isReferenced) {
      continue
    }

    if (!parameter.value) {
      // Optinal parameters like `title` can be undefined. Let's skip it.
      continue
    }

    switch (parameter.destination.type) {
      case 'content':
        template.innerHTML = parameter.value
        break
      case 'attribute':
        template.setAttribute(parameter.destination.default, parameter.value)
        break
    }
  }
}

export function templateRenderer(template: Template): Renderer {
  // CSS selectors doesn't support wildcard attribute names and deno-dom doesn't support
  // XPath query so we need to traverse the DOM tree to collect all attribute keys.
  // We looked for other libraries that support XPath query against XML but I couldn't find any.
  //
  // But we don't want to traverse the DOM tree every time we render a template so we cache
  // the attribute keys for each template type.
  const attributeKeyCache: Record<string, string[] | undefined> = {}

  function getAttributeKeysFromCache(templateType: keyof Template): string[] {
    let attributeKeys = attributeKeyCache[templateType]
    if (!attributeKeys) {
      attributeKeys = getAttributeKeys(template[templateType])
      attributeKeyCache[templateType] = attributeKeys
    }
    return attributeKeys
  }

  function cloneTemplateThenApplyParameters(
    templateType: keyof Template,
    parameters: Parameters,
  ) {
    const templateElement = template[templateType].cloneNode(true) as Element
    const attributeKeys = getAttributeKeysFromCache(templateType)
    applyParameters(templateElement, attributeKeys, parameters)
    return templateElement
  }

  return {
    code: (
      code: string,
      infostring: string | undefined,
      escaped: boolean,
    ): string => {
      const infoStringTrimmed = (infostring || '').match(/^\S*/)?.[0]
      code = code.replace(/\n$/, '') + '\n'

      const parameters = {
        content: {
          value: escaped ? code : escape(code, true),
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
        infoString: {
          value: infoStringTrimmed,
          destination: {
            type: 'attribute',
            default: 'data-language',
          },
          isReferenced: false,
        },
      } as const

      return cloneTemplateThenApplyParameters('code_block', parameters)
        .outerHTML
    },
    blockquote: (quote: string) => {
      const parameters = {
        content: {
          value: quote,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      return cloneTemplateThenApplyParameters('block_quote', parameters)
        .outerHTML
    },
    html: (html: string, _block?: boolean) => {
      return html
    },
    heading: (text: string, level: number, _raw: string) => {
      const parameters = {
        content: {
          value: text,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      switch (level) {
        case 1:
          return cloneTemplateThenApplyParameters('heading1', parameters)
            .outerHTML
        case 2:
          return cloneTemplateThenApplyParameters('heading2', parameters)
            .outerHTML
        case 3:
          return cloneTemplateThenApplyParameters('heading3', parameters)
            .outerHTML
        case 4:
          return cloneTemplateThenApplyParameters('heading4', parameters)
            .outerHTML
        case 5:
          return cloneTemplateThenApplyParameters('heading5', parameters)
            .outerHTML
        case 6:
          return cloneTemplateThenApplyParameters('heading6', parameters)
            .outerHTML
        default:
          throw new Error(`Unknown heading level: ${level}`)
      }
    },
    hr: () => {
      return cloneTemplateThenApplyParameters('thematic_break', {}).outerHTML
    },
    list: (body: string, ordered: boolean, start: number | '') => {
      const parameters: Parameters = {
        content: {
          value: body,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        } as const,
      }

      if (ordered && typeof start === 'number' && start !== 1) {
        parameters.start = {
          value: start.toString(),
          destination: {
            type: 'attribute',
            default: 'start',
          },
          isReferenced: false,
        } as const
      }

      return ordered
        ? cloneTemplateThenApplyParameters('ordered_list', parameters).outerHTML
        : cloneTemplateThenApplyParameters('unordered_list', parameters)
          .outerHTML
    },
    listitem: (
      text: string,
      ordered: boolean,
      _task: boolean,
      _checked: boolean,
    ) => {
      const parameters = {
        content: {
          value: text,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      return ordered
        ? cloneTemplateThenApplyParameters('ordered_list_item', parameters)
          .outerHTML
        : cloneTemplateThenApplyParameters('unordered_list_item', parameters)
          .outerHTML
    },
    checkbox: (checked: boolean) => {
      // task list is not supported right now
      return `[${checked ? 'x' : ' '}]`
    },
    paragraph: (text) => {
      const parameters = {
        content: {
          value: text,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      return cloneTemplateThenApplyParameters('paragraph', parameters)
        .outerHTML
    },
    table: (header: string, body: string) => {
      const parameters = {
        header: {
          value: header,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
        body: {
          value: body,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      return cloneTemplateThenApplyParameters('table', parameters).outerHTML
    },
    tablerow: (content: string, flags: { header: boolean }) => {
      const parameters: Parameters = {
        content: {
          value: content,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      return flags.header
        ? cloneTemplateThenApplyParameters('table_header', parameters).outerHTML
        : cloneTemplateThenApplyParameters('table_row', parameters).outerHTML
    },
    tablecell: (
      content: string,
      flags: {
        header: boolean
        align: 'center' | 'left' | 'right' | null
      },
    ) => {
      const parameters: Parameters = {
        content: {
          value: content,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      if (flags.align) {
        parameters.align = {
          value: flags.align,
          destination: {
            type: 'attribute',
            default: 'align',
          },
          isReferenced: false,
        }
      }

      return flags.header
        ? cloneTemplateThenApplyParameters('table_header_cell', parameters)
          .outerHTML
        : cloneTemplateThenApplyParameters('table_row_cell', parameters)
          .outerHTML
    },
    strong: (text: string) => {
      const parameters = {
        content: {
          value: text,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      return cloneTemplateThenApplyParameters('strong_emphasis', parameters)
        .outerHTML
    },
    em: (text: string) => {
      const parameters = {
        content: {
          value: text,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      return cloneTemplateThenApplyParameters('emphasis', parameters).outerHTML
    },
    codespan: (text: string) => {
      const parameters = {
        content: {
          value: text,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      return cloneTemplateThenApplyParameters('code_span', parameters)
        .outerHTML
    },
    br: () => {
      return cloneTemplateThenApplyParameters('hard_line_break', {}).outerHTML
    },
    del: (text: string) => {
      const parameters = {
        content: {
          value: text,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
      } as const

      return cloneTemplateThenApplyParameters('strikethrough', parameters)
        .outerHTML
    },
    link: (href: string, title: string | null | undefined, text: string) => {
      const cleanHref = cleanUrl(href)

      const parameters = {
        content: {
          value: text,
          destination: {
            type: 'content',
          },
          isReferenced: false,
        },
        title: {
          value: title ?? undefined,
          destination: {
            type: 'attribute',
            default: 'title',
          },
          isReferenced: false,
        },
        url: {
          value: cleanHref ?? undefined,
          destination: {
            type: 'attribute',
            default: 'href',
          },
          isReferenced: false,
        },
      } as const

      return cloneTemplateThenApplyParameters('link', parameters).outerHTML
    },
    image: (href: string, title: string | null, text: string) => {
      const cleanHref = cleanUrl(href)

      const parameters = {
        description: {
          value: text,
          destination: {
            type: 'attribute',
            default: 'alt',
          },
          isReferenced: false,
        },
        title: {
          value: title ?? undefined,
          destination: {
            type: 'attribute',
            default: 'title',
          },
          isReferenced: false,
        },
        url: {
          value: cleanHref ?? undefined,
          destination: {
            type: 'attribute',
            default: 'src',
          },
          isReferenced: false,
        },
      } as const

      return cleanHref !== null &&
          contentType(extname(cleanHref))?.startsWith('video')
        ? cloneTemplateThenApplyParameters('video', parameters).outerHTML
        : cloneTemplateThenApplyParameters('image', parameters).outerHTML
    },
    text: (text) => text,
  }
}
