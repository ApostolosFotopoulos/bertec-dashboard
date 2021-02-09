import Vue from 'vue'
import Vuex from 'vuex'
import rowsNames from '../assets/rowsNames.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selectedProtocol: "Walking",
    selectedDataType: "Normalized",
    duration: 60,
    weight: 50,
    filePath: "",
    isSessionRunning: false,
    leftForcePlateChannel: "FZ1",
    rightForcePlateChannel: "FZ2",
    series: [{
      data: [{ x: 'Left Foot', y: 0 }, { x: 'Right Foot', y: 0 }],
    }],
    seriesLeftPlate:[{
      data: []
    }],
    seriesRightPlate:[{
      data: []
    }],
    isSeriesRightPlateLocked:false,
    isSeriesLeftPlateLocked:false,
    seriesLeftLinesCounter:0,
    seriesRightLinesCounter:0,
    force: 0,
    nOfSteps: 0,
    axesMax: 100,
    leftForcePlateAnnotationY: 0,
    rightForcePlateAnnotationY: 0,
    prevLeftForcePlateAnnotationY: 0,
    prevRightForcePlateAnnotationY: 0,
  },
  mutations: {
    setSelectedProtocol(state, protocol) {
      state.selectedProtocol = protocol
    },
    setDataType(state, dataType) {
      state.selectedDataType = dataType
    },
    setTime(state, duration) {
      state.duration = duration
    },
    setWeight(state, weight) {
      state.weight = weight
    },
    setFilePath(state, path) {
      state.filePath = path
    },
    startStopSession(state, isSessionRunning) {
      state.isSessionRunning = isSessionRunning
    },
    setLeftForcePlateChannel(state, channel) {
      state.leftForcePlateChannel = channel
      state.seriesLeftPlate = [{
        data: []
      }]
      state.seriesLeftLinesCounter = 0
    },
    setRightForcePlateChannel(state, channel) {
      state.rightForcePlateChannel = channel
      state.seriesRightPlate = [{
        data: []
      }]
      state.seriesRightLinesCounter = 0
    },
    setSeriesLeftPlate(state,rows){
      let entry = rows[rowsNames[state.leftForcePlateChannel]] 
      let fz1 = rows[2]
    
      // Every 20 lines remove all and keep only one
      console.log(state.seriesLeftPlate.length)
      if(state.seriesLeftPlate.length > 12){
        state.seriesLeftPlate = [state.seriesLeftPlate[state.seriesLeftLinesCounter]]
        state.seriesLeftLinesCounter = 0
        state.isSeriesLeftPlateLocked = false
      }


      if(fz1 > 20 && !state.isSeriesLeftPlateLocked){
        state.isSeriesLeftPlateLocked = true
        let s = state.seriesLeftPlate
        s.push({  
          data: [],
        })
        state.seriesLeftPlate = s
        state.seriesLeftLinesCounter +=1
        console.log("fz1 > 20 and unlocked")
      } else if (fz1 < 20 && state.isSeriesLeftPlateLocked){
        state.isSeriesLeftPlateLocked = false
        console.log("fz1 < 20 and locked")
      } else if( fz1 > 20 && state.isSeriesLeftPlateLocked){
        console.log("Write fz1")
        let d = state.seriesLeftPlate[state.seriesLeftLinesCounter].data
        d.push(entry)
        state.seriesLeftPlate[state.seriesLeftLinesCounter].data = d
      }
    },
    setSeriesRightPlate(state,rows){
      let entry = rows[rowsNames[state.rightForcePlateChannel]]
      let fz2 = rows[8]
      
      if(state.seriesRightPlate.length > 12){
        state.seriesRightPlate = [state.seriesRightPlate[state.seriesRightLinesCounter]]
        state.seriesRightLinesCounter = 0
        state.isSeriesRightPlateLocked = false
      }

      if(fz2 > 20 && !state.isSeriesRightPlateLocked){
        state.isSeriesRightPlateLocked = true
        let s = state.seriesRightPlate
        s.push({  
          data: [],
        })
        state.seriesRightPlate = s
        state.seriesRightLinesCounter +=1
        console.log("fz2 > 20 and unlocked")
      } else if (fz2 < 20 && state.isSeriesRightPlateLocked){
        state.isSeriesRightPlateLocked = false
        console.log("fz2 < 20 and locked")
      } else if( fz2 > 20 && state.isSeriesRightPlateLocked){
        console.log("Write fz2")
        let d = state.seriesRightPlate[state.seriesRightLinesCounter].data
        d.push(entry)
        state.seriesRightPlate[state.seriesRightLinesCounter].data = d
      }
    },
    setSeries(state, rows) {
      state.series = [{
        data: [{ x: 'Left Foot', y: rows[rowsNames[state.leftForcePlateChannel]] }, { x: 'Right Foot', y: rows[rowsNames[state.rightForcePlateChannel]] }],
      }]
    },
    setForce(state, force) {
      state.force = force
    },
    setnOfSteps(state, nOfSteps) {
      state.nOfSteps = nOfSteps
    },
    setAxesMax(state, axesMax) {
      state.axesMax = axesMax
    },
    setLeftForcePlateAnnotationY(state, leftForcePlateAnnotationY) {
      state.leftForcePlateAnnotationY = leftForcePlateAnnotationY
    },
    setRightForcePlateAnnotationY(state, rightForcePlateAnnotationY) {
      state.rightForcePlateAnnotationY = rightForcePlateAnnotationY
    },
    setPrevLeftForcePlateAnnotationY(state, prevLeftForcePlateAnnotationY) {
      state.prevLeftForcePlateAnnotationY = prevLeftForcePlateAnnotationY
    },
    setPrevRightForcePlateAnnotationY(state, prevRightForcePlateAnnotationY) {
      state.prevRightForcePlateAnnotationY = prevRightForcePlateAnnotationY
    },
    resetState(state){
      state.series = [{
        data: [{ x: 'Left Foot', y: 0 }, { x: 'Right Foot', y: 0 }],
      }]
      state.seriesLeftPlate = [{
        data: []
      }]
      state.seriesRightPlate = [{
        data: []
      }]
      state.isSeriesRightPlateLocked = false
      state.isSeriesLeftPlateLocked = false
      state.seriesLeftLinesCounter = 0
      state.seriesRightLinesCounter = 0
      state.force = 0
      state.nOfSteps = 0
      state.axesMax = 100
      state.leftForcePlateAnnotationY = 0
      state.rightForcePlateAnnotationY = 0
      state.prevLeftForcePlateAnnotationY = 0
      state.prevRightForcePlateAnnotationY = 0
    }
  },
  actions:{}
})