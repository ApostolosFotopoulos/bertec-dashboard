<template>
  <v-app light>
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {};
</script>

<style>
html,
body,
.v-application--wrap {
  height: 100%;
  width: 100%;
  margin: 0 auto;
  background: #25282f !important;
  color: #fff !important;
}
html::-webkit-scrollbar-track {
  background-color: 25282f !important;
}
html::-webkit-scrollbar-track {
  background-color: #25282f !important;
}
html::-webkit-scrollbar {
  width: 8px;
  background-color: 25282f !important;
  border-radius: 20px;
}
html::-webkit-scrollbar-thumb {
  background-color: #eee9ee !important;
  border: 2px solid #eee9ee !important;
  border-radius: 20px;
}
</style>