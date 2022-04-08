<template>
  <div>
    <div class="loader" v-if="loadingValidateSerial">
      <v-progress-circular
          indeterminate
          color="#6ab187"
          :size="200"
      >
        Validating serial number
      </v-progress-circular>
    </div>
    <div class="loader wrong-key" v-if="!loadingValidateSerial && !isValidateSerial">
      The software doesn't belong to the current hardware
    </div>
    <div v-if="!loadingValidateSerial && isValidateSerial">
      <Setup
          v-if="!isDatabaseReady"
          :skipDatabase="skipDatabase"
          :continueToMain="continueToMain"
      />
      <Session v-if="isDatabaseReady" :backToDatabase="backToDatabase" />
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import Session from "../components/session/Session.vue";
import Setup from "../components/setup/Setup.vue";
const { WINDOWS_STATUS, CREATE_SESSION ,CREATE_SESSION_RESPONSE, STOP_SESSION, VALIDATE_KEY_RESPONSE,VALIDATE_KEY } = require("../../../main/util/types");
export default {
  components: {
    Session,
    Setup,
  },
  mounted() {
    setInterval(() => {
      ipcRenderer.send(WINDOWS_STATUS);
    }, 10);
    ipcRenderer.on(CREATE_SESSION_RESPONSE,(_, responseData)=>{
      this.$store.commit("setSession",responseData.session);
      this.isDatabaseReady = true;
    })
    ipcRenderer.send(VALIDATE_KEY);
    ipcRenderer.on(VALIDATE_KEY_RESPONSE,(_, responseData)=>{
      const {isValid} = responseData;
      setTimeout(() => {
        if(isValid){
          this.loadingValidateSerial = false;
          this.isValidateSerial = true;
        } else {
          this.loadingValidateSerial = false;
          this.isValidateSerial = false;
        }
      },4000)
    })
  },
  data() {
    return {
      isDatabaseReady: false,
      newDatabaseName: "",
      loadingValidateSerial:true,
      isValidateSerial: false,
    };
  },
  methods: {
    skipDatabase() {
      this.isDatabaseReady = true;
    },
    continueToMain(d, u, s) {
      console.log(d)
      this.$store.commit("setDatabase", d);
      this.$store.commit("setUser", u);
      this.$store.commit("setWeight", u.weight);
      this.$store.commit("setWeight", u.weight);
      ipcRenderer.send(CREATE_SESSION,{ database: d, userId: u.id , session: s })
    },
    backToDatabase() {
      this.isDatabaseReady = false;
      this.$store.commit("setDatabase", "");
      this.$store.commit("setUser", {});
      this.$store.commit("setWeight", 700);
      this.$store.commit("setSessionRunning", false);
      ipcRenderer.send(STOP_SESSION);
    },
  },
};
</script>

<style>
.loader{
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.wrong-key{
  color: #6ab187 !important;
}
</style>