import { assertSpyCall, spy } from './deps/std/testing.ts'
import { marked } from './deps/marked.ts'
import { Renderer } from './renderer.ts'
import { Parser } from './parser.ts'

function testRenderer(): Renderer {
  return {
    code: () => '',
    blockquote: () => '',
    html: () => '',
    heading: () => '',
    hr: () => '',
    list: () => '',
    listitem: (text) => text,
    checkbox: () => '',
    paragraph: (text) => text,
    table: () => '',
    tablerow: (content) => content,
    tablecell: (content) => content,
    strong: () => '',
    em: () => '',
    codespan: () => '',
    br: () => '',
    del: () => '',
    link: () => '',
    image: () => '',
    text: (text) => text,
  }
}

Deno.test(
  '`code` callback receives arguments (code, infostring, escaped)',
  () => {
    const renderer = testRenderer()
    const codeSpy = spy(renderer, 'code')

    Parser.parse(
      renderer,
      marked.lexer('```js\nconsole.log(\'Hello, World!\');\n```'),
    )

    assertSpyCall(codeSpy, 0, {
      args: ['console.log(\'Hello, World!\');', 'js', false],
    })
  },
)

Deno.test('`blockqote` callback receives arguments (quote)', () => {
  const renderer = testRenderer()
  const blockquoteSpy = spy(renderer, 'blockquote')

  Parser.parse(renderer, marked.lexer('> Hello, World!'))

  assertSpyCall(blockquoteSpy, 0, {
    args: ['Hello, World!'],
  })
})

Deno.test('`html` callback receives arguments (html, block)', () => {
  const renderer = testRenderer()
  const htmlSpy = spy(renderer, 'html')

  Parser.parse(renderer, marked.lexer('<p>Hello, World!</p>'))

  assertSpyCall(htmlSpy, 0, {
    args: ['<p>Hello, World!</p>', true],
  })
})

Deno.test('`headding` callback receives arguments (text, level, raw)', () => {
  const renderer = testRenderer()
  const headingSpy = spy(renderer, 'heading')

  Parser.parse(renderer, marked.lexer('# Headding'))

  assertSpyCall(headingSpy, 0, {
    args: ['Headding', 1, 'Headding'],
  })
})

Deno.test('`hr` callback receives arguments ()', () => {
  const renderer = testRenderer()
  const hrSpy = spy(renderer, 'hr')

  Parser.parse(renderer, marked.lexer('-----'))

  assertSpyCall(hrSpy, 0, {
    args: [],
  })
})

Deno.test('`list` callback receives arguments (body, ordered, start)', () => {
  const renderer = testRenderer()
  const listSpy = spy(renderer, 'list')

  Parser.parse(renderer, marked.lexer('1. Hello, World!'))

  assertSpyCall(listSpy, 0, {
    args: ['Hello, World!', true, 1],
  })
})

Deno.test(
  '`listitem` callback receives arguments (text, ordered, task, checked)',
  () => {
    const renderer = testRenderer()
    const listitemSpy = spy(renderer, 'listitem')

    Parser.parse(renderer, marked.lexer('* Hello, World!'))

    assertSpyCall(listitemSpy, 0, {
      args: ['Hello, World!', false, false, false],
    })
  },
)

Deno.test('`checkebox` callback receives arguments (checked)', () => {
  const renderer = testRenderer()
  const checkboxSpy = spy(renderer, 'checkbox')

  Parser.parse(renderer, marked.lexer('- [x] Hello, World!'))

  assertSpyCall(checkboxSpy, 0, {
    args: [true],
  })
})

Deno.test('`paragraph` callback receives arguments (text)', () => {
  const renderer = testRenderer()
  const paragraphSpy = spy(renderer, 'paragraph')

  Parser.parse(renderer, marked.lexer('Hello, World!'))

  assertSpyCall(paragraphSpy, 0, {
    args: ['Hello, World!'],
  })
})

