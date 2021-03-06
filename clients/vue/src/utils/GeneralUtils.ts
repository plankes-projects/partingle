export class GeneralUtils {
  public static async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static isDevEnv(): boolean {
    return window.location.href.startsWith("http://localhost:");
  }
}
