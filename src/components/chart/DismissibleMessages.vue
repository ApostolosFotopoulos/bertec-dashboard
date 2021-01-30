<template>
  <v-card elevation="15">
    <v-alert
      type="error"
      color="red"
      v-model="isVisible"
      transition="fade-transition"
    >
      Something went wrong
    </v-alert>
  </v-card>
</template>

<script>
export default {
  beforeMount(){
    setInterval(()=>{
      this.isVisible =!this.isVisible
    },10000)
  },
  data(){
    return{
      isVisible:true,
    }
  }
}
</script>

<style scoped>
</style>