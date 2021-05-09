<template>
  <v-container>
    <v-row class="mt-4">
      <v-col>
        <h3>Select a database</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" offset="3">
        <v-select
          :items="
            databases.map((d) => ({
              text: d.substr(0, d.lastIndexOf('.')),
              value: d,
            }))
          "
          label="Database"
          @input="databaseChanged"
          outlined
          clearable
        ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Create a new Tag</h3>
        <hr class="hr" />
        <div class="mt-3 text-right">
          <v-text-field v-model="tagToCreate" label="Tag" outlined clearable />
          <v-alert
            outlined
            :type="creationAlertError?'error':'success'"
            text
            class="text-left"
            v-if="visibleCreationAlert"
          >
            {{creationAlertMessage}}
          </v-alert>
          <v-btn
            :disabled="
              tagToCreate.trim() === '' ||
              selectedDatabase === '' ||
              !selectedDatabase ||
              !tagToCreate
            "
            @click="createTag()"
            class="createTagButton"
          >
            Create
          </v-btn>
        </div>
      </v-col>
      <v-col>
        <h3>Delete a Tag</h3>
        <hr class="hr" />
        <div class="mt-3 text-right">
          <v-select
            v-model="tagToDelete"
            :items="
              tags.map((d) => ({
                text: d.name,
                value: d.id,
              }))
            "
            label="Tag"
            outlined
            clearable
          ></v-select>
          <v-alert
            outlined
            :type="deleteAlertError?'error':'success'"
            text
            class="text-left"
            v-if="visibleDeleteAlert"
          >
            {{deleteAlertMessage}}
          </v-alert>
          <v-btn
            :disabled="
              tagToDelete === '' ||
              selectedDatabase === '' ||
              !selectedDatabase ||
              !tagToDelete
            "
            @click="openDeleteDialog()"
            class="deleteTagButton"
          >
            Delete
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row class="mt-4 mb-3">
      <v-col>
        <h3>View all the tags</h3>
        <hr class="hr" />
        <div class="mt-3">
          <v-data-table
            light
            :headers="headers"
            :items-per-page="5"
            :items="tags"
            class="elevation-1"
          ></v-data-table>
        </div>
      </v-col>
    </v-row>
    <v-dialog
      v-model="deleteDialog"
      transition="dialog-top-transition"
      max-width="600"
    >
      <v-card light class="pt-10 pa-3">
        <v-card-text>
          <div class="text-h6">Are you sure you want to delete the tag?</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            text
            @click="deleteTag()"
          >Yes</v-btn>
          <v-btn
            text
            @click="deleteDialog = false"
          >No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const {FETCH_DATABASES_TO_TAGS , FETCH_DATABASES_TO_TAGS_RESPONSE, CREATE_TAG, CREATE_TAG_RESPONSE, DELETE_TAG, DELETE_TAG_RESPONSE, FETCH_TAGS_TO_TAGS, FETCH_TAGS_TO_TAGS_RESPONSE } = require('../../../../main/util/types')
export default {
  mounted() {
    setInterval(() => {
      ipcRenderer.send(FETCH_DATABASES_TO_TAGS);
    }, 100);
    setInterval(() => {
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send(FETCH_TAGS_TO_TAGS, {
          database: this.selectedDatabase,
        });
      }
    }, 100);
    var _this = this;
    ipcRenderer.on(
      FETCH_DATABASES_TO_TAGS_RESPONSE,
      (_, responseData) => {
        _this.databases = responseData.databases;
      }
    );
    ipcRenderer.on(CREATE_TAG_RESPONSE,(_, responseData) => { 
      this.tagToCreate = "";
      this.visibleCreationAlert = true;
      this.creationAlertError = responseData.error?true:false
      this.creationAlertMessage = responseData.error?"An error occured while creating a tag":"Successfully created a tag"
      setTimeout(() => {
        this.visibleCreationAlert = false;
      }, 3000);
    })
    ipcRenderer.on(DELETE_TAG_RESPONSE,(_, responseData) => { 
      this.tagToDelete = "";
      this.visibleDeleteAlert = true;
      this.deleteAlertError = responseData.error?true:false
      this.deleteAlertMessage = responseData.error?"An error occured while deleting a tag":"Successfully deleted the tag"
      setTimeout(() => {
        this.visibleDeleteAlert = false;
      }, 3000);
    })
    ipcRenderer.on(
      FETCH_TAGS_TO_TAGS_RESPONSE,
      (_, responseData) => {
        _this.tags = responseData.tags;
      }
    );
  },
  data() {
    return {
      databases: [],
      selectedDatabase: "",
      tagToCreate: "",
      visibleCreationAlert: false,
      creationAlertError:false,
      creationAlertMessage:"",
      tags: [],
      tagToDelete: "",
      visibleDeleteAlert: false,
      deleteAlertError:false,
      deleteAlertMessage:"",
      deleteDialog:false,
      headers: [
        {
          text: "ID",
          value: "id",
        },
        {
          text: "Name",
          value: "name",
        },
      ],
    };
  },
  methods: {
    createTag() {
      ipcRenderer.send(CREATE_TAG, {
        database: this.selectedDatabase,
        tag: this.tagToCreate,
      });
    },
    openDeleteDialog(){
      this.deleteDialog = true
    },
    deleteTag() {
      ipcRenderer.send(DELETE_TAG, {
        database: this.selectedDatabase,
        tagId: this.tagToDelete,
      });
      this.deleteDialog = false
    },
    databaseChanged(d) {
      if (d) {
        this.tags = [];
        this.selectedDatabase = d;
      } else {
        this.tags = [];
        this.selectedDatabase = "";
      }
    },
  },
};
</script>

<style>
.v-text-field.v-text-field--enclosed .v-text-field__details {
  display: none;
}
.v-data-footer__select,
.v-data-footer__pagination {
  display: none !important;
}
.v-text-field__details {
  display: none !important;
}
</style>

<style scoped>
.createTagButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.deleteTagButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #d32d41 !important;
}
</style>