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
    paragraph: () => "",
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

Deno.test("Headding callback receives arguments (text, level, raw)", () => {
  const renderer = testRenderer();
  const headingSpy = spy(renderer, "heading");

  Parser.parse(renderer, marked.lexer("# Headding"));

  assertSpyCall(headingSpy, 0, {
    args: ["Headding", 1, "Headding"],
  });
});
