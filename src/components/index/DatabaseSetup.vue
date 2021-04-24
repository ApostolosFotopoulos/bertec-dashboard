<template>
  <div>
    <v-row class="mt-8" align="center">
      <v-col>
	<h3>Select a user from a database to continue</h3>
	<hr class="hr">
      </v-col>
    </v-row>
    <v-card class="pa-3 mt-8" color="#25282F">
      <v-row class="mt-3" align="center">
	<v-col>
	  <v-select
	    :items="databases"
	    label="Database"
	    @input="databaseChanged"
	    outlined
	  ></v-select>	
	</v-col>
	<v-col align="center">
	  <v-select
	    :items="users.map(u => ({ text: u.firstName + ' '+ u.lastName, value: u.id }))"
	    label="Users"
	    @input="userChanged"
	    outlined
	  ></v-select>
	</v-col>
      </v-row>
      <v-row>
	<v-col cols="1" offset="9">
	  <v-btn @click="skipDatabase()" class="skipButton">
	    Skip
	  </v-btn>
	</v-col>
	<v-col cols="1">
	  <v-btn @click="continueToMain()" class="continueButton">
	    Continue
	  </v-btn>
	</v-col>
      </v-row>
    </v-card>
  </div>
</template>


<script>
const { ipcRenderer } = window.require('electron')
export default{
  props:{
    skipDatabase: Function,
    continueToMain: Function,
  },
  mounted(){
    setInterval(()=>{ ipcRenderer.send("FETCH_ALL_DATABASES") },10)
    var _this = this
    ipcRenderer.on('FETCH_ALL_DATABASES_RESPONSE',(_,responseData)=>{
      _this.databases = responseData.databases
    })
    ipcRenderer.on('FETCH_ALL_USERS_RESPONSE',(_,responseData)=>{
      _this.users = responseData.users
    })

  },
  data(){
    return {
      databases: [],
      users:[],
      selectedDatabase:"",
      selectedUser:"",
    }
  },
  methods:{
    databaseChanged(d){
      this.selectedDatabase = d
      ipcRenderer.send("FETCH_ALL_USERS",{ database: d })
    },
    userChanged(u){
      this.selectedUser = u
    }
  }
}
</script>

<style scoped>
.continueButton{
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.skipButton{
  height: 38px !important;
  min-height: 38px !important;
  background: #ffa505 !important;
}
</style>

