<template>
  <div>
    <VueApexCharts  class="text-center" type="area" :options="option" :series="series"/>
  </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
const { ipcRenderer } = window.require('electron')
export default {
  components: {
    VueApexCharts: VueApexCharts,
  },
  mounted(){
    setInterval(()=>{ ipcRenderer.send('IS_SESSION_RUNNING',500)}, 500)
    ipcRenderer.on('SESSION_RESPONSE',(_,responseData)=>{
      if(responseData.isSessionRunning){
        let d = this.series[0].data
        d.pop()
        d.unshift(Math.random()*100)
        this.series = [{
          data:d,
        }]
      }
    })
  },
  data(){
    return{
      series:[{
        data:[31, 40, 28, 51, 42, 109, 100]
      }],
      option:{
        "dataLabels":{
          show:false,
        },
        "grid": {
          "padding": {
            "top": 0,
            "right": 10,
            "bottom": 0,
            "left": 10
          }
        },
        "chart": {
          "toolbar":{
              "show":false
          },  
          "type": "area",
        },
        "xaxis": {
          "labels":{
            "style":{
              "colors":["#fff","#fff"]
            }
          },
          "type": "category"
        },
        "yaxis":{
          "labels":{
            "style":{
              "colors":["#fff"]
            },
            formatter: (val)=>{
              return val.toFixed(0)
            }
          },
        },
        "tooltip": {
          "theme": "dark"
        },
        "fill":{
          "type":"solid",
          "colors":["#d32d41","#6ab187"]
        },
        "legend": {
          "labels": {
            "colors":["#d32d41","#6ab187"]
          },
          "markers": {
            "fillColors":["#d32d41","#6ab187"]
          }
        }
      }
    }
  }
}
</script>