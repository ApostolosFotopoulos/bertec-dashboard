import Vue from 'vue'
import Vuex from 'vuex'
import rowsNames from '../assets/rowsNames.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selectedProtocol: "Walking",
    selectedDataType: "Absolute",
    duration: 60,
    weight: 50,
    filePath: "",
    isSessionRunning: false,
    leftForcePlateChannel: "FZ1",
    rightForcePlateChannel: "FZ2",
    series: [{
      data: [{ x: 'Left Foot', y: 0 }, { x: 'Right Foot', y: 0 }],
    }],
    seriesRightPlate:[{
      type: 'line',
      data: [],
    }],
    seriesLeftPlate:[{
      type: 'line',
      data: [],
    }],
    force: 0,
    nOfSteps: 0,
    axesMax: 100,
    leftForcePlateAnnotationY: 0,
    rightForcePlateAnnotationY: 0,
    prevLeftForcePlateAnnotationY: 0,
    prevRightForcePlateAnnotationY: 0,
    leftPlateDiagramCounter:0,
    rightPlateDiagramCounter:0,
    alreadyZeroLeft:false,
    alreadyZeroRight:false,
    clearStepLeft:false,
    clearStepRight:false,
    clearStep:false,
    lockStepLeft:false,
    lockStepRight:false
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
        type: 'line',
        data: [],
      }]
      state.leftPlateDiagramCounter = 0
    },
    setRightForcePlateChannel(state, channel) {
      state.rightForcePlateChannel = channel
      state.seriesRightPlate = [{
        type: 'line',
        data: [],
      }]
      state.rightPlateDiagramCounter = 0
    },
    setSeries(state, rows) {
      state.series = [{
        data: [{ x: 'Left Foot', y: rows[rowsNames[state.leftForcePlateChannel]] }, { x: 'Right Foot', y: rows[rowsNames[state.rightForcePlateChannel]] }],
      }]
    },
    setSeriesRightPlate(state,rows){
      let fzVal = rows[8]

      if(state.seriesRightPlate.length == 1 && fzVal > 20){
        state.lockStepRight = true
      }
      if((fzVal) &&(Number(fzVal) < 20 && !state.alreadyZeroRight)){
        let s = state.seriesRightPlate
        s.push({
          type: 'line',
          data: [],
        })
        state.seriesRightPlate = s
        state.rightPlateDiagramCounter +=1
        state.lockStepRight = false
      } else if((fzVal) &&(Number(fzVal) >=20 && !state.lockStepRight)){
        let d = state.seriesRightPlate[state.rightPlateDiagramCounter].data
        //d.push(fzVal)
        d.push(rows[rowsNames[state.rightForcePlateChannel]])
        console.log(d)
        state.seriesRightPlate[state.rightPlateDiagramCounter].data = d
        state.alreadyZeroRight = false
      }
    },
    setSeriesLeftPlate(state,rows){
      let fzVal = rows[2]

      if(state.seriesLeftPlate.length == 1 && fzVal > 20){
        state.lockStepLeft = true
      }

      if((fzVal) &&(Number(fzVal) < 20 && !state.alreadyZeroLeft)){
        let s = state.seriesLeftPlate
        s.push({
          type: 'line',
          data: [],
        })
        state.seriesLeftPlate = s
        state.leftPlateDiagramCounter +=1
        state.alreadyZeroLeft = true
        state.lockStepLeft = false
      } else if((fzVal) &&(Number(fzVal) >=20) && !state.lockStepLeft){
        let d = state.seriesLeftPlate[state.leftPlateDiagramCounter].data
        //d.push(fzVal)
        d.push(rows[rowsNames[state.leftForcePlateChannel]])
        state.seriesLeftPlate[state.leftPlateDiagramCounter].data = d
        state.alreadyZeroLeft = false
      }
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
      state.seriesRightPlate = [{
        type: 'line',
        data: [],
      }],
      state.seriesLeftPlate = [{
        type: 'line',
        data: [],
      }],
      state.force = 0
      state.nOfSteps = 0
      state.axesMax = 100
      state.leftForcePlateAnnotationY = 0
      state.rightForcePlateAnnotationY = 0
      state.prevLeftForcePlateAnnotationY = 0
      state.prevRightForcePlateAnnotationY = 0
      state.leftPlateDiagramCounter= 0
      state.rightPlateDiagramCounter= 0
      state.alreadyZeroLeft = false
      state.alreadyZeroRight = false
      state.clearStepLeft = false
      state.clearStepRight = false
      state.clearStep = false
      state.lockStepLeft = false
      state.lockStepRight = false
    }
  },
  actions:{}
})