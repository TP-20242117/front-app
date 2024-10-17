<template>
  <div class="app-container">
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  components: {},
  setup() {
    const route = useRoute();

    const showHeader = computed(() => {
      return !['/', '/register'].includes(route.path);
    });

    const showSidebar = computed(() => {
      return !['/', '/register'].includes(route.path);
    });

    return {
      showHeader,
      showSidebar
    };
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700&display=swap');

body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  background-color: #f9f9f9;
  font-weight: 300;
}
</style>
