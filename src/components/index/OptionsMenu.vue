<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <v-select
          @change="(v)=>$store.commit('setSelectedProtocol',v)"
          :value="this.$store.state.selectedProtocol"
          :items="protocols"
          label="Protocol"
          :disabled="$store.state.isSessionRunning"
          solo
        ></v-select>
      </v-col>
      <v-col>
      <v-text-field
        @change="(v)=>$store.commit('setTime',v)"
        :value="this.$store.state.duration"
        label="Time (in seconds)"
        solo
        :disabled="$store.state.isSessionRunning"
        min="0"
      />
      </v-col>
      <v-col>
        <v-btn 
          :class="$store.state.isSessionRunning?'stopButton v-input__control':'startButton v-input__control'" 
          @click="()=>startStopSession()"
          :disabled="$store.state.time == '' || $store.state.filePath ==''"
        >
          {{$store.state.isSessionRunning?'Stop':'Start'}}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8">
        <v-text-field
          @change="(v)=>$store.commit('setWeight',v)"
          :value="this.$store.state.weight"
          label="Weight (in Kg)"
          solo
          :disabled="$store.state.isSessionRunning"
        />
      </v-col>
      <v-col>
        <v-btn 
          class="getWeight v-input__control"
          :disabled="$store.state.isSessionRunning"
        >
          Get Weight
          
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-checkbox
          v-model="isChartChecked"
          label="Display Charts"
          color="#6ab187"
          hide-details
          @change="chartCheckboxHandler"
        ></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          v-model="isCopChecked"
          label="Display COP"
          color="#6ab187"
          hide-details
          @change="copCheckboxHandler"
        ></v-checkbox>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
export default {
  data(){
    return{
      isChartChecked: false,
      isCopChecked: false,
      ipcRenderer: window.require('electron').ipcRenderer,
      protocols:["Walking","Running","Jumping","Landing","Balance"],
    }
  },
  beforeMount(){
    setInterval(()=>{ ipcRenderer.send('WINDOWS_STATUS') },100)
    ipcRenderer.on('WINDOWS_STATUS_RESPONSE',(_,responseData)=>{
      const { chartWindowVisible, copWindowVisible } = responseData
      this.isChartChecked = chartWindowVisible
      this.isCopChecked = copWindowVisible
    })
  },
  methods:{
    startStopSession(){
      if(this.$store.state.isSessionRunning){
        this.$store.commit('startStopSession',false)
        this.ipcRenderer.send('STOP_SESSION',)
      } else {
        this.$store.commit('startStopSession',true)
        this.ipcRenderer.send('START_SESSION',{ weight: this.$store.state.weight })
      }
    },
    chartCheckboxHandler(){
      if(this.isChartChecked){
        this.ipcRenderer.send('OPEN_CHART_WINDOW');
      } else {
        this.ipcRenderer.send('CLOSE_CHART_WINDOW');
      }
    },
    copCheckboxHandler(){
      if(this.isCopChecked){
        this.ipcRenderer.send('OPEN_COP_WINDOW');
      } else {
        this.ipcRenderer.send('CLOSE_COP_WINDOW');
      }
    }
  }
}
</script>

<style scoped>
.startButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
.stopButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #d32d41!important;
}
.getWeight{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187!important;
}
</style>