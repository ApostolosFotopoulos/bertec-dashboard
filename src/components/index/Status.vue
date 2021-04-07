<template>
  <v-row class="pb-0 mb-0">
    <v-col>
      <v-select
        @change="(v)=>$store.commit('setLeftPlateChannelAtOptions',v)"
        :value="$store.state.options.leftPlateChannel"
        :items="leftForcePlateChannels"
        label="Left Plate Channel"
        solo
      ></v-select>
      <small class="device-status">	• No Device is Connected</small>
    </v-col>
    <v-col>
      <v-text-field
        :value="$store.state.options.leftPlateValue"
        solo
        readonly
      />
    </v-col>
    <v-col>
      <v-select
        @change="(v)=>$store.commit('setRightPlateChannelAtOptions',v)"
        :value="$store.state.options.rightPlateChannel"
        :items="rightForcePlateChannels"
        label="Right Plate Channel"
        solo
      ></v-select>
      <small class="device-status">	• No Device is Connected</small>
    </v-col>
    <v-col>
      <v-text-field
        :value="$store.state.options.rightPlateValue"
        solo
        readonly
      />
    </v-col>
  </v-row>
</template>

<script>
import rowsNames from '../../../assets/store/rowsNames.json'
const { ipcRenderer } = window.require('electron')

export default{
  data(){
    return{
      leftForcePlateChannels: ["FX1","FY1","FZ1","MX1","MY1","MZ1","COPX1","COPY1","COPXY1"],
      rightForcePlateChannels: ["FX2","FY2","FZ2","MX2","MY2","MZ2","COPX2","COPY2","COPXY2"],
    }
  },
  mounted(){
    var _this = this
    ipcRenderer.on('SESSION_RESPONSE_OPTIONS',(_,responseData)=>{
      _this.$store.commit('setLeftPlateValue',responseData.rows[rowsNames[_this.$store.state.options.leftPlateChannel]])
      _this.$store.commit('setRightPlateValue',responseData.rows[rowsNames[_this.$store.state.options.rightPlateChannel]])
    }) 
  },
}
</script>

<style>
.v-menu__content.theme--dark::-webkit-scrollbar{
  background-color: transparent !important;
  width: 0px;
}
.v-menu__content.theme--dark.menuable__content__active::-webkit-scrollbar-track{
	background-color: transparent;
  width: 0px;
}
</style>

<style scoped>
.device-status{
  color:#d32d41;
}
</style>