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
    leftForcePlateChannel: "FX1",
    rightForcePlateChannel: "FX2",
    series: [{
      data: [{ x: 'Left Foot', y: 0 }, { x: 'Right Foot', y: 0 }],
    }],
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
      console.log(state.weight)
    },
    setFilePath(state, path) {
      state.filePath = path
    },
    startStopSession(state, isSessionRunning) {
      state.isSessionRunning = isSessionRunning
    },
    setLeftForcePlateChannel(state, channel) {
      state.leftForcePlateChannel = channel
    },
    setRightForcePlateChannel(state, channel) {
      state.rightForcePlateChannel = channel
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
    }
  },
  actions: {}
})