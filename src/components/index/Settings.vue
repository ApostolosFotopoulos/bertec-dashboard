<template>
  <v-row>
    <v-col>
      <v-select
        @change="(v)=>{
          $store.commit('setDataType',v)
        }"
        :disabled="$store.state.options.isSessionRunning"
        :value="$store.state.options.dataType"
        :items="dataType"
        label="Data Type"
        solo
      ></v-select>
    </v-col>
    <v-col>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-bind="attrs"
            v-on="on"
            @change="(v)=>$store.commit('setStepsPerMinuteTarget',Number(v))"
            :value="$store.state.options.stepsPerMinuteTarget"
            label="Steps/Minute"
            solo
            :disabled="$store.state.options.isSessionRunning"
            min="0"
          />
        </template>
        <span>Steps/Minute</span>
      </v-tooltip>
    </v-col>
    <v-col>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-bind="attrs"
          v-on="on"
          @change="(v)=>$store.commit('setFrequency',Number(v))"
          :value="$store.state.options.frequency"
          label="Frequency"
          solo
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
        </template>
        <span>Frequency</span>
      </v-tooltip>
    </v-col>
    <v-col>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-bind="attrs"
          v-on="on"
          @change="(v)=>$store.commit('setThreshold',Number(v))"
          :value="$store.state.options.threshold"
          label="Threshold"
          solo
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
        </template>
        <span>Threshold</span>
      </v-tooltip>
    </v-col>
    <v-col>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-bind="attrs"
          v-on="on"
          @change="(v)=>$store.commit('setNofLines',Number(v))"
          :value="$store.state.options.nOfLines"
          label="Number of Lines"
          solo
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
        </template>
        <span>Number of Lines</span>
      </v-tooltip>
    </v-col>
  </v-row>
</template>