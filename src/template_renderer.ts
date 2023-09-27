import { Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { escape, cleanUrl } from "./marked.ts";
import { Renderer } from "./renderer.ts";

export type Template = {
  heading1: Element;
  heading2: Element;
  heading3: Element;
  heading4: Element;
  heading5: Element;
  heading6: Element;
  thematicBreak: Element;
  paragraph: Element;
  codeBlock: Element;
  blockQuote: Element;
  table: Element;
  tableHeader: Element;
  tableHeaderCell: Element;
  tableRow: Element;
  tableRowCell: Element;
  orderedList: Element;
  orderedListItem: Element;
  unorderedList: Element;
  unorderedListItem: Element;
  link: Element;
  image: Element;
  video: Element;
  codeSpan: Element;
  emphasis: Element;
  strongEmphasis: Element;
  strikeThrough: Element;
};

// Traverse the template and collect all attribute keys start with "data-decor-attribute-" and
// return them as an array.
export function getAttributeKeys(template: Element): string[] {
  function getAttributeKeysInner(element: Element, keys: string[]): void {
    for (const attribute of element.attributes) {
      if (attribute.name.startsWith("data-decor-attribute-")) {
        keys.push(attribute.name);
      }
    }
    for (const child of element.children) {
      getAttributeKeysInner(child as Element, keys);
    }
  }

  const attributeKeys: string[] = [];
  getAttributeKeysInner(template, attributeKeys);

  return attributeKeys.filter(
    (value, index, array) => array.indexOf(value) === index
  );
}

type ExpectedParameters = Record<
  string,
  {
    destination:
      | {
          type: "content";
        }
      | {
          type: "attribute";
          default: string;
        };
    isReferenced: boolean;
  }
>;

function applyParameters(
  template: Element,
  parameters: Record<string, string | undefined>,
  attributeKeys: string[],
  expectedParameters: ExpectedParameters
) {
  const contentContainers = Array.from(
    template.querySelectorAll("[data-decor-content]")
  );
  if (template.hasAttribute("data-decor-content")) {
    contentContainers.push(template);
  }
  for (const contentContainer of contentContainers) {
    const container = contentContainer as Element;
    const parameterKey = container.getAttribute("data-decor-content");
    if (parameterKey && parameters[parameterKey]) {
      if (expectedParameters[parameterKey]) {
        expectedParameters[parameterKey].isReferenced = true;
      }
      container.textContent = parameters[parameterKey]!;
    }
  }

  for (const attributeKey of attributeKeys) {
    const destinaionAttribute = attributeKey.substring(
      "data-decor-attribute-".length
    );

    const attributeContainers = Array.from(
      template.querySelectorAll(`[${attributeKey}]`)
    );
    if (template.hasAttribute(attributeKey)) {
      attributeContainers.push(template);
    }
    for (const attributeContainer of attributeContainers) {
      const container = attributeContainer as Element;
      const parameterKey = container.getAttribute(attributeKey);
      if (parameterKey) {
        if (expectedParameters[parameterKey]) {
          expectedParameters[parameterKey].isReferenced = true;
        }
        if (parameters[parameterKey]) {
          container.setAttribute(destinaionAttribute, parameters[parameterKey]);
        }
      }
    }
  }

  // When expected parameter is not consumed by any content or attribute, decor apply it to the
  // root element.
  for (const [parameterKey, expectedParameter] of Object.entries(
    expectedParameters
  )) {
    if (expectedParameter.isReferenced) {
      continue;
    }

    const parameter = parameters[parameterKey];
    if (!parameter) {
      // Optinal parameters like `title` can be undefined. Let's skip it.
      continue;
    }

    switch (expectedParameter.destination.type) {
      case "content":
        template.textContent = parameter;
        break;
      case "attribute":
        template.setAttribute(expectedParameter.destination.default, parameter);
        break;
    }
  }
}

export function templateRenderer(template: Template): Renderer {
  // CSS Selectors doesn't support wildcard attribute names and deno-dom doesn't support
  // XPath query so we need to traverse the DOM tree to collect all attribute keys.
  // We looked for other libraries that support XPath query against XML but I couldn't find any.
  //
  // But we don't want to traverse the DOM tree every time we render a template so we cache
  // the attribute keys for each template type.
  const attributeKeyCache: Record<string, string[] | undefined> = {};

  function getAttributeKeysFromCache(templateType: keyof Template): string[] {
    let attributeKeys = attributeKeyCache[templateType];
    if (!attributeKeys) {
      attributeKeys = getAttributeKeys(template[templateType]);
      attributeKeyCache[templateType] = attributeKeys;
    }
    return attributeKeys;
  }

  return {
    code: (
      code: string,
      infostring: string | undefined,
      escaped: boolean
    ): string => {
      // Clone the template element
      const codeBlockTemplate = template.codeBlock.cloneNode(true) as Element;

      // Prepare parameters
      const infoStringTrimmed = (infostring || "").match(/^\S*/)?.[0];
      code = code.replace(/\n$/, "") + "\n";

      const parameters = {
        content: escaped ? code : escape(code, true),
        infoString: infoStringTrimmed,
      };

      // Extract attribute keys
      const attributeKeys = getAttributeKeysFromCache("codeBlock");

      // Prepare expected parameters
      const expectedParameters = {
        content: {
          destination: {
            type: "content",
          },
          isReferenced: false,
        },
        infoString: {
          destination: {
            type: "attribute",
            default: "data-language",
          },
          isReferenced: false,
        },
      } as const;

      // Finalize the HTML fragment by applying parameters
      applyParameters(
        codeBlockTemplate,
        parameters,
        attributeKeys,
        expectedParameters
      );

      return codeBlockTemplate.outerHTML;
    },
    blockquote: (quote: string) => {
      // Clone the template element
      const blockQuoteTemplate = template.blockQuote.cloneNode(true) as Element;

      // Prepare parameters
      const parameters = {
        content: quote,
      };

      // Extract attribute keys
      const attributeKeys = getAttributeKeysFromCache("blockQuote");

      // Prepare expected parameters
      const expectedParameters = {
        content: {
          destination: {
            type: "content",
          },
          isReferenced: false,
        },
      } as const;

      // Finalize the HTML fragment by applying parameters
      applyParameters(
        blockQuoteTemplate,
        parameters,
        attributeKeys,
        expectedParameters
      );

      return blockQuoteTemplate.outerHTML;
    },
    html: () => "",
    heading: () => "",
    hr: () => "",
    list: () => "",
    listitem: (text) => text,
    checkbox: () => "",
    paragraph: (text) => text,
    table: () => "",
    tablerow: (content) => content,
    tablecell: (content) => content,
    strong: () => "",
    em: () => "",
    codespan: () => "",
    br: () => "",
    del: () => "",
    link: (href: string, title: string | null | undefined, text: string) => {
      // Clone the template element
      const linkTemplate = template.link.cloneNode(true) as Element;

      // Prepare parameters
      const cleanHref = cleanUrl(href);

      const parameters = {
        content: text,
        title: title === null ? undefined : title,
        url: cleanHref ?? undefined,
      };

      // Extract attribute keys
      const attributeKeys = getAttributeKeysFromCache("link");

      // Prepare expected parameters
      const expectedParameters = {
        content: {
          destination: {
            type: "content",
          },
          isReferenced: false,
        },
        title: {
          destination: {
            type: "attribute",
            default: "title",
          },
          isReferenced: false,
        },
        url: {
          destination: {
            type: "attribute",
            default: "href",
          },
          isReferenced: false,
        },
      } as const;

      // Finalize the HTML fragment by applying parameters
      applyParameters(
        linkTemplate,
        parameters,
        attributeKeys,
        expectedParameters
      );

      return linkTemplate.outerHTML;
    },
    image: () => "",
    text: (text) => text,
  };
}
