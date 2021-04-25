<template>
  <div>
    <v-container v-if="!isDatabaseReady">
      <DatabaseSetup
        :skipDatabase="skipDatabase"
        :continueToMain="continueToMain"
      />
      <DatabaseActions />
    </v-container>
    <v-container v-else>
      <v-row class="mt-4 mb-3" align="center">
        <v-col>
          <h1>Dashboard - Overview</h1>
        </v-col>
	<v-col align="right" v-if="$store.state.options.user != ''">
	  <span class="mr-3"> {{ $store.state.options.user }} </span>
	  <v-avatar color="#d32d41">
	    <span class="white--text headline">
	      {{
		$store.state.options.user.split(" ")[0][0].toUpperCase() +
		$store.state.options.user.split(" ")[1][0].toUpperCase() 
	      }}
	    </span>
	  </v-avatar>
	</v-col>
      </v-row>
      <v-row class="mt-0">
        <v-col>
          <h3>File</h3>
          <hr class="hr" />
        </v-col>
      </v-row>
      <SaveFile />
      <v-row class="mt-0">
        <v-col>
          <h3>Session</h3>
          <hr class="hr" />
        </v-col>
      </v-row>
      <SessionRunning />
      <v-row class="mt-0">
        <v-col>
          <h3>Status - Weight</h3>
          <hr class="hr" />
        </v-col>
      </v-row>
      <Status />
      <PersonalInfo />
      <v-row class="mt-0">
        <v-col>
          <h3>Graphics</h3>
          <hr class="hr" />
        </v-col>
      </v-row>
      <WindowsMenu />
    </v-container>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import SaveFile from "../components/index/SaveFile.vue";
import SessionRunning from "../components/index/SessionRunning.vue";
import PersonalInfo from "../components/index/PersonalInfo.vue";
import Settings from "../components/index/Settings.vue";
import WindowsMenu from "../components/index/WindowsMenu.vue";
import Status from "../components/index/Status.vue";
import DatabaseSetup from "../components/index/DatabaseSetup.vue";
import DatabaseActions from "../components/index/DatabaseActions.vue";
export default {
  components: {
    SaveFile,
    SessionRunning,
    PersonalInfo,
    Settings,
    WindowsMenu,
    Status,
    DatabaseSetup,
    DatabaseActions,
  },
  mounted() {
    setInterval(() => {
      ipcRenderer.send("WINDOWS_STATUS");
    }, 10);
  },
  data() {
    return {
      isDatabaseReady: false,
      newDatabaseName: "",
    };
  },
  methods: {
    skipDatabase() {
      this.isDatabaseReady = true;
    },
    continueToMain(d, u) {
      console.log(d,u)
      this.$store.commit("setDatabase",d)
      this.$store.commit("setUser",u)
      this.isDatabaseReady = true;
    },
  },
};
</script>


