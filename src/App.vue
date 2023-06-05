<template>
  <FPS></FPS>
</template>


<script>
import { BasicScene } from "./three/scene";
import FPS from "./components/FPS.vue";
export default {
  components: { FPS },

  setup() {
    new BasicScene();
  },
};
</script>


