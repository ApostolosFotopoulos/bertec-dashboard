import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import moment, { max } from 'moment';
import rowsNames from '../../assets/store/rowsNames.json';
Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		options: {
			database: '',
			user: {},
			filePath: '',
			mode: 'Walking',
			timeout: 60,
			weight: 700,
			isSessionRunning: false,
			frequency: 100,
			leftPlateChannel: 'FZ1',
			leftPlateValue: 0,
			rightPlateChannel: 'FZ2',
			rightPlateValue: 0,
			deviceLeft: -1,
			deviceRight: -1
		},
		lineChart: {
			leftPlateSeries: [
				{
					data: []
				}
			],
			leftPlateFinalSeries: [
				{
					data: []
				}
			],
			righPlateSeries: [
				{
					data: []
				}
			],
			rightPlateFinalSeries: [
				{
					data: []
				}
			],
			isLeftPlateLocked: false,
			isLeftPlateReset: false,
			isRightPlateReset: false,
			isRightPlateLocked: false,
			leftPlateChannel: 'FZ1',
			rightPlateChannel: 'FZ2',
			leftSteps: 0,
			rightSteps: 0,
			leftPlateRows: 0,
			rightPlateRows: 0,
			shouldUpdateLeft: false,
			shouldUpdateRight: false,
			yAxisMaxValue: -1,
			threshold: 5,
			nOfLines: 10,
			dataType: 'Normalized'
		},
		speedmeter: {
			forceFZ1: 0,
			forceFZ2: 0,
			nOfSteps: 0,
			stepsPerMinute: 0,
			footAsymmetry: 0,
			stepsAsymmetry: 0,
			isLeftPlateLocked: false,
			isRightPlateLocked: false,
			leftFullPressed: false,
			rightFullPressed: false,
			leftMaxValue: 0,
			rightMaxValue: 0,
			leftMaxValueHistory: 0,
			rightMaxValueHistory: 0,
			start: null,
			leftSteps: 0,
			rightSteps: 0,
			stepsPerMinuteTarget: 150,
			maxHistory: 8,
			maxHistoryLeftPlate: [],
			maxHistoryRightPlate: []
		},
		copChart: {
			leftPlateSeries: [
				{
					data: []
				}
			],
			leftPlateFinalSeries: [
				{
					data: []
				}
			],
			righPlateSeries: [
				{
					data: []
				}
			],
			rightPlateFinalSeries: [
				{
					data: []
				}
			],
			isLeftPlateLocked: false,
			isRightPlateLocked: false,
			leftPlateRows: 0,
			rightPlateRows: 0,
			leftSteps: 0,
			rightSteps: 0,
			nOfGroupPoints: 10
		},
		timeline: {
			leftPlateSeries: [
				{
					data: []
				}
			],
			rightPlateSeries: [
				{
					data: []
				}
			],
			isLeftPlateLocked: false,
			isLeftPlateReset: false,
			isRightPlateReset: false,
			isRightPlateLocked: false,
			leftPlateChannel: 'FZ1',
			rightPlateChannel: 'FZ2',
			leftPlateMax: -1,
			rightPlateMax: -1,
			shouldUpdateLeft: false,
			shouldUpdateRight: false,
			threshold: 5,
			trialThreshold: 50,
			nOfPoints: 50,
			dataType: 'Normalized',
			leftPlateChannel: 'FZ1',
			rightPlateChannel: 'FZ2',
			yAxisMaxValue: -1,
			rangeMax: 100,
			rangeMin: 80
		}
	},
	mutations: {
		setDatabase(state, database) {
			state.options.database = database;
		},
		setUser(state, user) {
			state.options.user = user;
		},
		// Options
		setFilePath(state, path) {
			state.options.filePath = path;
		},
		setMode(state, mode) {
			state.options.mode = mode;
		},
		setTime(state, timeout) {
			state.options.timeout = timeout;
		},
		setWeight(state, weight) {
			state.options.weight = weight;
		},
		setSessionRunning(state, isSessionRunning) {
			state.options.isSessionRunning = isSessionRunning;
		},
		setLeftPlateChannelAtOptions(state, channel) {
			state.options.leftPlateChannel = channel;
		},
		setRightPlateChannelAtOptions(state, channel) {
			state.options.rightPlateChannel = channel;
		},
		setLeftPlateValue(state, value) {
			state.options.leftPlateValue = value.toFixed(2);
		},
		setRightPlateValue(state, value) {
			state.options.rightPlateValue = value.toFixed(2);
		},
		setDeviceLeft(state, deviceLeft) {
			state.options.deviceLeft = deviceLeft;
		},
		setDeviceRight(state, deviceRight) {
			state.options.deviceRight = deviceRight;
		},

		// Speedmeter
		resetSpeedmeterState(state) {
			state.speedmeter.forceFZ1 = 0;
			state.speedmeter.forceFZ2 = 0;
			state.speedmeter.nOfSteps = 0;
			state.speedmeter.stepsPerMinute = 0;
			state.speedmeter.footAsymmetry = 0;
			state.speedmeter.stepsAsymmetry = 0;
			state.speedmeter.isLeftPlateLocked = true;
			state.speedmeter.isRightPlateLocked = true;
			state.speedmeter.leftFullPressed = false;
			state.speedmeter.rightFullPressed = false;
			state.speedmeter.leftMaxValue = 0;
			state.speedmeter.rightMaxValue = 0;
			state.speedmeter.start = null;
			state.speedmeter.maxHistoryLeftPlate = [];
			state.speedmeter.maxHistoryRightPlate = [];
		},
		setMaxHistory(state, maxHistory) {
			if (Number(maxHistory) > 10) {
				state.speedmeter.maxHistory = 10;
			} else {
				state.speedmeter.maxHistory = 0;
				state.speedmeter.maxHistory = maxHistory;
			}
		},
		setForceFZ1(state, force) {
			state.speedmeter.forceFZ1 = force;
		},
		setForceFZ2(state, force) {
			state.speedmeter.forceFZ2 = force;
		},
		setStepsPerMinuteTargetAtSpeedmeter(state, stepsPerMinute) {
			state.speedmeter.stepsPerMinuteTarget = stepsPerMinute;
		},
		setLeftPlateAtSpeedmeter(state, rows) {
			let fz1 = Number(rows[2]);
			let threshold = Number(0.05 * state.options.weight);

			// When the force is larger than the threshold
			// then we have a step since the force is lower than that
			// threshold
			if (state.speedmeter.isLeftPlateLocked) {
				// Get the max value of the left foot
				if (fz1 > threshold) {
					if (fz1 > state.speedmeter.leftMaxValue) {
						state.speedmeter.leftMaxValue = fz1;
					}
					if (fz1 > state.speedmeter.leftMaxValueHistory) {
						state.speedmeter.leftMaxValueHistory = fz1;
					}
					state.speedmeter.leftSteps += 1;
				}

				if (fz1 < threshold) {
					state.speedmeter.isLeftPlateLocked = false;

					// Include as a step if it is larger than 20% of the frequency
					if (state.speedmeter.leftSteps > 0.2 * state.options.frequency) {
						state.speedmeter.nOfSteps += 1;
						state.speedmeter.leftFullPressed = true;

						// Setup the history of left foot
						if (
							state.speedmeter.maxHistoryLeftPlate.length >= state.speedmeter.maxHistory &&
							state.speedmeter.leftMaxValueHistory > 0
						) {
							state.speedmeter.maxHistoryLeftPlate.shift();
							state.speedmeter.maxHistoryLeftPlate.push(state.speedmeter.leftMaxValueHistory);
						} else if (state.speedmeter.leftMaxValueHistory > 0) {
							state.speedmeter.maxHistoryLeftPlate.push(state.speedmeter.leftMaxValueHistory);
						}
						state.speedmeter.leftMaxValueHistory = 0;
					}
					state.speedmeter.leftSteps = 0;
				}
			} else {
				if (fz1 > threshold) {
					state.speedmeter.isLeftPlateLocked = true;
				}
			}
		},
		setRightPlateAtSpeedmeter(state, rows) {
			let fz2 = Number(rows[8]);
			let threshold = Number(0.05 * state.options.weight);

			// When the force is larger than the threshold
			// then we have a step since the force is lower than that
			// threshold
			if (state.speedmeter.isRightPlateLocked) {
				// Get the max value of the right foot
				if (fz2 > threshold) {
					if (fz2 > state.speedmeter.rightMaxValue) {
						state.speedmeter.rightMaxValue = fz2;
					}
					if (fz2 > state.speedmeter.rightMaxValueHistory) {
						state.speedmeter.rightMaxValueHistory = fz2;
					}
					state.speedmeter.rightSteps += 1;
				}

				if (fz2 < threshold) {
					state.speedmeter.isRightPlateLocked = false;

					// Include as a step if it is larger than 20% of the frequency
					if (state.speedmeter.rightSteps > 0.2 * state.options.frequency) {
						state.speedmeter.nOfSteps += 1;
						state.speedmeter.rightFullPressed = true;

						// Setup the history of right foot
						if (
							state.speedmeter.maxHistoryRightPlate.length >= state.speedmeter.maxHistory &&
							state.speedmeter.rightMaxValueHistory > 0
						) {
							state.speedmeter.maxHistoryRightPlate.shift();
							state.speedmeter.maxHistoryRightPlate.push(state.speedmeter.rightMaxValueHistory);
						} else if (state.speedmeter.rightMaxValueHistory > 0) {
							state.speedmeter.maxHistoryRightPlate.push(state.speedmeter.rightMaxValueHistory);
						}
						state.speedmeter.rightMaxValueHistory = 0;
					}
					state.speedmeter.rightSteps = 0;
				}
			} else {
				if (fz2 > threshold) {
					state.speedmeter.isRightPlateLocked = true;
				}
			}
		},
		calculatefootAsymmetries(state) {
			if (!state.speedmeter.leftFullPressed && !state.speedmeter.rightFullPressed && !state.speedmeter.start) {
				state.speedmeter.start = moment(new Date());
			}

			if (
				state.speedmeter.leftFullPressed &&
				state.speedmeter.rightFullPressed &&
				state.speedmeter.start &&
				state.speedmeter.leftMaxValue > 0 &&
				state.speedmeter.rightMaxValue > 0
			) {
				let now = moment();
				// Calculate the foot asymmetry
				state.speedmeter.footAsymmetry =
					2 *
					(state.speedmeter.rightMaxValue - state.speedmeter.leftMaxValue) /
					(state.speedmeter.leftMaxValue + state.speedmeter.rightMaxValue) *
					100;
				console.log(state.speedmeter.footAsymmetry);
				state.speedmeter.footAsymmetry = Math.min(
					Math.max(parseInt(state.speedmeter.footAsymmetry), -100),
					100
				);

				state.speedmeter.stepsPerMinute = 2 * 60000 / now.diff(state.speedmeter.start, 'milliseconds');
				state.speedmeter.stepsAsymmetry =
					2 *
					(state.speedmeter.stepsPerMinute - state.speedmeter.stepsPerMinuteTarget) /
					(state.speedmeter.stepsPerMinuteTarget + state.speedmeter.stepsPerMinute) *
					100;
				state.speedmeter.stepsAsymmetry = Math.min(
					Math.max(parseInt(state.speedmeter.stepsAsymmetry), -100),
					100
				);

				// Reset the variables
				state.speedmeter.leftMaxValue = 0;
				state.speedmeter.rightMaxValue = 0;
				state.speedmeter.rightFullPressed = false;
				state.speedmeter.leftFullPressed = false;
				state.speedmeter.start = null;
			}
		},

		// Line Chart
		resetLineChartState(state) {
			state.lineChart.leftPlateSeries = [
				{
					data: []
				}
			];
			state.lineChart.leftPlateFinalSeries = [
				{
					data: []
				}
			];
			state.lineChart.righPlateSeries = [
				{
					data: []
				}
			];
			state.lineChart.rightPlateFinalSeries = [
				{
					data: []
				}
			];
			state.lineChart.isLeftPlateLocked = false;
			state.lineChart.isRightPlateLocked = false;
			state.lineChart.isLeftPlateReset = true;
			state.lineChart.isRightPlateReset = true;
			state.lineChart.leftSteps = 0;
			state.lineChart.rightSteps = 0;
			state.lineChart.leftPlateRows = 0;
			state.lineChart.rightPlateRows = 0;
			state.lineChart.yAxisMaxValue = -1;
		},
		setDataTypeAtLineChart(state, dataType) {
			state.lineChart.dataType = dataType;
		},
		setThresholdAtLineChart(state, threshold) {
			state.lineChart.threshold = Number(threshold);
		},
		setNofLinesAtLineChart(state, nOfLines) {
			state.lineChart.nOfLines = Number(nOfLines);
		},

		setLeftPlateAtLineChart(state, rows) {
			let fz1 = Number(rows[2]);
			let entry = rows[rowsNames[state.lineChart.leftPlateChannel]];
			let threshold = Number(state.lineChart.threshold / 100 * state.options.weight);

			// When COP is included in the channels dont set max limit
			if (state.lineChart.rightPlateChannel.includes('COP') || state.lineChart.leftPlateChannel.includes('COP')) {
				state.lineChart.yAxisMaxValue = -1;
			}

			// When the force is larger than the threshold
			// then we have a step since the force is lower than that
			// threshold
			if (state.lineChart.isLeftPlateLocked) {
				if (fz1 > threshold && !state.lineChart.isLeftPlateReset) {
					// Update the left plate series with the new value that is over the
					// threshold
					state.lineChart.leftSteps += 1;
					let d = state.lineChart.leftPlateSeries[state.lineChart.leftPlateRows].data;
					if (state.lineChart.dataType === 'Normalized') {
						if (state.lineChart.leftPlateChannel.includes('COP')) {
							d.push(entry);
						} else {
							d.push(100 * (entry / state.options.weight));
						}
					} else {
						d.push(entry);
					}
					state.lineChart.leftPlateSeries[state.lineChart.leftPlateRows].data = d;
				}

				if (fz1 < threshold) {
					state.lineChart.isLeftPlateLocked = false;
					state.lineChart.isLeftPlateReset = false;

					// Include as a step if it is larger than 20% of the frequency
					if (state.lineChart.leftSteps > 0.2 * state.options.frequency) {
						// Check if there is another max for the y axis
						let maxVal = Math.max(...state.lineChart.leftPlateSeries[state.lineChart.leftPlateRows].data);
						if (
							!state.lineChart.rightPlateChannel.includes('COP') &&
							!state.lineChart.leftPlateChannel.includes('COP') &&
							Number(maxVal) > Number(state.lineChart.yAxisMaxValue)
						) {
							state.lineChart.yAxisMaxValue =
								state.lineChart.dataType === 'Normalized'
									? Math.ceil(maxVal / 10) * 10
									: Math.ceil(maxVal / 100) * 100;
							state.lineChart.shouldUpdateLeft = true;
							state.lineChart.shouldUpdateRight = true;
						}

						// Then add the series to the final series and
						// also prepare the state for the next series
						let s = state.lineChart.leftPlateSeries;
						state.lineChart.leftPlateFinalSeries = s;
						s.push({
							data: []
						});
						state.lineChart.leftPlateSeries = s;
						state.lineChart.leftPlateRows += 1;
					} else {
						// If there is no step then reset the data array for the next data
						state.lineChart.leftPlateSeries[state.lineChart.leftPlateRows].data = [];
					}
					state.lineChart.leftSteps = 0;
				}
			} else {
				if (fz1 > threshold) {
					// If the number of lines is over the predefined limit
					// then clean the chart to retrieve the next lines
					if (state.lineChart.leftPlateRows > Number(state.lineChart.nOfLines)) {
						state.lineChart.shouldUpdateLeft = true;
						state.lineChart.leftPlateSeries = [
							{
								data: []
							}
						];
						state.lineChart.leftPlateFinalSeries = [
							{
								data: []
							}
						];
						state.lineChart.leftSteps = 0;
						state.lineChart.leftPlateRows = 0;

						state.lineChart.shouldUpdateRight = true;
						state.lineChart.righPlateSeries = [
							{
								data: []
							}
						];
						state.lineChart.rightPlateFinalSeries = [
							{
								data: []
							}
						];
						state.lineChart.rightSteps = 0;
						state.lineChart.rightPlateRows = 0;
					}

					// Update the left plate series with the new value that is over the
					// threshold and activate the step process
					state.lineChart.isLeftPlateLocked = true;
					let d = state.lineChart.leftPlateSeries[state.lineChart.leftPlateRows].data;
					if (state.lineChart.dataType == 'Normalized') {
						if (state.lineChart.leftPlateChannel.includes('COP')) {
							d.push(entry);
						} else {
							d.push(100 * (entry / state.options.weight));
						}
					} else {
						d.push(entry);
					}
					state.lineChart.leftPlateSeries[state.lineChart.leftPlateRows].data = d;
				}
			}
		},
		setRightPlateAtLineChart(state, rows) {
			let fz2 = Number(rows[8]);
			let entry = rows[rowsNames[state.lineChart.rightPlateChannel]];
			let threshold = Number(state.lineChart.threshold / 100 * state.options.weight);

			// When COP is included in the channels dont set max limit
			if (state.lineChart.rightPlateChannel.includes('COP') || state.lineChart.leftPlateChannel.includes('COP')) {
				state.lineChart.yAxisMaxValue = -1;
			}

			// When the force is larger than the threshold
			// then we have a step since the force is lower than that
			// threshold
			if (state.lineChart.isRightPlateLocked) {
				if (fz2 > threshold && !state.lineChart.isRightPlateReset) {
					// Update the right plate series with the new value that is over the
					// threshold
					state.lineChart.rightSteps += 1;
					let d = state.lineChart.righPlateSeries[state.lineChart.rightPlateRows].data;
					if (state.lineChart.dataType === 'Normalized') {
						if (state.lineChart.rightPlateChannel.includes('COP')) {
							d.push(entry);
						} else {
							d.push(100 * (entry / state.options.weight));
						}
					} else {
						d.push(entry);
					}
					state.lineChart.righPlateSeries[state.lineChart.rightPlateRows].data = d;
				}

				if (fz2 < threshold) {
					state.lineChart.isRightPlateLocked = false;
					state.lineChart.isRightPlateReset = false;

					// Include as a step if it is larger than 20% of the frequency
					if (state.lineChart.rightSteps > 0.2 * state.options.frequency) {
						// Check if there is another max for the y axis
						let maxVal = Math.max(...state.lineChart.righPlateSeries[state.lineChart.rightPlateRows].data);
						if (
							!state.lineChart.rightPlateChannel.includes('COP') &&
							!state.lineChart.leftPlateChannel.includes('COP') &&
							Number(maxVal) > Number(state.lineChart.yAxisMaxValue)
						) {
							state.lineChart.yAxisMaxValue =
								state.lineChart.dataType === 'Normalized'
									? Math.ceil(maxVal / 10) * 10
									: Math.ceil(maxVal / 100) * 100;
							state.lineChart.shouldUpdateLeft = true;
							state.lineChart.shouldUpdateRight = true;
						}

						// Then add the series to the final series and
						// also prepare the state for the next series
						let s = state.lineChart.righPlateSeries;
						state.lineChart.rightPlateFinalSeries = s;
						s.push({
							data: []
						});
						state.lineChart.righPlateSeries = s;
						state.lineChart.rightPlateRows += 1;
					} else {
						// If there is no step then reset the data array for the next data
						state.lineChart.righPlateSeries[state.lineChart.rightPlateRows].data = [];
					}
					state.lineChart.leftSteps = 0;
				}
			} else {
				if (fz2 > threshold) {
					// If the number of lines is over the predefined limit
					// then clean the chart to retrieve the next lines
					if (state.lineChart.rightPlateRows > Number(state.lineChart.nOfLines)) {
						state.lineChart.shouldUpdateLeft = true;
						state.lineChart.leftPlateSeries = [
							{
								data: []
							}
						];
						state.lineChart.leftPlateFinalSeries = [
							{
								data: []
							}
						];
						state.lineChart.leftSteps = 0;
						state.lineChart.leftPlateRows = 0;

						state.lineChart.shouldUpdateRight = true;
						state.lineChart.righPlateSeries = [
							{
								data: []
							}
						];
						state.lineChart.rightPlateFinalSeries = [
							{
								data: []
							}
						];
						state.lineChart.rightSteps = 0;
						state.lineChart.rightPlateRows = 0;
					}
					// Update the left plate series with the new value that is over the
					// threshold and activate the step process
					state.lineChart.isRightPlateLocked = true;
					let d = state.lineChart.righPlateSeries[state.lineChart.rightPlateRows].data;
					if (state.lineChart.dataType === 'Normalized') {
						if (state.lineChart.rightPlateChannel.includes('COP')) {
							d.push(entry);
						} else {
							d.push(100 * (entry / state.options.weight));
						}
					} else {
						d.push(entry);
					}
					state.lineChart.righPlateSeries[state.lineChart.rightPlateRows].data = d;
				}
			}
		},
		setRightPlateChannel(state, channel) {
			state.lineChart.rightPlateChannel = channel;
			state.lineChart.shouldUpdateRight = true;
			state.lineChart.righPlateSeries = [
				{
					data: []
				}
			];
			state.lineChart.rightPlateFinalSeries = [
				{
					data: []
				}
			];
			state.lineChart.isRightPlateLocked = false;
			state.lineChart.rightSteps = 0;
			state.lineChart.rightPlateRows = 0;
			state.lineChart.yAxisMaxValue = -1;
		},
		setLeftPlateChannel(state, channel) {
			state.lineChart.leftPlateChannel = channel;
			state.lineChart.shouldUpdateLeft = true;
			state.lineChart.leftPlateSeries = [
				{
					data: []
				}
			];
			state.lineChart.leftPlateFinalSeries = [
				{
					data: []
				}
			];
			state.lineChart.isLeftPlateLocked = false;
			state.lineChart.leftSteps = 0;
			state.lineChart.leftPlateRows = 0;
			state.lineChart.yAxisMaxValue = -1;
		},
		setShouldUpdateLeftAtLineChart(state, shouldUpdateLeft) {
			state.lineChart.shouldUpdateLeft = shouldUpdateLeft;
		},
		setShouldUpdateRightAtLineChart(state, shouldUpdateRight) {
			state.lineChart.shouldUpdateRight = shouldUpdateRight;
		},

		// COP
		resetCOPChartState(state) {
			state.copChart.leftPlateSeries = [
				{
					data: []
				}
			];
			state.copChart.leftPlateFinalSeries = [
				{
					data: []
				}
			];
			state.copChart.righPlateSeries = [
				{
					data: []
				}
			];
			state.copChart.rightPlateFinalSeries = [
				{
					data: []
				}
			];
			state.copChart.isLeftPlateLocked = false;
			state.copChart.isRightPlateLocked = false;
			state.copChart.leftPlateRows = 0;
			state.copChart.rightPlateRows = 0;
			state.copChart.shouldUpdateLeft = false;
			state.copChart.shouldUpdateRight = false;
			state.copChart.leftSteps = 0;
			state.copChart.rightSteps = 0;
		},
		setNofGroupPoints(state, nOfGroupPoints) {
			state.copChart.nOfGroupPoints = nOfGroupPoints;
		},
		setLeftPlateAtCOP(state, rows) {
			let fz1 = Number(rows[2]);
			let copx1 = rows[rowsNames['COPX1']];
			let copy1 = rows[rowsNames['COPY1']];
			let threshold = Number(0.05 * state.options.weight);

			if (state.copChart.isLeftPlateLocked) {
				if (fz1 > threshold) {
					// Update the left plate series with the new value that is over the
					// threshold
					state.copChart.leftSteps += 1;
					let d = state.copChart.leftPlateSeries[state.copChart.leftPlateRows].data;
					d.push([ copx1, copy1 ]);
					state.copChart.leftPlateSeries[state.copChart.leftPlateRows].data = d;
				}
				if (fz1 < threshold) {
					state.copChart.isLeftPlateLocked = false;

					// Include as a step if it is larger than 20% of the frequency
					if (state.copChart.leftSteps > 0.2 * state.options.frequency) {
						// Then add the series to the final series and
						// also prepare the state for the next series
						let s = state.copChart.leftPlateSeries;
						state.copChart.leftPlateFinalSeries = s;
						s.push({
							data: []
						});
						state.copChart.leftPlateSeries = s;
						state.copChart.leftPlateRows += 1;
					} else {
						// If there is no step then reset the data array for the next data
						state.copChart.leftPlateSeries[state.copChart.leftPlateRows].data = [];
					}
					state.copChart.leftSteps = 0;
				}
			} else {
				if (fz1 > threshold) {
					// If the number of lines is over the predefined limit
					// then clean the chart to retrieve the next lines
					if (state.copChart.leftPlateRows > Number(state.copChart.nOfGroupPoints)) {
						state.copChart.leftPlateSeries = [
							{
								data: []
							}
						];
						state.copChart.leftPlateFinalSeries = [
							{
								data: []
							}
						];
						state.copChart.leftSteps = 0;
						state.copChart.leftPlateRows = 0;
					}

					// Update the left plate series with the new value that is over the
					// threshold and activate the step process
					state.copChart.isLeftPlateLocked = true;
					let d = state.copChart.leftPlateSeries[state.copChart.leftPlateRows].data;
					d.push([ copx1, copy1 ]);
					state.copChart.leftPlateSeries[state.copChart.leftPlateRows].data = d;
				}
			}
		},
		setRightPlateAtCOP(state, rows) {
			let fz2 = Number(rows[8]);
			let copx2 = rows[rowsNames['COPX2']];
			let copy2 = rows[rowsNames['COPY2']];
			let threshold = Number(0.05 * state.options.weight);

			if (state.copChart.isRightPlateLocked) {
				if (fz2 > threshold) {
					// Update the left plate series with the new value that is over the
					// threshold
					state.copChart.rightSteps += 1;
					let d = state.copChart.righPlateSeries[state.copChart.rightPlateRows].data;
					d.push([ copx2, copy2 ]);
					state.copChart.righPlateSeries[state.copChart.rightPlateRows].data = d;
				}
				if (fz2 < threshold) {
					state.copChart.isRightPlateLocked = false;

					// Include as a step if it is larger than 20% of the frequency
					if (state.copChart.rightSteps > 0.2 * state.options.frequency) {
						// Then add the series to the final series and
						// also prepare the state for the next series
						let s = state.copChart.righPlateSeries;
						state.copChart.rightPlateFinalSeries = s;
						s.push({
							data: []
						});
						state.copChart.righPlateSeries = s;
						state.copChart.rightPlateRows += 1;
					} else {
						// If there is no step then reset the data array for the next data
						state.copChart.righPlateSeries[state.copChart.rightPlateRows].data = [];
					}
					state.copChart.rightSteps = 0;
				}
			} else {
				if (fz2 > threshold) {
					// If the number of lines is over the predefined limit
					// then clean the chart to retrieve the next lines
					if (state.copChart.rightPlateRows > Number(state.copChart.nOfGroupPoints)) {
						state.copChart.righPlateSeries = [
							{
								data: []
							}
						];
						state.copChart.rightPlateFinalSeries = [
							{
								data: []
							}
						];
						state.copChart.rightSteps = 0;
						state.copChart.rightPlateRows = 0;
					}

					// Update the left plate series with the new value that is over the
					// threshold and activate the step process
					state.copChart.isRightPlateLocked = true;
					let d = state.copChart.righPlateSeries[state.copChart.rightPlateRows].data;
					d.push([ copx2, copy2 ]);
					state.copChart.righPlateSeries[state.copChart.rightPlateRows].data = d;
				}
			}
		},

		// Timeline
		resetTimelineState(state) {
			state.timeline.leftPlateSeries = [
				{
					data: []
				}
			];
			state.timeline.rightPlateSeries = [
				{
					data: []
				}
			];
			state.timeline.isLeftPlateLocked = false;
			state.timeline.isLeftPlateReset = true;
			state.timeline.isRightPlateReset = true;
			state.timeline.isRightPlateLocked = false;
			state.timeline.leftPlateMax = -1;
			state.timeline.rightPlateMax = -1;
			state.timeline.shouldUpdateLeft = false;
			state.timeline.shouldUpdateRight = false;
		},
		setLeftPlateAtTimeline(state, rows) {
			let fz1 = Number(rows[2]);
			let entry = rows[rowsNames[state.timeline.leftPlateChannel]];
			let threshold = Number(state.timeline.threshold / 100 * state.options.weight);

			// When the force is larger than the threshold
			// then we have a step since the force is lower than that
			// threshold
			if (state.timeline.isLeftPlateLocked) {
				if (fz1 > threshold && !state.timeline.isLeftPlateReset) {
					// Update the left plate max with biggest value
					// that we get
					if (state.timeline.dataType === 'Normalized') {
						if (state.timeline.leftPlateChannel.includes('COP')) {
							if (state.timeline.leftPlateMax < entry) {
								state.timeline.leftPlateMax = entry;
							}
						} else {
							if (state.timeline.leftPlateMax < 100 * (entry / state.options.weight)) {
								state.timeline.leftPlateMax = 100 * (entry / state.options.weight);
							}
						}
					} else {
						if (state.timeline.leftPlateMax < entry) {
							state.timeline.leftPlateMax = entry;
						}
					}
				}

				if (fz1 < threshold) {
					state.timeline.isLeftPlateLocked = false;
					state.timeline.isLeftPlateReset = false;

					// Add the new max to the left plate max
					if (state.timeline.dataType === 'Normalized') {
						if (state.timeline.leftPlateMax > state.timeline.trialThreshold) {
							state.timeline.leftPlateSeries[0].data.push(state.timeline.leftPlateMax);
							if (state.timeline.yAxisMaxValue < state.timeline.leftPlateMax) {
								state.timeline.yAxisMaxValue =
									state.timeline.dataType === 'Normalized'
										? Math.ceil(state.timeline.leftPlateMax / 10) * 10
										: Math.ceil(state.timeline.leftPlateMax / 100) * 100;
							}
						}
					} else {
						if (state.timeline.leftPlateMax > state.timeline.trialThreshold / 100 * state.options.weight) {
							state.timeline.leftPlateSeries[0].data.push(state.timeline.leftPlateMax);
							if (state.timeline.yAxisMaxValue < state.timeline.leftPlateMax) {
								state.timeline.yAxisMaxValue =
									state.timeline.dataType === 'Normalized'
										? Math.ceil(state.timeline.leftPlateMax / 10) * 10
										: Math.ceil(state.timeline.leftPlateMax / 100) * 100;
							}
						}
					}
					state.timeline.leftPlateMax = -1;
					state.timeline.shouldUpdateLeft = true;
				}
			} else {
				if (fz1 > threshold) {
					// If the number of points is over the predefined limit
					// we start poping the old ones
					if (state.timeline.leftPlateSeries[0].data.length > Number(state.timeline.nOfPoints)) {
						let s = state.timeline.leftPlateSeries[0].data;
						s.shift();
						state.timeline.leftPlateSeries[0].data = s;
					}

					// Update the left plate max with biggest value
					// that we get
					state.timeline.isLeftPlateLocked = true;
					if (state.timeline.dataType === 'Normalized') {
						if (state.timeline.leftPlateChannel.includes('COP')) {
							if (state.timeline.leftPlateMax < entry) {
								state.timeline.leftPlateMax = entry;
							}
						} else {
							if (state.timeline.leftPlateMax < 100 * (entry / state.options.weight)) {
								state.timeline.leftPlateMax = 100 * (entry / state.options.weight);
							}
						}
					} else {
						if (state.timeline.leftPlateMax < entry) {
							state.timeline.leftPlateMax = entry;
						}
					}
				}
			}
		},
		setRightPlateAtTimeline(state, rows) {
			let fz2 = Number(rows[8]);
			let entry = rows[rowsNames[state.timeline.rightPlateChannel]];
			let threshold = Number(state.timeline.threshold / 100 * state.options.weight);

			// When the force is larger than the threshold
			// then we have a step since the force is lower than that
			// threshold
			if (state.timeline.isRightPlateLocked) {
				if (fz2 > threshold && !state.timeline.isRightPlateReset) {
					// Update the left plate max with biggest value
					// that we get
					if (state.timeline.dataType === 'Normalized') {
						if (state.timeline.rightPlateChannel.includes('COP')) {
							if (state.timeline.rightPlateMax < entry) {
								state.timeline.rightPlateMax = entry;
							}
						} else {
							if (state.timeline.rightPlateMax < 100 * (entry / state.options.weight)) {
								state.timeline.rightPlateMax = 100 * (entry / state.options.weight);
							}
						}
					} else {
						if (state.timeline.rightPlateMax < entry) {
							state.timeline.rightPlateMax = entry;
						}
					}
				}

				if (fz2 < threshold) {
					state.timeline.isRightPlateLocked = false;
					state.timeline.isRightPlateReset = false;

					// Add the new max to the left plate max
					if (state.timeline.dataType === 'Normalized') {
						if (state.timeline.rightPlateMax > state.timeline.trialThreshold) {
							state.timeline.rightPlateSeries[0].data.push(state.timeline.rightPlateMax);
							if (state.timeline.yAxisMaxValue < state.timeline.rightPlateMax) {
								state.timeline.yAxisMaxValue =
									state.timeline.dataType === 'Normalized'
										? Math.ceil(state.timeline.rightPlateMax / 10) * 10
										: Math.ceil(state.timeline.rightPlateMax / 100) * 100;
							}
						}
					} else {
						if (state.timeline.rightPlateMax > state.timeline.trialThreshold / 100 * state.options.weight) {
							state.timeline.rightPlateSeries[0].data.push(state.timeline.rightPlateMax);
							if (state.timeline.yAxisMaxValue < state.timeline.rightPlateMax) {
								state.timeline.yAxisMaxValue =
									state.timeline.dataType === 'Normalized'
										? Math.ceil(state.timeline.rightPlateMax / 10) * 10
										: Math.ceil(state.timeline.rightPlateMax / 100) * 100;
							}
						}
					}

					state.timeline.rightPlateMax = -1;
					state.timeline.shouldUpdateRight = true;
				}
			} else {
				if (fz2 > threshold) {
					// If the number of points is over the predefined limit
					// we start poping the old ones
					if (state.timeline.rightPlateSeries[0].data.length > Number(state.timeline.nOfPoints)) {
						let s = state.timeline.rightPlateSeries[0].data;
						s.shift();
						state.timeline.rightPlateSeries[0].data = s;
					}

					// Update the left plate max with biggest value
					// that we get
					state.timeline.isRightPlateLocked = true;
					if (state.timeline.dataType === 'Normalized') {
						if (state.timeline.rightPlateChannel.includes('COP')) {
							if (state.timeline.rightPlateMax < entry) {
								state.timeline.rightPlateMax = entry;
							}
						} else {
							if (state.timeline.rightPlateMax < 100 * (entry / state.options.weight)) {
								state.timeline.rightPlateMax = 100 * (entry / state.options.weight);
							}
						}
					} else {
						if (state.timeline.rightPlateMax < entry) {
							state.timeline.rightPlateMax = entry;
						}
					}
				}
			}
		},
		setLeftPlateChannelAtTimeline(state, channel) {
			state.timeline.leftPlateChannel = channel;
		},
		setRightPlateChannelAtTimeline(state, channel) {
			state.timeline.rightPlateChannel = channel;
		},
		setDataTypeAtTimeline(state, dataType) {
			state.timeline.dataType = dataType;
		},
		setThresholdAtTimeline(state, threshold) {
			state.timeline.threshold = threshold;
		},
		setNofPointsAtTimeline(state, nOfPoints) {
			state.timeline.leftPlateSeries[0].data = [];
			state.timeline.rightPlateSeries[0].data = [];
			state.timeline.nOfPoints = nOfPoints;
		},
		setShouldUpdateLeftAtTimeline(state, shouldUpdateLeft) {
			state.timeline.shouldUpdateLeft = shouldUpdateLeft;
		},
		setShouldUpdateRightAtTimeline(state, shouldUpdateRight) {
			state.timeline.shouldUpdateRight = shouldUpdateRight;
		},
		setRangeMax(state, max) {
			if (max < state.timeline.rangeMin) {
				state.timeline.rangeMax = state.timeline.rangeMin;
			} else {
				state.timeline.rangeMax = max;
			}
		},
		setRangeMin(state, min) {
			if (min > state.timeline.rangeMax) {
				state.timeline.rangeMin = state.timeline.rangeMax;
			} else {
				state.timeline.rangeMin = min;
			}
		},
		setTrialThreshold(state, trialThreshold) {
			state.timeline.trialThreshold = trialThreshold;
		}
	},
	actions: {}
});
