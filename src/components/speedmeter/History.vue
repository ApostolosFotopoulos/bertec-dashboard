<template>
  <v-card color="#262D47" class="pa-4 history">
    <v-row>
      <v-col cols="4" offset="1" class="text-center">
        Left Foot Maximum:
        <div
          v-for="(item,index) in $store.state.speedmeter.maxHistoryLeftPlate.slice().reverse()"
          :key="index"
        >
          <h2 v-if="index == 0">{{item.toFixed(1)}}</h2>
          <span v-else>{{item.toFixed(1)}}</span>
        </div>
      </v-col>
      <v-col cols="4" offset="2">
        Right Foot Maximum:
          <div
          v-for="(item,index) in $store.state.speedmeter.maxHistoryRightPlate.slice().reverse()"
          :key="index"
        >
          {{item.toFixed(1)}}
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
.history{
  min-height: 300px;
  max-height: 300px;
  overflow-y: scroll;
}

.history::-webkit-scrollbar-track{
	background-color: 25282F !important;
}
.history::-webkit-scrollbar-track{
	background-color:#25282F !important;
}
.history::-webkit-scrollbar{
	width: 8px;
	background-color:25282F !important;
  border-radius: 20px;
}
.history::-webkit-scrollbar-thumb{
	background-color: #eee9ee!important;
	border: 2px solid #eee9ee!important;
  border-radius: 20px;
}
</style>