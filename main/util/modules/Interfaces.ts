export interface User{
  id: number
  first_name: string,
  last_name: string,
  hospital_id: string,
  affected_side: string,
  year: number,
  other_info: string,
  sex: string,
  height: number,
  leg_length: number,
  weight: number,
  injury_date: Date,
  surgery_date: Date,
  created_at: Date,
  updated_at: Date,
}

export interface Trial {
  id: number,
  name: string,
  session_id: number,
  user_id: number,
  filename: string,
  fx_zone_min: number,
  fx_zone_max: number,
  fx_threshold: number,
  fy_zone_min: number,
  fy_zone_max: number,
  fy_threshold: number,
  fz_zone_min: number,
  fz_zone_max: number,
  fz_threshold: number,
  created_at: Date,
  comments: string,
}

export interface Session {
  id: number,
  name: string,
  user_id: number,
  created_at: Date,
}

export interface Foot{
  nRows: number,
  steps: number,
  isLocked: boolean,
  series: Array<Object>
}


export interface Record {
  Timestamp: string,
  Fx1: string,
  Fy1: string,
  Fz1: string,
  Mx1: string,
  My1: string,
  Mz1: string,
  Fx2: string,
  Fy2: string,
  Fz2: string,
  Mx2: string,
  My2: string,
  Mz2: string,
  Copx1: string,
  Copx2: string,
  Copy2: string,
  Copxy2: string,
};

export interface LineChartSeries {
  data: Array<number>
}

export interface LineCharts {
  fx: {
    left: LineChartSeries[],
    right: LineChartSeries[],
    min: number,
    max: number,
  },
  fy: {
    left: LineChartSeries[],
    right: LineChartSeries[],
    min: number,
    max: number,
  },
  fz: {
    left: LineChartSeries[],
    right: LineChartSeries[],
    min: number,
    max: number,
  };
}

export interface Timelines {
  fx: {
    left: Array<number>,
    right: Array<number>,
    min: number,
    max: number,
    inRangeleft: number,
    inRangeRight: number,
  },
  fy: {
    left: Array<number>,
    right: Array<number>,
    min: number,
    max: number,
    inRangeleft: number,
    inRangeRight: number,
  },
  fz: {
    left: Array<number>,
    right: Array<number>,
    min: number,
    max: number,
    inRangeleft: number,
    inRangeRight: number,
  };
}

export interface PerFootMetrics{
  length: number,
  left: {
    fx: NormalMetrics,
    fy: NormalMetrics,
    fz: NormalMetrics,
  };
  right: {
    fx: NormalMetrics,
    fy: NormalMetrics,
    fz: NormalMetrics,
  },
}

export interface COPs {
  left: COPChartSeries[],
  right: COPChartSeries[],
  min: number,
  max: number,
}

export interface COPChartSeries {
  data: Array<Array<number>>
}

export interface StepsDataForAverageMetrics {
  fx: {
    left: Array<LineChartSeries>
    right:  Array<LineChartSeries>
  },
  fy: {
    left: Array<LineChartSeries>
    right:  Array<LineChartSeries>
  },
  fz: {
    left: Array<LineChartSeries>
    right:  Array<LineChartSeries>
  },
}

export interface StepsDataForMetrics {
  fx: {
    left: Array<LineChartSeries>
    right:  Array<LineChartSeries>
  },
  fy: {
    left: Array<LineChartSeries>
    right:  Array<LineChartSeries>
  },
  fz: {
    left: Array<LineChartSeries>
    right:  Array<LineChartSeries>
  },
}

export interface AverageMetrics {
  impulses: Array<number>,
  impactPeakForces: Array<number>,
  loadingRates: Array<number>,
  timeToImpactPeaks: Array<number>,
  activePeakForces: Array<number>,
  timeToActivePeaks: Array<number>,
  pushOffRates: Array<number>,
}

export interface NormalMetrics {
  impulse: number,
  impactPeakForce: number,
  loadingRate: number,
  timeToImpactPeak: number,
  activePeakForce: number,
  timeToActivePeak: number,
  pushOffRate: number,
  brakingImpulse: number,
  brakingPeakForce: number,
  timeToBrakingPeak: number,
  timeToBPTransition: number,
  propulsiveImpulse: number,
  propulsivePeakForce: number,
  timeToPropulsivePeak: number,
  lateralStrikeImpulse: number,
  lateralStrikePeakForce: number,
  lateralPushImpulse: number,
  lateralPushPeakForce: number,
  contactDuration: number,
  stepDuration: number,
  doubleSupportDuration: number,
  singleSupportDuration: number,
  strideDuration: number,
}

export interface StanceDuration {
  startTimestamp: string,
  endTimestamp: string,
}

export interface StepDuration {
  startTimestamp: string,
  endTimestamp: string,
}

export interface StepDurationsPerFoot {
  left: Array<StepDuration>,
  right: Array<StepDuration>,
  length: number
}

export interface Symmetry {
  stance: number,
  step: number,
}

export interface TemporalSymmetry {
  stance: number,
  step: number,
}