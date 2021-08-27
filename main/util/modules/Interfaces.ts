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

export interface StanceDuration {
  startTimestamp: string,
  endTimestamp: string,
}

export interface Symmetries {
  stance: number,
}