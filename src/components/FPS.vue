<template>
  <span id="fps">{{ fps }} FPSS</span>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
export default {
  setup() {
    const store = useStore();
    const fps = computed(() => store.state.fps);
    return { fps };
  },
};
</script>

<style scoped>
#fps {
  position: absolute;
  right: 20px;
  top: 20px;
  color: #04fe04;
}
</style>