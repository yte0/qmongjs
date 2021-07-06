export interface Margin {
  top?: number;
  bottom?: number;
  right?: number;
  left?: number;
}

export interface Level {
  level: string;
  start: number;
  end: number;
}

export interface BarChartData {
  id: number;
  ind_id: string;
  unit_level: string;
  unit_name: string;
  context: string;
  orgnr: number;
  year: number;
  denominator: number;
  var: number;
  level: string;
  level_direction: number;
  dg: number;
  delivery_time: null;
  time: string;
  type: string;
  include: number;
}
