import {
  assertSpyCall,
  spy,
} from "https://deno.land/std@0.201.0/testing/mock.ts";
import { marked } from "./marked.ts";
import { Renderer } from "./renderer.ts";
import { Parser } from "./parser.ts";

function testRenderer(): Renderer {
  return {
    code: () => "",
    blockquote: () => "",
    html: () => "",
    heading: () => "",
    hr: () => "",
    list: () => "",
    listitem: () => "",
    checkbox: () => "",
    paragraph: (text) => text,
    table: () => "",
    tablerow: () => "",
    tablecell: () => "",
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

Deno.test(
  "`code` callback receives arguments (code, infostring, escaped)",
  () => {
    const renderer = testRenderer();
    const codeSpy = spy(renderer, "code");

    Parser.parse(
      renderer,
      marked.lexer("```js\nconsole.log('Hello, World!');\n```")
    );

    assertSpyCall(codeSpy, 0, {
      args: ["console.log('Hello, World!');", "js", false],
    });
  }
);

Deno.test("`blockqote` callback receives arguments (quote)", () => {
  const renderer = testRenderer();
  const blockquoteSpy = spy(renderer, "blockquote");

  Parser.parse(renderer, marked.lexer("> Hello, World!"));

  assertSpyCall(blockquoteSpy, 0, {
    args: ["Hello, World!"],
  });
});

Deno.test("`html` callback receives arguments (html, block)", () => {
  const renderer = testRenderer();
  const htmlSpy = spy(renderer, "html");

  Parser.parse(renderer, marked.lexer("<p>Hello, World!</p>"));

  assertSpyCall(htmlSpy, 0, {
    args: ["<p>Hello, World!</p>", true],
  });
});

Deno.test("`headding` callback receives arguments (text, level, raw)", () => {
  const renderer = testRenderer();
  const headingSpy = spy(renderer, "heading");

  Parser.parse(renderer, marked.lexer("# Headding"));

  assertSpyCall(headingSpy, 0, {
    args: ["Headding", 1, "Headding"],
  });
});

Deno.test("`hr` callback receives arguments ()", () => {
  const renderer = testRenderer();
  const hrSpy = spy(renderer, "hr");

  Parser.parse(renderer, marked.lexer("-----"));

  assertSpyCall(hrSpy, 0, {
    args: [],
  });
});
