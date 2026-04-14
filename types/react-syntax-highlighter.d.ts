declare module 'react-syntax-highlighter' {
  import { ComponentType } from 'react';

  interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    PreTag?: string | ComponentType;
    children: string;
    [key: string]: any;
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneDark: any;
  export const oneLight: any;
  export const vs: any;
  export const vscDarkPlus: any;
}
