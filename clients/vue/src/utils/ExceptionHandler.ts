import { ErrorStrings } from "./ErrorStrings";
import { RouterNames } from "./RouterNames";

export class ExceptionHandler {
  public static handle(error: Error, vm: Vue) {
    if (error.message == ErrorStrings.CODE_401 || error.message == ErrorStrings.NO_HOUSE) {
      vm.$router.push({ name: RouterNames.NO_HOUSE });
      return;
    }
    console.log(error);
    vm.$router.push({ name: RouterNames.ERROR });
  }
}
