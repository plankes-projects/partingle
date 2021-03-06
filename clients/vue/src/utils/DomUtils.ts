export class DomUtils {
  public static getDomElementByRef(vue: Vue, ref: string): Element | null {
    const elements = vue.$refs[ref];
    if (elements instanceof Array) {
      const element = elements[0];
      if (element instanceof Element) {
        return element;
      }
    }
    return null;
  }
}
