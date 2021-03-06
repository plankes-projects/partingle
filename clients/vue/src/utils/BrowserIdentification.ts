export class BrowserIdentification {
  public static isFireFox() {
    return navigator.userAgent.indexOf("Firefox") > -1;
  }

  public static isOpera() {
    return (navigator.userAgent.indexOf("Opera") > -1) || 
      (navigator.userAgent.indexOf("OPR") > -1);
  }
}
