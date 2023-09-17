import { marked } from "./marked.ts";

const tokens = marked.lexer("Hello, *World!*");
console.log(tokens);
