<template>
  <v-row>
    <v-col cols="6">
      <h3>Left Force Plate</h3>
      <v-select
        class="mt-3"
        @change="(v)=>$store.commit('setLeftPlateChannel',v)"
        :value="$store.state.lineChart.leftPlateChannel"
        :items="leftForcePlateChannels"
        label="Channels"
        solo
      ></v-select>
    </v-col>
    <v-col  cols="6">
      <h3>Right Force Plate</h3>
      <v-select
        class="mt-3"
        @change="(v)=>$store.commit('setRightPlateChannel',v)"
        :value="$store.state.lineChart.rightPlateChannel"
        :items="rightForcePlateChannels"
        label="Channels"
        solo
      ></v-select>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data(){
    return{
      leftForcePlateChannels: ["FX1","FY1","FZ1","MX1","MY1","MZ1","COPX1","COPY1","COPXY1"],
      rightForcePlateChannels: ["FX2","FY2","FZ2","MX2","MY2","MZ2","COPX2","COPY2","COPXY2"],
    }
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