import { createStore } from "vuex";

export default createStore({
  state: {
    title: "chris",
    fps: 0,
  },
  mutations: {
    SET_FPS(state, value) {
      state.fps = value;
    },
  },
  actions: {},
  modules: {},
});
