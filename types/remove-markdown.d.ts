declare module 'remove-markdown' {
  interface RemoveMarkdownOptions {
    stripListLeaders?: boolean;
    listUnicodeChar?: string;
    gfm?: boolean;
    useImgAltText?: boolean;
    abbr?: boolean;
    replaceLinksWithURL?: boolean;
    separateLinksAndTexts?: string;
    htmlTagsToSkip?: string[];
  }

  function removeMarkdown(markdown: string, options?: RemoveMarkdownOptions): string;
  export = removeMarkdown;
}
