<template>
  <v-card elevation="10" color="#25282F">
    <v-row class="mt-2">
      <v-col cols="6">
        <div class="pa-3">
          <VueApexCharts height="650" ref="chartLeftPlate" class="text-center" type="line" :options="lineChartOptions" :series="$store.state.seriesLeftPlate"/>
        </div>
      </v-col>
      <v-col cols="6">
        <div class="pa-3">
          <VueApexCharts height="650" ref="chartRightPlate" class="text-center" type="line" :options="lineChartOptions" :series="$store.state.seriesRightPlate"/>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
const { ipcRenderer } = window.require('electron')
const defaultLineChartOptions = require("../../assets/lineChartOptions.json")
export default {
  components:{
    VueApexCharts
  },
  data(){
    return{
      lineChartOptions: {
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
            show:false,
          }
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.seriesLeftPlate.length - 1)){
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
    ipcRenderer.on('SESSION_RESPONSE_LINECHART',(_,responseData)=>{
      if(responseData.isSessionRunning){
        self.setupStoreVariables(responseData)
        if(!self.$store.state.isSeriesLeftPlateLocked){
          self.updateLeftChart()
        }
        if(!self.$store.state.isSeriesRightPlateLocked){
          self.updateRightChart()
        }
      } else {
        self.$store.commit("resetState")
      }
    })
  },
  methods:{
    setupStoreVariables(responseData){
      console.log(responseData.rows)
      this.$store.commit('setSeriesLeftPlate',responseData.rows)
      this.$store.commit('setSeriesRightPlate',responseData.rows)
    },
    updateLeftChart(){
      this.$refs.chartLeftPlate.updateOptions({
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
            show:false,
          }
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.seriesLeftPlate.length - 1)){
            return "#d32d41"
          } else {
            return "gray"
          }
        }]
      })
    },
    updateRightChart(){
      this.$refs.chartRightPlate.updateOptions({
        yaxis: {
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
          labels:{
            show:false,
          }
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.seriesRightPlate.length - 1)){
            return "#6ab187"
          } else {
            return "gray"
          }
        }]
      })
    }
  }
}
</script>