Deno.test('`table` callback receives arguments (header, body)', () => {
  const renderer = testRenderer()
  const tableSpy = spy(renderer, 'table')

  Parser.parse(renderer, marked.lexer('| Header |\n ----- |\n Body |'))

  assertSpyCall(tableSpy, 0, {
    args: ['Header', 'Body'],
  })
})

Deno.test('`tablerow` callback receives arguments (content, flags)', () => {
  const renderer = testRenderer()
  const tablerowSpy = spy(renderer, 'tablerow')

  Parser.parse(renderer, marked.lexer('| Header |\n ----- |\n Body |'))

  assertSpyCall(tablerowSpy, 0, {
    args: ['Header', { header: true }],
  })

  assertSpyCall(tablerowSpy, 1, {
    args: ['Body', { header: false }],
  })
})

Deno.test('`tablecell` callback receives arguments (content, flags)', () => {
  const renderer = testRenderer()
  const tablecellSpy = spy(renderer, 'tablecell')

  Parser.parse(renderer, marked.lexer('| Header |\n ----- |\n Body |'))

  assertSpyCall(tablecellSpy, 0, {
    args: ['Header', { header: true, align: null }],
  })

  assertSpyCall(tablecellSpy, 1, {
    args: ['Body', { header: false, align: null }],
  })
})

Deno.test('`strong` callback receives arguments (text)', () => {
  const renderer = testRenderer()
  const strongSpy = spy(renderer, 'strong')

  Parser.parse(renderer, marked.lexer('**Hello, World!**'))

  assertSpyCall(strongSpy, 0, {
    args: ['Hello, World!'],
  })
})

Deno.test('`em` callback receives arguments (text)', () => {
  const renderer = testRenderer()
  const emSpy = spy(renderer, 'em')

  Parser.parse(renderer, marked.lexer('*Hello, World!*'))

  assertSpyCall(emSpy, 0, {
    args: ['Hello, World!'],
  })
})

Deno.test('`codespan` callback receives arguments (code)', () => {
  const renderer = testRenderer()
  const codespanSpy = spy(renderer, 'codespan')

  Parser.parse(renderer, marked.lexer('`Hello, World!`'))

  assertSpyCall(codespanSpy, 0, {
    args: ['Hello, World!'],
  })
})

Deno.test('`br` callback receives arguments ()', () => {
  const renderer = testRenderer()
  const brSpy = spy(renderer, 'br')

  Parser.parse(renderer, marked.lexer('line1  \nline2'))

  assertSpyCall(brSpy, 0, {
    args: [],
  })
})

Deno.test('`del` callback receives arguments (text)', () => {
  const renderer = testRenderer()
  const delSpy = spy(renderer, 'del')

  Parser.parse(renderer, marked.lexer('~~Hello, World!~~'))

  assertSpyCall(delSpy, 0, {
    args: ['Hello, World!'],
  })
})

Deno.test('`link` callback receives arguments (href, title, text)', () => {
  const renderer = testRenderer()
  const linkSpy = spy(renderer, 'link')

  Parser.parse(
    renderer,
    marked.lexer('[Hello, World!](https://example.com "title")'),
  )

  assertSpyCall(linkSpy, 0, {
    args: ['https://example.com', 'title', 'Hello, World!'],
  })
})

Deno.test('`image` callback receives arguments (href, title, text)', () => {
  const renderer = testRenderer()
  const imageSpy = spy(renderer, 'image')

  Parser.parse(
    renderer,
    marked.lexer('![Hello, World!](https://example.com/image.jpg "title")'),
  )

  assertSpyCall(imageSpy, 0, {
    args: ['https://example.com/image.jpg', 'title', 'Hello, World!'],
  })
})

Deno.test('`text` callback receives arguments (text)', () => {
  const renderer = testRenderer()
  const textSpy = spy(renderer, 'text')

  Parser.parse(renderer, marked.lexer('Hello, World!'))

  assertSpyCall(textSpy, 0, {
    args: ['Hello, World!'],
  })
})
