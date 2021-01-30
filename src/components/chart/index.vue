<template>
  <v-container>
    <h1 class="pa-2">Dashboard - Overview</h1>
    <hr class="hr">
    <SaveFile/>
    <OptionsMenu/>
    <Messages/>
  </v-container>
</template>

<script>
export default {
  head(){
    return{
      title:"Analysis Dashboard"
    }
  },
}
</script>

<style scoped>
</style>