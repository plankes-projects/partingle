import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import Buefy from "buefy";
import "buefy/dist/buefy.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ExceptionHandler } from "./utils/ExceptionHandler";

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

//##########################################
//setup vue
library.add(fas);
Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.use(Buefy, { defaultIconPack: "fas" });

Vue.config.errorHandler = function(err, vm, info) {
  ExceptionHandler.handle(err, vm);
};

//https://maronato.github.io/vue-toastification/
Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true,
  timeout: 2000,
  position: "top-right",
  showCloseButtonOnHover: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
});

Vue.config.productionTip = false;
const vue = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
