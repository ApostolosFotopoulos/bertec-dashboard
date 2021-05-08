<template>
  <v-container>
    <v-row class="text-center mt-5">
      <v-col>
        <v-card color="#262D47" class="pa-1">
          <h4 class="card-title">Force FZ1</h4>
          <h2 class="metric-value">
            {{
              $store.state.speedmeter.forceFZ1 &&
              $store.state.speedmeter.forceFZ1.toFixed(1)
            }}
          </h2>
        </v-card>
      </v-col>
      <v-col>
        <v-card color="#262D47" class="pa-1">
          <h4 class="card-title">Force FZ2</h4>
          <h2 class="metric-value">
            {{
              $store.state.speedmeter.forceFZ2 &&
              $store.state.speedmeter.forceFZ2.toFixed(1)
            }}
          </h2>
        </v-card>
      </v-col>
      <v-col>
        <v-card color="#262D47" class="pa-1">
          <h4 class="card-title">Steps</h4>
          <h2 class="metric-value">{{ $store.state.speedmeter.nOfSteps }}</h2>
        </v-card>
      </v-col>
      <v-col>
        <v-card color="#262D47" class="pa-1">
          <h4 class="card-title">Steps/minute</h4>
          <h2 class="metric-value">
            {{ Math.floor($store.state.speedmeter.stepsPerMinute) }}
          </h2>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>