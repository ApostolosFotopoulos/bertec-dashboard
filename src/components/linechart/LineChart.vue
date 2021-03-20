<template>
  <v-card elevation="10" color="#25282F" class="mt-5">
    <v-row>
      <v-col>
        <VueApexCharts height="650" ref="leftPlateChart" class="text-center" type="line" :options="leftFootChart" :series="$store.state.lineChart.leftPlateFinalSeries"/>
      </v-col>
      <v-col>
        <VueApexCharts height="650" ref="rightPlateChart" class="text-center" type="line" :options="rightFootChart" :series="$store.state.lineChart.rightPlateFinalSeries"/>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
const { ipcRenderer } = window.require('electron')
const defaultLineChartOptions = require("../../../assets/options/lineChart.json")

export default {
  components:{
    VueApexCharts
  },
  data(){
    return{
      leftFootChart:{
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
            show:true,
          },
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.lineChart.leftPlateFinalSeries.length - 2 )){
            return "#d32d41"
          } else {
            return "gray"
          }
        }]
      },
      rightFootChart:{
        ...defaultLineChartOptions,
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
          if(seriesIndex == (this.$store.state.lineChart.rightPlateFinalSeries.length - 2)){
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
    ipcRenderer.on('SESSION_RESPONSE_LINECHART',(_,responseData)=>{
      if(responseData.isSessionRunning){
        _this.updateVariables(responseData)
      } else {
        _this.$store.commit('resetLineChartState')
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
      this.$store.commit('setLeftPlateAtLineChart',responseData.rows)
      this.$store.commit('setRightPlateAtLineChart',responseData.rows) 
      if(this.$store.state.lineChart.shouldUpdateLeft){
        this.updateLeftChart()
        this.$store.commit('setShouldUpdateLeft',false)
      }
      if(this.$store.state.lineChart.shouldUpdateRight){
        this.updateRightChart()
        this.$store.commit('setShouldUpdateRight',false)
      }
    },
    updateLeftChart(){
      if(this.$store.state.linechart.yAxisMaxValue != -1 ){
        this.$refs.leftPlateChart.updateOptions({
          ...defaultLineChartOptions,
          yaxis: {
            max:this.$store.state.linechart.yAxisMaxValue,
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
            if(seriesIndex == (this.$store.state.lineChart.leftPlateFinalSeries.length - 2)){
              return "#d32d41"
            } else {
              return "gray"
            }
          }]
        })
      } else {
        this.$refs.leftPlateChart.updateOptions({
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
            show:true,
          },
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.lineChart.leftPlateFinalSeries.length - 2)){
            return "#d32d41"
          } else {
            return "gray"
          }
        }]
      })
      }
    },
    updateRightChart(){
      if(this.$store.state.linechart.yAxisMaxValue != -1 ){
        this.$refs.rightPlateChart.updateOptions({  
          ...defaultLineChartOptions,
          yaxis: {
            max:this.$store.state.linechart.yAxisMaxValue,
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
            if(seriesIndex == (this.$store.state.lineChart.rightPlateFinalSeries.length - 2)){
              return "#6ab187"
            } else {
              return "gray"
            }
          }]
        })
      } else {
        this.$refs.rightPlateChart.updateOptions({  
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
              show:true,
            },
          },
          colors:[({ value, seriesIndex, w })=>{
            if(seriesIndex == (this.$store.state.lineChart.rightPlateFinalSeries.length - 2)){
              return "#6ab187"
            } else {
              return "gray"
            }
          }]
        })
      }
    }
  }
}
</script>