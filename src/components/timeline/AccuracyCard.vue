<template>
  <v-container>
    <v-row>
      <v-col cols="2" offset="2">
        <v-card class="text-center" color="#4C5270" elevation="10">
          <div class="pa-1">
            <h4 class="text-color">Accuracy</h4>
            <h1 class="text-color">{{$store.state.timeline.leftAccuracy}}%</h1>
          </div>
        </v-card>
      </v-col>
      <v-col cols="2" offset="4">
        <v-card class="text-center" color="#4C5270" elevation="10">
          <div class="pa-1">
            <h4 class="text-color">Accuracy</h4>
            <h1 class="text-color">{{$store.state.timeline.rightAccuracy}}%</h1>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.text-color{
  color: #E5DDC8;
}
</style>