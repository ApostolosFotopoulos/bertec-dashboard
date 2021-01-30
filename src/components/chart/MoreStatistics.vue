<template>
  <v-row class="text-center">
    <v-col>
      <v-card color="#262D47" class="pa-1">
        <h2 class="card-title">Force</h2>
        <h1 class="metric-value">{{$store.state.force}}</h1>
      </v-card>
    </v-col>
    <v-col>
      <v-card color="#262D47" class="pa-1">
        <h2 class="card-title">Number of Steps</h2>
        <h1 class="metric-value">{{$store.state.nOfSteps}}</h1>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  
}
</script>

<style scoped>
</style>