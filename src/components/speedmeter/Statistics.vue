<template>
  <v-container>
    <v-row class="text-center mt-5">
      <v-col>
        <v-card color="#262D47" class="pa-1">
          <h2 class="card-title">Force FZ1</h2>
          <h1 class="metric-value">{{$store.state.speedmeter.forceFZ1.toFixed(1)}}</h1>
        </v-card>
      </v-col>
      <v-col>
        <v-card color="#262D47" class="pa-1">
          <h2 class="card-title">Steps</h2>
          <h1 class="metric-value">{{$store.state.speedmeter.nOfSteps}}</h1>
        </v-card>
      </v-col>
      <v-col>
        <v-card color="#262D47" class="pa-1">
          <h2 class="card-title">Steps/minute</h2>
          <h1 class="metric-value">{{Math.floor($store.state.speedmeter.stepsPerMinute)}}</h1>
        </v-card>
      </v-col>
      <v-col>
        <v-card color="#262D47" class="pa-1">
          <h2 class="card-title">Force FZ2</h2>
          <h1 class="metric-value">{{$store.state.speedmeter.forceFZ2.toFixed(1)}}</h1>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>