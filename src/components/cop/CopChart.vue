<template>
  <v-card elevation="10" color="#25282F">
    <v-row class="mt-2">
      <v-col cols="6">
        <div class="pa-3">
          <VueApexCharts height="650" class="text-center" type="scatter" :options="redLineOptions" :series="$store.state.seriesLeftPlate"/>
        </div>
      </v-col>
      <v-col cols="6">
        <div class="pa-3">
          <VueApexCharts height="650" class="text-center" type="scatter" :options="greenLineOptions" :series="$store.state.rightPlatePoints"/>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import VueApexCharts from 'vue-apexcharts'
const defaultLineChartOptions = require("../../assets/copOptions.json")

export default {
  components:{
    VueApexCharts
  },
  data(){
    return{
      redLineOptions: {
        ...defaultLineChartOptions,
        yaxis: {
          dataLabels:{
            show:false,
            enabled:false,
          },
          labels:{
            style:{
              colors:['#fff']
            },
            formatter: (val)=>{
              return val.toFixed(0)
            }
          },
        },
        xaxis:{
          dataLabels:{
            show:false,
            enabled:false,
          },
          labels:{
            style:{
              colors:['#fff']
            },
            formatter: (val)=>{
              if (val.toFixed(0)%10 == 0){
                return val.toFixed(0)
              }
            },
            show:false,
          },
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.seriesLeftPlate.length)){
            return "#d32d41"
          } else {
            return "gray"
          }
        }]
      },
      greenLineOptions: {
        forceNiceScale: true,
        ...defaultLineChartOptions,
        yaxis: {
          dataLabels:{
            show:false,
            enabled:false,
          },
          labels:{
            style:{
              colors:['#fff']
            },
            formatter: (val)=>{
              return val.toFixed(0)
            }
          },
        },
        xaxis:{
          dataLabels:{
            show:false,
            enabled:false,
          },
          labels:{
            style:{
              colors:['#fff']
            },
            show:true,
            formatter: (val)=>{
              if (val.toFixed(0)%10 == 0){
                return val.toFixed(0)
              }
            },
          },
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.seriesRightPlate.length - 1)){
            return "#d32d41"
          } else {
            return "gray"
          }
        }]
      },
    }
  },
  beforeMount(){
    var self = this
    ipcRenderer.on('SESSION_RESPONSE_COP',(_,responseData)=>{
      if(responseData.isSessionRunning){
        //console.log(responseData.rows)
        self.$store.commit("setLeftPlatePoints",responseData.rows)
        self.$store.commit('setFrequency',Number(responseData.frequency))
        self.$store.commit('setThreshold',Number(responseData.threshold))
        self.$store.commit('setNofLines',Number(responseData.nOfLines))
      } else {
        self.$store.commit("resetState")
      }
    })
  },
}
</script>