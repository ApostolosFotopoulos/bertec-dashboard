import Vue from 'vue'
import Vuex from 'vuex'
import rowsNames from '../assets/rowsNames.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selectedProtocol: "Walking",
    selectedDataType: "Normalized",
    duration: 60,
    weight: 500,
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
    stepsPerMinuteTarget:60,
    stepsPerMinute:0,
    maxLeftPlate:-1,
    maxRightPlate:-1,
    leftFootIsPressed:false,
    rightFootIsPressed:false,
    footAsymmetry:0,
    stepsAsymmetry:0,
    stepTime:-1,
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
      console.log(fz1)
      // Every 20 lines remove all and keep only one
      if(state.seriesLeftPlate.length > 12){
        state.seriesLeftPlate = [state.seriesLeftPlate[state.seriesLeftLinesCounter]]
        state.seriesLeftLinesCounter = 0
        state.isSeriesLeftPlateLocked = false
      }


      if(fz1 > 4 && !state.isSeriesLeftPlateLocked){
        state.isSeriesLeftPlateLocked = true
        let s = state.seriesLeftPlate
        s.push({  
          data: [],
        })
        state.seriesLeftPlate = s
        state.seriesLeftLinesCounter +=1
        console.log("fz1 > 20 and unlocked")
      } else if (fz1 < 4 && state.isSeriesLeftPlateLocked){
        state.isSeriesLeftPlateLocked = false
        console.log("fz1 < 20 and locked")
      } else if( fz1 > 4 && state.isSeriesLeftPlateLocked){
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

      if(fz2 > 4 && !state.isSeriesRightPlateLocked){
        state.isSeriesRightPlateLocked = true
        let s = state.seriesRightPlate
        s.push({  
          data: [],
        })
        state.seriesRightPlate = s
        state.seriesRightLinesCounter +=1
        //console.log("fz2 > 20 and unlocked")
      } else if (fz2 < 4 && state.isSeriesRightPlateLocked){
        state.isSeriesRightPlateLocked = false
        //console.log("fz2 < 20 and locked")
      } else if( fz2 > 4 && state.isSeriesRightPlateLocked){
        //console.log("Write fz2")
        let d = state.seriesRightPlate[state.seriesRightLinesCounter].data
        d.push(entry)
        state.seriesRightPlate[state.seriesRightLinesCounter].data = d
      }
    },
    setMaxFootLeftPlate(state,rows){
      let entry = rows[rowsNames[state.leftForcePlateChannel]] 
      let fz1 = rows[2]
    
      if(fz1 > 200 && !state.leftFootIsPressed){
        state.leftFootIsPressed = true
        state.maxLeftPlate = -1
        state.nOfSteps +=1

        var now = new Date().getTime()
        //console.log(now)
        if(state.stepTime != -1){
          //console.log(((now - state.stepTime) % (1000 * 60 * 60)) / (1000 * 60))
          state.stepsPerMinute = 1/(((now - state.stepTime) % (1000 * 60 * 60)) / (1000 * 60))
          state.stepsAsymmetry = clamp(((2*(state.stepsPerMinute - state.stepsPerMinuteTarget))/(state.stepsPerMinuteTarget + state.stepsPerMinute))*100,-100,100)
          console.log(state.stepsAsymmetry)
        }
        state.stepTime = now
      } else if (fz1 < 200 && state.leftFootIsPressed){
        state.leftFootIsPressed = false
      } else if(fz1 > 200 && state.leftFootIsPressed){
        if(state.maxLeftPlate < entry){
          state.maxLeftPlate = entry
        }
      }
      if(state.maxLeftPlate!=-1 && state.maxRightPlate!=-1){
        let upp = 2*(state.maxRightPlate - state.maxLeftPlate)
        let down = (state.maxRightPlate + state.maxLeftPlate)
        let percent = (upp/down)*100
        state.footAsymmetry = clamp(percent,-100,100)
        //console.log("Max Right: "+state.maxRightPlate)
        //console.log("Max Left: "+state.maxLeftPlate)
        //console.log(state.footAsymmetry)
      } 
    },
    setMaxFootRightPlate(state,rows){
      let entry = rows[rowsNames[state.rightForcePlateChannel]]
      let fz2 = rows[8]

      if(fz2 > 200 && !state.rightFootIsPressed){
        state.rightFootIsPressed = true
        state.maxRightPlate = -1
        state.nOfSteps +=1

        var now = new Date().getTime()
        //console.log(now)
        if(state.stepTime != -1){
          //console.log(((now - state.stepTime) % (1000 * 60 * 60)) / (1000 * 60))
          state.stepsPerMinute = 1/(((now - state.stepTime) % (1000 * 60 * 60)) / (1000 * 60))
          console.log(state.stepsPerMinute)
          state.stepsAsymmetry = clamp(((2*(state.stepsPerMinute - state.stepsPerMinuteTarget))/(state.stepsPerMinuteTarget + state.stepsPerMinute))*100,-100,100)
          console.log(state.stepsAsymmetry)
        }
      } else if (fz2 < 200 && state.rightFootIsPressed){
        state.rightFootIsPressed = false
      } else if(fz2 > 200 && state.rightFootIsPressed){
        if(state.maxRightPlate < entry){
          state.maxRightPlate = entry
        }
      }
      
      if(state.maxLeftPlate!=-1 && state.maxRightPlate!=-1){
        let upp = 2*(state.maxRightPlate - state.maxLeftPlate)
        let down = (state.maxRightPlate + state.maxLeftPlate)
        let percent = (upp/down)*100
        state.footAsymmetry = clamp(percent,-100,100)
        //console.log("Max Right: "+state.maxRightPlate)
        //console.log("Max Left: "+state.maxLeftPlate)
        //console.log(state.footAsymmetry)
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
    setStepsPerMinuteTarget(state,stepsPerMinute) {
      state.stepsPerMinuteTarget = stepsPerMinute
    },
    setStepsPerMinute(state,stepsPerMinute) {
      state.stepsPerMinute = stepsPerMin = stepsPerMinute
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

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}