import { marked } from "/deps.ts";

const tokens = marked.lexer("Hello, *World!*");
console.log(tokens);
