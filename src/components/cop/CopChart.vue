<template>
  <v-card elevation="10" color="#25282F">
    <v-row>
      <v-col>
        <VueApexCharts 
          height="800" 
          class="text-center" 
          type="scatter"
          ref="leftPlateChart"  
          :options="leftFootChart" 
          :series="$store.state.copChart.leftPlateFinalSeries"
        />
      </v-col>
      <v-col>
        <VueApexCharts 
          height="800" 
          ref="rightPlateChart"
          class="text-center" 
          type="scatter" 
          :options="rightFootChart" 
          :series="$store.state.copChart.rightPlateFinalSeries"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
const { ipcRenderer } = window.require('electron')
const defaultOptions = require("../../../assets/options/copChart.json")

import VueApexCharts from 'vue-apexcharts'
export default {
  components:{
    VueApexCharts
  },
  data(){
    return{
      leftFootChart:{
        ...defaultOptions,
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
            show:true,
          },
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.copChart.leftPlateFinalSeries.length-2)){
            return "#d32d41"
          } else {
            return "gray"
          }
        }]
      },
      rightFootChart:{
        ...defaultOptions,
        yaxis: {
          max: this.$store.state.axesMax,
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
          if(seriesIndex == (this.$store.state.copChart.rightPlateFinalSeries.length - 2)){
            return "#6ab187"
          } else {
            return "gray"
          }
        }]
      }
    }
  },
  mounted(){
    var _this = this
    ipcRenderer.on('SESSION_RESPONSE_COP',(_,responseData)=>{
      if(responseData.isSessionRunning){
        _this.updateVariables(responseData)
      } else {
        _this.$store.commit('resetCOPChartState')
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
      this.$store.commit('setLeftPlateAtCOP',responseData.rows)
      this.$store.commit('setRightPlateAtCOP',responseData.rows)
    },
  }
}
</script>