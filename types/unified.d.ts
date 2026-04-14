declare module 'unified' {
  export interface Plugin<T = any[], S = any> {
    (...args: T): S;
  }
}
