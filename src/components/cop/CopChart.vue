<template>
  <v-card elevation="10" color="#25282F">
    <v-row>
      <v-col>
        <VueApexCharts height="800" class="text-center" type="scatter" :options="copChartOptions" :series="$store.state.seriesLeftPlate"/>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
//<VueApexCharts height="800" class="text-center" type="scatter" :options="redLineOptions" :series="$store.state.seriesLeftPlate"/>
const { ipcRenderer } = window.require('electron')
const defaultOptions = require("../../../assets/options/lineChart.json")

import VueApexCharts from 'vue-apexcharts'
export default {
  components:{
    VueApexCharts
  },
  data(){
    return{
      copChartOptions:{
        ...defaultOptions,
      }
    }
  },
  mounted(){
    var _this = this
    ipcRenderer.on('SESSION_RESPONSE_COP',(_,responseData)=>{
      if(responseData.isSessionRunning){
        _this.updateVariables(responseData)
      } else {
        //_this.$store.commit('resetLineChartState')
      }
    }) 
  },
  methods:{
    updateVariables(responseData){
      this.$store.commit('setWeight',responseData.weight)
      this.$store.commit('setForce',responseData.force)
      this.$store.commit('setStepsPerMinuteTarget',responseData.stepsPerMinuteTarget)
      this.$store.commit('setFrequency',responseData.frequency)
      this.$store.commit('setThreshold',responseData.threshold)
      this.$store.commit('setNofLines',responseData.nOfLines)
      this.$store.commit('setLeftAndRightPlateAtCOP',responseData.rows)
    }
  }
}
</script>