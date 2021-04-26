<template>
  <v-container class="text-center mt-12">
    <v-row>
      <v-col>
        <vue-speedometer
          textColor="#fff"
          :value="Number($store.state.speedmeter.footAsymmetry.toFixed(2))"
          needleColor="#cbf3f0"
          :minValue="-100"
          :maxValue="100"
          :height="200"
          class="speedmeter"
          :customSegmentStops="customSegmentStops"
          :segmentColors="segmentColors"
        />
        <div class="pa-5">
          <h2>Foot Asymmetry</h2>
        </div>
      </v-col>
      <v-col>
        <vue-speedometer
          textColor="#fff"
          :value="Number($store.state.speedmeter.stepsAsymmetry.toFixed(2))"
          needleColor="#cbf3f0"
          class="speedmeter"
          :minValue="-100"
          :maxValue="100"
          :height="200"
          :customSegmentStops="customSegmentStops"
          :segmentColors="segmentColors"
        />
        <div class="pa-5">
          <h2>Steps Frequency</h2>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import rowNames from "../../../assets/store/rowsNames.json";
const { ipcRenderer } = window.require("electron");
import VueSpeedometer from "vue-speedometer";

export default {
  components: {
    VueSpeedometer,
  },
  data() {
    return {
      segmentColors: [
        "#d62828",
        "#ffbe4d",
        "#5fad56",
        "#5fad56",
        "#ffbe4d",
        "#d62828",
      ],
      customSegmentStops: [-100, -30, -10, 0, 10, 30, 100],
    };
  },
  mounted() {
    var _this = this;
    ipcRenderer.on("SESSION_RESPONSE_SPEEDMETER", (_, responseData) => {
      if (responseData.isSessionRunning) {
        _this.updateVariables(responseData);
      } else {
        _this.$store.commit("resetSpeedmeterState");
      }
    });
  },
  methods: {
    updateVariables(responseData) {
      this.$store.commit("setWeight", responseData.weight);
      this.$store.commit("setForceFZ1", responseData.rows[rowNames["FZ1"]]);
      this.$store.commit("setForceFZ2", responseData.rows[rowNames["FZ2"]]);
      this.$store.commit("setLeftPlateAtSpeedmeter", responseData.rows);
      this.$store.commit("setRightPlateAtSpeedmeter", responseData.rows);
      this.$store.commit("calculatefootAsymmetries");
    },
  },
};
</script>


<style>
.current-value {
  display: none;
}
.speedmeter {
  transform: scale(1.3);
}
.v-text-field__details {
  display: none !important;
}
</style>