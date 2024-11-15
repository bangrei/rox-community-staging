import camelCase from "lodash/camelCase";
import upperFirst from "lodash/upperFirst";
import moment from "moment-timezone";
import { createApp } from "vue";
import App from "./App.vue";
import LazyLoadDirectives from "./directives/LazyLoadDirectives";
import router from "./router";
import store from "./store";
//import LogRocket from "logrocket";
import "./assets/scss/main.scss";
import eventStatusesHandler from "./lib/eventStatusesHandler";

const app = createApp(App);

const requireComponent = require.context(
  // The relative path of the components folder
  "./components/base",
  // Whether or not to look in subfolders
  false,
  // The regular expression used to match base component filenames
  /Base[A-Z]\w+\.(vue|js)$/
);

requireComponent.keys().forEach((fileName) => {
  // Get component config
  const componentConfig = requireComponent(fileName);

  // Get PascalCase name of component
  const componentName = upperFirst(
    camelCase(
      // Gets the file name regardless of folder depth
      fileName
        .split("/")
        .pop()
        .replace(/\.\w+$/, "")
    )
  );

  app.component(
    componentName,
    // Look for the component options on `.default`, which will
    // exist if the component was exported with `export default`,
    // otherwise fall back to module's root.
    componentConfig.default || componentConfig
  );
});

app.directive("lazyload", LazyLoadDirectives);
app.use(store).use(router).mount("#app");
// app.use(store).use(router).use(vueCrypt).mount("#app");
/*
const isUsingLogRocket = process?.env?.VUE_APP_LOG_ROCKET_ID ? true : false;
if (isUsingLogRocket)
	LogRocket.init(process?.env?.VUE_APP_LOG_ROCKET_ID, {
		shouldCaptureIP: false,
		release: store?.state?.appVersion,
	});
*/

const isLoggedIn = store.getters.isLoggedIn;
if (isLoggedIn) {
  window.addEventListener("load", () => {
    eventStatusesHandler.updateStatuses();
  });
}
const events = [
  "scroll",
  "keypress",
  "touchstart",
  "mousemove",
  "click",
  "pointermove",
  "blur",
  "focus",
];
events.forEach((event) => {
  document.addEventListener(
    event,
    () => {
      var now = moment();
      localStorage.setItem("idle-timestamp", now.format("x"));
    },
    true
  );
});
window.setInterval(() => {
  var now = moment();
  var lastLogin = localStorage.getItem("idle-timestamp");
  var lastTime = lastLogin
    ? moment.tz(parseInt(lastLogin), "Asia/Singapore").format("YYYYMMDD")
    : moment().format("YYYYMMDD");
  var thisTime = moment.tz(moment(), "Asia/Singapore").format("YYYYMMDD");

  if (parseInt(thisTime) != parseInt(lastTime) && store.getters.isLoggedIn) {
    store.dispatch("clearLoginToken");
    store.dispatch("clearCustomer");
    if (store.getters.FBLogin) {
      store.getters.FBLogin.logout(() => {
        store.dispatch("setFBLogin", null);
      });
    }
    localStorage.setItem(
      "idle-timestamp",
      moment.tz(now, "Asia/Singapore").format("x")
    );
    router.replace({ name: "LoginPage" });
  }
}, 1000);

// const isUsingLogRocket = process?.env?.VUE_APP_LOG_ROCKET_ID ? true : false;
// if (isUsingLogRocket)
// 	LogRocket.init(process?.env?.VUE_APP_LOG_ROCKET_ID, {
// 		shouldCaptureIP: false,
// 		release: store?.state?.appVersion,
// 	});
