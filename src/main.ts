import { marked } from "./deps/marked.ts";

const tokens = marked.lexer("Hello, *World!*");
console.log(tokens);
