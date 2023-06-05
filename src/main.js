import { createApp } from "vue";
import "reset.css";
import "./style.css";
import store from "./store";
import App from "./App.vue";

createApp(App).use(store).mount("#app");
