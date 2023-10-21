/**
 * Renderer
 */
export type Renderer = {
  code(code: string, infostring: string | undefined, escaped: boolean): string
  blockquote(quote: string): string
  html(html: string, block?: boolean): string
  heading(text: string, level: number, raw: string): string
  hr(): string
  list(body: string, ordered: boolean, start: number | ''): string
  listitem(
    text: string,
    ordered: boolean,
    task: boolean,
    checked: boolean,
  ): string
  checkbox(checked: boolean): string
  paragraph(text: string): string
  table(header: string, body: string): string
  tablerow(content: string, flags: { header: boolean }): string
  tablecell(
    content: string,
    flags: {
      header: boolean
      align: 'center' | 'left' | 'right' | null
    },
  ): string

  /**
   * span level renderer
   */
  strong(text: string): string
  em(text: string): string
  codespan(text: string): string
  br(): string
  del(text: string): string
  link(href: string, title: string | null | undefined, text: string): string
  image(href: string, title: string | null, text: string): string
  text(text: string): string
}
