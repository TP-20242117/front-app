<template>
  <header class="header">
    <h1>MindSort</h1>
  </header>
</template>

<script>
export default {};
</script>

<style scoped>
.header {
  background: linear-gradient(90deg, #1f6fe5 0%, #1d4ed8 100%);
  color: white;
  padding: 0 28px;
  height: 10vh;
  min-height: 72px;
  display: flex;
  align-items: center;
  position: fixed;
  z-index: 1000;
  width: 100vw;
  box-shadow: 0 10px 22px rgba(29, 78, 216, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 2vw, 2.5rem);
  font-weight: 700;
  letter-spacing: 0.04em;
}
</style>
