import Vue from 'vue'
import Vuex from 'vuex'
import rowsNames from '../assets/rowsNames.json'
import _ from 'lodash'
import moment from 'moment'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selectedProtocol: "Walking",
    selectedDataType: "Normalized",
    duration: 60,
    weight: 700,
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
    seriesFinalLeftPlate:[{
      data:[]
    }],
    seriesFinalRightPlate:[{
      data:[]
    }],
    shouldUpdateAxes:false,
    isStepFullLeft:false,
    isSeriesLeftPlateLocked:true,
    seriesLeftLinesCounter:0,
    seriesRightPlate:[{
      data: []
    }],
    isStepFullRight:false,
    isSeriesRightPlateLocked:true,
    seriesRightLinesCounter:0,
    force: 0,
    nOfSteps: 0,
    axesMax: 0,
    xAxesMax: 0,
    leftForcePlateAnnotationY: 0,
    rightForcePlateAnnotationY: 0,
    prevLeftForcePlateAnnotationY: 0,
    prevRightForcePlateAnnotationY: 0,
    stepsPerMinuteTarget: 200,
    stepsPerMinute:0,
    stepsTimeInteval:10,
    frequency:100,
    threshold:-1,
    nOfLines:10  ,
    footAsymmetry:0,
    stepsAsymmetry:0,
    leftIsPressed:false,
    rightIsPressed: false,
    leftMaxValue:0,
    rightMaxValue: 0,
    startTime: -1,
    stepsCounter:0,
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
      let fz1 = Number(rows[2])
      let threshold

      if(Number(state.threshold) !=-1 && state.threshold!=""){
        threshold = Number(state.threshold)
      } else {
        threshold = Number( 0.05 * state.weight)
      }


      if(state.isSeriesLeftPlateLocked){
        if(fz1 < threshold){

          // Tell that the left foot is pressed
          state.leftIsPressed = true
          state.nOfSteps += 1
          state.stepsCounter +=1

          //console.log("In locked and a new step starts")
          state.isStepFullLeft = false
          state.isSeriesLeftPlateLocked = false
          let s = state.seriesLeftPlate
          //console.log(s)
          state. seriesFinalLeftPlate = s
          s.push({  
            data: [],
          })
          state.seriesLeftPlate = s

          // Get the max value from the left feet
          //console.log(state.seriesLeftPlate[state.seriesLeftLinesCounter])
          state.leftMaxValue = Math.max.apply(null,state.seriesLeftPlate[state.seriesLeftLinesCounter].data)  || 0

          // Αxes have the same max
          if(state.leftMaxValue > state.axesMax){
            //console.log("SHOULD UPDATE LEFT MAX")
            state.axesMax = state.leftMaxValue 
            state.shouldUpdateAxes = true
          }
          //console.log("Left Max: "+state.leftMaxValue)
          state.seriesLeftLinesCounter +=1

          if(state.seriesLeftLinesCounter > Number(state.nOfLines)){

            // Calcuate first all the length of the data
            // Then calculate the average of the lengths and
            // get those that are above average
            let arrayLengths = state.seriesLeftPlate.filter(i=>i&&i.data.length && i.data.length > 0).map(e=>e.data.length)
            let averageArrayLength = ArrayAverage(arrayLengths)
            arrayLengths = state.seriesLeftPlate.filter(i=>i&&i.data.length && i.data.length > averageArrayLength).map(e=>e.data.length)
    
    
            //console.log(arrayLengths)
            let minArrayLength = Math.min.apply(null,arrayLengths)
           // console.log(minArrayLength,averageArrayLength)
    
            let arraysToProceed = state.seriesLeftPlate.filter(i=>i&&i.data.length && i.data.length > averageArrayLength).map(e=>e.data.slice(0,minArrayLength))
            //console.log(arraysToProceed)
    
            const avgEmAll = arrays => _.zip.apply(null, arrays).map(avg)
            const sum = (y, z) => Number(y) + Number(z)
            const avg = x => x.reduce(sum) / x.length
            //console.log(avgEmAll(arraysToProceed))
    
            let d =[]
            d.push({  
              data: [],
            })
            state.seriesLeftPlate = [{
              data: []
            }]
            state.seriesLeftLinesCounter = 0 
            state.seriesLeftPlate[state.seriesLeftLinesCounter].data = avgEmAll(arraysToProceed)
            state.seriesLeftLinesCounter +=1
            state.isStepFullLeft = false
            state.isSeriesLeftPlateLocked = false
            let s = state.seriesLeftPlate
            state. seriesFinalLeftPlate = s
            s.push({  
              data: [],
            })
            state.seriesLeftPlate = s
          }
        }

        if(fz1 > threshold && state.isStepFullLeft){
          //console.log("In locked and writing data")
          let d = state.seriesLeftPlate[state.seriesLeftLinesCounter].data
          d.push(entry)
          state.seriesLeftPlate[state.seriesLeftLinesCounter].data = d
        }
      } else {
        if(fz1 > threshold){
          //console.log("In unlocked an a new step starts")
          state.isStepFullLeft = true
          state.isSeriesLeftPlateLocked = true
          let d = state.seriesLeftPlate[state.seriesLeftLinesCounter].data
          d.push(entry)
          state.seriesLeftPlate[state.seriesLeftLinesCounter].data = d
        }
      }
      // Every 20 lines remove all and keep only one
      /*if(state.seriesLeftPlate.length > 12){
        state.seriesLeftPlate = [state.seriesLeftPlate[state.seriesLeftLinesCounter]]
        state.seriesLeftLinesCounter = 0
        state.isSeriesLeftPlateLocked = false
      }
      */
    },
    setSeriesRightPlate(state,rows){
      let entry = rows[rowsNames[state.rightForcePlateChannel]]
      let fz2 = rows[8]
      let threshold
      if(Number(state.threshold) !=-1 && state.threshold!=""){
        threshold = Number(state.threshold)
      } else {
        threshold = Number( 0.05 * state.weight)
      }
  
      if(state.isSeriesRightPlateLocked){
        if(fz2 < threshold){

          // Tell that the right foot is pressed
          state.rightIsPressed = true
          state.nOfSteps += 1
          state.stepsCounter +=1

          //console.log("In locked and a new step starts")
          state.isStepFullRight = false
          state.isSeriesRightPlateLocked = false
          let s = state.seriesRightPlate
          state.seriesFinalRightPlate = s
          s.push({  
            data: [],
          })
          state.seriesRightPlate = s

          // Get the max value from the right feet
          //console.log(state.seriesRightPlate[state.seriesRightLinesCounter])
          state.rightMaxValue = Math.max.apply(null,state.seriesRightPlate[state.seriesRightLinesCounter].data) || 0

           // Αxes have the same max
          if(state.rightMaxValue > state.axesMax){
            state.axesMax = state.rightMaxValue
            state.shouldUpdateAxes = true
          }
          //console.log("Right Max: "+state.rightMaxValue)

          state.seriesRightLinesCounter +=1

          if(state.seriesRightLinesCounter > Number(state.nOfLines)){

            // Calcuate first all the length of the data
            // Then calculate the average of the lengths and
            // get those that are above average
            let arrayLengths = state.seriesRightPlate.filter(i=>i&&i.data.length && i.data.length > 0).map(e=>e.data.length)
            let averageArrayLength = ArrayAverage(arrayLengths)
            arrayLengths = state.seriesRightPlate.filter(i=>i&&i.data.length && i.data.length > averageArrayLength).map(e=>e.data.length)
    
    
            //console.log(arrayLengths)
            let minArrayLength = Math.min.apply(null,arrayLengths)
            //console.log(minArrayLength,averageArrayLength)
    
            let arraysToProceed = state.seriesRightPlate.filter(i=>i&&i.data.length && i.data.length > averageArrayLength).map(e=>e.data.slice(0,minArrayLength))
            ///console.log(arraysToProceed)
    
            const avgEmAll = arrays => _.zip.apply(null, arrays).map(avg)
            const sum = (y, z) => Number(y) + Number(z)
            const avg = x => x.reduce(sum) / x.length
            //console.log(avgEmAll(arraysToProceed))
    
            let d =[]
            d.push({  
              data: [],
            })
            state.seriesRightPlate = [{
              data: []
            }]
            state.seriesRightLinesCounter = 0 
            state.seriesRightPlate[state.seriesRightLinesCounter].data = avgEmAll(arraysToProceed)
            state.seriesRightLinesCounter +=1
            state.isStepFullRight = false
            state.isSeriesLeftPlateLocked = false
            let s = state.seriesRightPlate
            state.seriesRightPlate = s
            s.push({  
              data: [],
            })
            state.seriesRightPlate = s
          }
        }

        if(fz2 > threshold && state.isStepFullRight){
          //console.log("In locked and writing data")
          let d = state.seriesRightPlate[state.seriesRightLinesCounter].data
          d.push(entry)
          state.seriesRightPlate[state.seriesRightLinesCounter].data = d
        }
      } else {
        if(fz2 > threshold){
          //console.log("In unlocked an a new step starts")
          state.isStepFullRight = true
          state.isSeriesRightPlateLocked = true
          let d = state.seriesRightPlate[state.seriesRightLinesCounter].data
          d.push(entry)
          state.seriesRightPlate[state.seriesRightLinesCounter].data = d
        }
      }
    },
    setSeries(state, rows) {
      state.series = [{
        data: [{ x: 'Left Foot', y: rows[rowsNames[state.leftForcePlateChannel]] }, { x: 'Right Foot', y: rows[rowsNames[state.rightForcePlateChannel]] }],
      }]
    },
    checkIfBothFeetsArePressed(state){

      if (state.startTime === -1) {
        state.startTime = moment(new Date())
        //console.log(state.startTime)
      }
      

      if(state.leftIsPressed && state.rightIsPressed && state.leftMaxValue > 0 && state.rightMaxValue > 0){
        state.footAsymmetry = ((2*(state.leftMaxValue - state.rightMaxValue))/(state.leftMaxValue + state.rightMaxValue))*100
        state.leftIsPressed = false
        state.rightIsPressed = false

        let nowTime = moment()
        //console.log(nowTime.diff(state.startTime, "milliseconds"))
        state.stepsPerMinute = (2* 60000) / (nowTime.diff(state.startTime, "milliseconds"))
        state.startTime = -1

        state.stepsAsymmetry = ((2 * (state.stepsPerMinute - state.stepsPerMinuteTarget))/ (state.stepsPerMinuteTarget + state.stepsPerMinute))*100
        //console.log(state.stepsAsymmetry)
        state.stepsAsymmetry = Math.min(Math.max(parseInt(state.stepsAsymmetry), -100), 100);
      }
    },
    checkTimeInterval(state) {
      if (state.startTime === -1) {
        state.startTime = moment(new Date())
        //console.log(state.startTime)
      }
      
      let nowTime = moment()
      if (nowTime.diff(state.startTime, "seconds") >= state.stepsTimeInteval) {
        

        // Calculate steps per minute
        state.stepsPerMinute = (state.stepsCounter * 60) / state.stepsTimeInteval
        state.stepsCounter = 0
        state.startTime = -1
        
        // Calculate steps asymettry
        state.stepsAsymmetry = ((2 * (state.stepsPerMinute - state.stepsPerMinuteTarget))/ (state.stepsPerMinuteTarget + state.stepsPerMinute))*100
        //console.log(state.stepsAsymmetry)
        state.stepsAsymmetry = Math.min(Math.max(parseInt(state.stepsAsymmetry), -100), 100);
      }
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
    setStepsTimeInterval(state,stepsTimeInteval){
      state.stepsTimeInteval = stepsTimeInteval
    },
    setFrequency(state,frequency){
      state.frequency = frequency
    },
    setThreshold(state,threshold){
      state.threshold = threshold
    },
    setNofLines(state,nOfLines){
      state.nOfLines = nOfLines 
    },
    setShouldUpdateAxes(state,shouldUpdateAxes){
      state.shouldUpdateAxes = shouldUpdateAxes
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
      state.seriesFinalLeftPlate = [{
        data:[]
      }],
      state.seriesFinalRightPlate = [{
        data:[]
      }],
      state.force = 0
      state.nOfSteps = 0
      state.axesMax = 0
      state.xAxesMax = 0
      state.shouldUpdateAxes = true
      state.leftForcePlateAnnotationY = 0
      state.rightForcePlateAnnotationY = 0
      state.prevLeftForcePlateAnnotationY = 0
      state.prevRightForcePlateAnnotationY = 0
      state.isStepFullLeft = false
      state.isSeriesLeftPlateLocked = true
      state.seriesLeftLinesCounter = 0
      state.isStepFullRight = false
      state.isSeriesRightPlateLocked = true
      state.seriesRightLinesCounter = 0
      state.force = 0
      state.footAsymmetry = 0
      state.stepsAsymmetry = 0
      state.startTime =  -1,
      state.stepsCounter = 0
      state.stepsPerMinute = 0
    }
  },
  actions:{}
})


const ArrayAverage = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
