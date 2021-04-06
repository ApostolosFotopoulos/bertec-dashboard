<template>
  <v-container>
    <SpeedMetersCharts/>
    <Statistics/>
    <v-container>
      <v-row>
        <v-col cols="3" offset="7">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-bind="attrs"
                v-on="on"
                @change="(v)=>$store.commit('setStepsPerMinuteTargetAtSpeedmeter',Number(v))"
                :value="$store.state.speedmeter.stepsPerMinuteTarget"
                label="Steps/Minute"
                solo
                min="0"
              />
            </template>
            <span>Steps/Minute</span>
          </v-tooltip>
        </v-col>
        <v-col cols="2" align="right">
          <v-btn @click="$store.commit('resetSpeedmeterState')" class="resetButton  v-input__control">Reset</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import SpeedMetersCharts from '../components/speedmeter/SpeedMetersCharts.vue'
import Statistics from '../components/speedmeter/Statistics.vue'

export default {
  components:{
    SpeedMetersCharts,
    Statistics
  },
  mounted(){
    //setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_SPEEDMETER') },1)
  }
}
</script>

<style scoped>
.resetButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
</style>