import { InitialData } from "@/generated/api-axios";

export class StateUtils {
  public static setInitialData(data: InitialData | null) {
    if (!data) {
      localStorage.removeItem("initialData");
    } else {
      localStorage.initialData = JSON.stringify(data);
    }
  }
  public static getInitialData(): InitialData | null {
    if (localStorage.initialData) {
      return JSON.parse(localStorage.initialData);
    }
    return null;
  }

  public static setAvatarId(id: number | null) {
    if (!id) {
      localStorage.removeItem("avatarId");
    } else {
      localStorage.avatarId = id;
    }
  }

  public static getAvatarId(): number | null {
    if (localStorage.avatarId) {
      return localStorage.avatarId;
    }
    return null;
  }
}
