import { Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { escape } from "./marked.ts";
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

  function replaceContents(
    template: Element,
    parameters: Record<string, string | undefined>
  ) {
    const contentContainers = template.querySelectorAll("[data-decor-content]");
    for (const contentContainer of contentContainers) {
      const container = contentContainer as Element;
      const parameterName = container.getAttribute("data-decor-content");
      if (parameterName && parameters[parameterName]) {
        container.textContent = parameters[parameterName]!;
      }
    }
    // When there is no content specifier, decor apply it to the root element.
    if (contentContainers.length === 0) {
      template.textContent = parameters["content"]!;
    }
  }

  function addAttributes(
    template: Element,
    parameters: Record<string, string | undefined>,
    expectedParameters: Record<
      string,
      { defaultAttribute: string; isReferenced: boolean }
    >
  ) {
    const attributeKeys = getAttributeKeysFromCache("codeBlock");
    for (const attributeKey of attributeKeys) {
      const destinaionAttribute = attributeKey.substring(
        "data-decor-attribute-".length
      );
      const attributeContainers = template.querySelectorAll(
        `[${attributeKey}]`
      );
      for (const attributeContainer of attributeContainers) {
        const container = attributeContainer as Element;
        const parameterKey = container.getAttribute(attributeKey);
        if (parameterKey && expectedParameters[parameterKey]) {
          expectedParameters[parameterKey].isReferenced = true;
          if (parameters[parameterKey]) {
            container.setAttribute(
              destinaionAttribute,
              parameters[parameterKey]
            );
          }
        }
      }
    }
    // When expected parameter is not consumed by any attribute, decor apply it to the root element.
    for (const [
      parameterKey,
      { defaultAttribute, isReferenced },
    ] of Object.entries(expectedParameters)) {
      if (!isReferenced) {
        template.setAttribute(defaultAttribute, parameters[parameterKey]);
      }
    }
  }

  return {
    code: (
      code: string,
      infostring: string | undefined,
      escaped: boolean
    ): string => {
      const infoStringTrimmed = (infostring || "").match(/^\S*/)?.[0];
      code = code.replace(/\n$/, "") + "\n";

      const parameters: Record<string, string | undefined> = {
        infoString: infoStringTrimmed,
        content: escaped ? code : escape(code, true),
      };

      const codeBlockTemplate = template.codeBlock.cloneNode(true) as Element;

      replaceContents(codeBlockTemplate, parameters);

      const expectedParameters: Record<
        string,
        { defaultAttribute: string; isReferenced: boolean }
      > = {
        infoString: {
          defaultAttribute: "data-language",
          isReferenced: false,
        },
      };
      addAttributes(codeBlockTemplate, parameters, expectedParameters);

      return codeBlockTemplate.outerHTML;
    },
    blockquote: (quote: string) => {
      const parameters: Record<string, string | undefined> = {
        content: quote,
      };

      const blockQuoteTemplate = template.blockQuote.cloneNode(true) as Element;

      replaceContents(blockQuoteTemplate, parameters);

      addAttributes(blockQuoteTemplate, parameters, {});

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
    link: () => "",
    image: () => "",
    text: (text) => text,
  };
}
