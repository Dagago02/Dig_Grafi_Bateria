export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
}

export interface DashboardDemographics {
  totalEmployees: number;
  sexo: ChartData[];
  estadoCivil: ChartData[];
  escolaridad: ChartData[];
  estrato: ChartData[];
  tipoVivienda: ChartData[];
  personasACargo: ChartData[];
  antiguedadEmpresa: ChartData[];
  tipoCargo: ChartData[];
  antiguedadCargo: ChartData[];
  tipoContrato: ChartData[];
  tipoSalario: ChartData[];
  rangosEdad: ChartData[];
}

export interface RiskLevelData {
  name: string;
  muyAlto: number;
  alto: number;
  medio: number;
  bajo: number;
  sinRiesgo: number;
  total: number;
}

export interface ExtralaboralStats {
  tiempoFueraTrabajo: RiskLevelData;
  relacionesFamiliares: RiskLevelData;
  comunicacionRelaciones: RiskLevelData;
  situacionEconomica: RiskLevelData;
  caracteristicasVivienda: RiskLevelData;
  influenciaEntorno: RiskLevelData;
  desplazamientoVivienda: RiskLevelData;
  consolidadoExtralaboral: RiskLevelData;
  total: number;
}

export interface StressStats {
  fisiologico: RiskLevelData;
  psicologico: RiskLevelData;
  social: RiskLevelData;
  psicoemocional: RiskLevelData;
  consolidadoEstres: RiskLevelData;
  total: number;
}

export interface IntralaboralStats {
  dimensiones_A: Record<string, RiskLevelData>;
  dominios_A: Record<string, RiskLevelData>;
  consolidado_A: RiskLevelData | null;
  dimensiones_B: Record<string, RiskLevelData>;
  dominios_B: Record<string, RiskLevelData>;
  consolidado_B: RiskLevelData | null;
  totalFormaA: number;
  totalFormaB: number;
  extralaboralA: ExtralaboralStats | null;
  extralaboralB: ExtralaboralStats | null;
  estresA: StressStats | null;
  estresB: StressStats | null;
}

export interface DashboardResponse {
  demographics: DashboardDemographics;
  intralaboral: IntralaboralStats;
}
