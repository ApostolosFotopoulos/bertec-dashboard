<template>
  <v-row class="mt-8">
    <v-col>
      <h3>Create a new Database</h3>
      <hr class="hr">
      <v-card class="pa-3 mt-8" color="#25282F">
	<v-row>
	  <v-col>
	    <v-text-field
	      v-model="database"
	      label="Database"
	      outlined
	    />
	    <v-alert
	      outlined
	      type="success"
	      text
	      v-if="databaseCreationAlert"
	    >
	    Successfully created a database
	    </v-alert> 
	  </v-col>
	</v-row>
	<v-row>
	  <v-col cols="3" offset="9">
	    <v-btn @click="createDatabase()" class="createDatabaseButton">
	      Create
	    </v-btn>
	  </v-col>
	</v-row>
      </v-card>
    </v-col>
    <v-col>
      <h3>Users</h3>
      <hr class="hr">
      <v-card class="pa-3 mt-8" color="#25282F">
	<v-row align="center">
	  <v-col cols="3">
	    <v-btn @click="createUsers()" class="createUserButton">
	      Create
	    </v-btn>
	  </v-col>
	  <v-col cols="3">
	    <v-btn @click="openUsers()" class="viewButton">
	      View All
	    </v-btn>
	  </v-col>
	</v-row>
      </v-card>
    </v-col>
  </v-row> 
</template>

<script>
const { ipcRenderer } = window.require('electron')

export default{
  data(){
    return  {
      database: "",
      databaseCreationAlert: false,
    }
  },
  methods:{
    createDatabase(){
      ipcRenderer.send("CREATE_DATABASE",{ database: this.database })
      this.database = ""
      this.databaseCreationAlert = true
      setTimeout(()=>{ this.databaseCreationAlert = false},3000)
    },
    openUsers(){
      ipcRenderer.send('OPEN_USERS_WINDOW');
    },
    createUsers(){
      ipcRenderer.send('OPEN_USERS_CREATE_WINDOW');
    }
  }
}
</script>

<style scoped>
.createUserButton,.createDatabaseButton{
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}

.viewButton{
  height: 38px !important;
  min-height: 38px !important;
  background: #ffa505 !important;
}
</style>
