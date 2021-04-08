<template>
  <v-container>
    <v-row class="text-center mt-5">
      <v-col cols="12">
        <v-card color="#262D47" class="pa-4 history">
          <v-row>
            <v-col cols="4" offset="2" class="text-center">
              Left Foot Maximum:
              <v-timeline
                align-top
                dense
              >
                <v-timeline-item
                  :color="`${index == 0?'#6ab187':'#355944'}`"
                  small
                  v-for="(item,index) in $store.state.speedmeter.maxHistoryLeftPlate.slice().reverse()"
                  :key="index"
                >
                {{item.toFixed(1)}}
                </v-timeline-item>
              </v-timeline>
            </v-col>
            <v-col cols="4">
              Right Foot Maximum:
              <v-timeline
                align-top
                dense
              >
                <v-timeline-item
                  :color="`${index == 0?'#d32d41':'#6b151f'}`"
                  small
                  v-for="(item,index) in $store.state.speedmeter.maxHistoryRightPlate.slice().reverse()"
                  :key="index"
                >
                {{item.toFixed(1)}}
                </v-timeline-item>
              </v-timeline>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row> 
  </v-container>
</template>

<style scoped>
.history{
  min-height: 250px;
  max-height: 250px;
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