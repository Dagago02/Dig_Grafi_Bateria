import * as XLSX from 'xlsx';
import { RiskLevelData, IntralaboralStats, ExtralaboralStats, StressStats } from '../../types/dashboard';

export type NivelRiesgo = 'Riesgo muy alto' | 'Riesgo alto' | 'Riesgo medio' | 'Riesgo bajo' | 'Sin riesgo o riesgo despreciable';

export interface DimensionResult {
  name: string;
  score: string | number;
  level: string;
}

export interface IntralaboralReport {
  fecha: string;
  cedula: string;
  nombre: string;
  cargo: string;
  departamento: string;
  edad: string;
  sexo: string;
  forma: 'A' | 'B';
  dominios: DimensionResult[];
  dimensiones: DimensionResult[];
  intralaboralTotal: DimensionResult;
  extralaboralTotal: DimensionResult;
  estresTotal: DimensionResult;
}

// Índices de columnas para nivel de riesgo (basado en el archivo Excel)
// Forma A comienza en columna 25 (índice 24) - alternando puntaje/nivel de riesgo
const FORMA_A_COLUMNS = {
  caracteristicasLiderazgo: 25,
  relacionesSociales: 27,
  retroalimentacionDesempeno: 29,
  relacionColaboradores: 31,
  dominioLiderazgo: 33,
  claridadRol: 35,
  capacitacion: 37,
  participacionCambio: 39,
  oportunidadesDesarrollo: 41,
  controlAutonomia: 43,
  dominioControl: 45,
  demandasAmbientales: 47,
  demandasEmocionales: 49,
  demandasCuantitativas: 51,
  influenciaExtralaboral: 53,
  exigenciasResponsabilidad: 55,
  demandasCargaMental: 57,
  consistenciaRol: 59,
  demandasJornada: 61,
  dominioDemandas: 63,
  recompensasPertenencia: 65,
  reconocimientoCompensacion: 67,
  dominioRecompensas: 69,
  consolidado: 71,
};

// Forma B comienza después de Forma A
const FORMA_B_COLUMNS = {
  caracteristicasLiderazgo: 73,
  relacionesSociales: 75,
  retroalimentacionDesempeno: 77,
  dominioLiderazgo: 79,
  claridadRol: 81,
  capacitacion: 83,
  participacionCambio: 85,
  oportunidadesDesarrollo: 87,
  controlAutonomia: 89,
  dominioControl: 91,
  demandasAmbientales: 93,
  demandasEmocionales: 95,
  demandasCuantitativas: 97,
  influenciaExtralaboral: 99,
  demandasCargaMental: 101,
  demandasJornada: 103,
  dominioDemandas: 105,
  recompensasPertenencia: 107,
  reconocimientoCompensacion: 109,
  dominioRecompensas: 111,
  consolidado: 113,
};

const EXTRALABORAL_COLUMNS = {
  tiempoFueraTrabajo: 115,
  relacionesFamiliares: 117,
  comunicacionRelaciones: 119,
  situacionEconomica: 121,
  caracteristicasVivienda: 123,
  influenciaEntorno: 125,
  desplazamientoVivienda: 127,
  consolidado: 129,
};

const ESTR_COLUMNS = {
  fisiologico: 133, // Sintomas Fisiologicos (Missing in some files)
  social: 135, // Comportamiento Social (Missing in some files)
  psicologico: 137, // Sintomas Intelectuales y Laborales (Missing in some files)
  psicoemocional: 139, // Sintomas Psicoemocionales (Missing in some files)
  consolidado: 131, // Updated from 141 based on Libro1 analysis
};

const normalizeRiskLevel = (value: string | undefined): NivelRiesgo | null => {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();

  // Standard format "Riesgo muy alto"
  if (normalized.includes('muy alto')) return 'Riesgo muy alto';

  // Standard format "Riesgo alto" or short format "Alto"
  // Must check "muy" first to avoid partial match
  if (normalized.includes('alto') && !normalized.includes('muy')) return 'Riesgo alto';

  // Standard format "Riesgo medio" or short format "Medio"
  if (normalized.includes('medio')) return 'Riesgo medio';

  // Standard format "Riesgo bajo" or short format "Bajo"
  // Must check "muy" first (e.g. "muy bajo" -> "Riesgo bajo" mapping? or separate?)
  // Usually "Muy bajo" maps to "Riesgo bajo" or "Sin riesgo" depending on the scale.
  // In the user's provided image for Extralaboral, I see "Bajo" and "Sin riesgo".
  // For Stress, standard is often Muy Alto, Alto, Medio, Bajo, Muy Bajo
  if (normalized.includes('bajo') && !normalized.includes('muy')) return 'Riesgo bajo';

  // Handling "Muy bajo" as "Sin riesgo" or separate category? 
  // Existing system only has 5 categories: Muy Alto, Alto, Medio, Bajo, Sin Riesgo.
  // Let's map "Muy bajo" to "Sin riesgo o riesgo despreciable" for now as it's the lowest.
  if (normalized.includes('muy bajo')) return 'Sin riesgo o riesgo despreciable';

  if (normalized.includes('sin riesgo') || normalized.includes('despreciable')) return 'Sin riesgo o riesgo despreciable';

  return null;
};

const createEmptyRiskData = (name: string): RiskLevelData => ({
  name,
  muyAlto: 0,
  alto: 0,
  medio: 0,
  bajo: 0,
  sinRiesgo: 0,
  total: 0,
});

const countRiskLevels = (
  rows: any[][],
  columnIndex: number,
  name: string
): RiskLevelData => {
  const result = createEmptyRiskData(name);

  rows.forEach(row => {
    const value = row[columnIndex];
    if (!value) return;

    const level = normalizeRiskLevel(String(value));
    if (!level) return;

    result.total++;
    switch (level) {
      case 'Riesgo muy alto':
        result.muyAlto++;
        break;
      case 'Riesgo alto':
        result.alto++;
        break;
      case 'Riesgo medio':
        result.medio++;
        break;
      case 'Riesgo bajo':
        result.bajo++;
        break;
      case 'Sin riesgo o riesgo despreciable':
        result.sinRiesgo++;
        break;
    }
  });

  return result;
};

export const parseIntralaboralData = async (file: File): Promise<IntralaboralStats> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Skip header row
        const dataRows = jsonData.slice(1).filter(row => row && row.length > 70);

        // Separar filas por Forma A y Forma B (Forma A tiene datos en columnas 24-71, Forma B en 72+)
        const formaARows = dataRows.filter(row => row[FORMA_A_COLUMNS.caracteristicasLiderazgo]);
        const formaBRows = dataRows.filter(row => row[FORMA_B_COLUMNS.caracteristicasLiderazgo]);

        const stats: IntralaboralStats = {
          dimensiones_A: {
            caracteristicasLiderazgo: countRiskLevels(formaARows, FORMA_A_COLUMNS.caracteristicasLiderazgo, 'Características del liderazgo'),
            relacionesSociales: countRiskLevels(formaARows, FORMA_A_COLUMNS.relacionesSociales, 'Relaciones sociales en el trabajo'),
            retroalimentacionDesempeno: countRiskLevels(formaARows, FORMA_A_COLUMNS.retroalimentacionDesempeno, 'Retroalimentación del desempeño'),
            relacionColaboradores: countRiskLevels(formaARows, FORMA_A_COLUMNS.relacionColaboradores, 'Relación con los colaboradores'),
            claridadRol: countRiskLevels(formaARows, FORMA_A_COLUMNS.claridadRol, 'Claridad sobre el rol'),
            capacitacion: countRiskLevels(formaARows, FORMA_A_COLUMNS.capacitacion, 'Capacitación'),
            participacionCambio: countRiskLevels(formaARows, FORMA_A_COLUMNS.participacionCambio, 'Participación y manejo del cambio'),
            oportunidadesDesarrollo: countRiskLevels(formaARows, FORMA_A_COLUMNS.oportunidadesDesarrollo, 'Oportunidades para el uso y desarrollo de habilidades y conocimientos'),
            controlAutonomia: countRiskLevels(formaARows, FORMA_A_COLUMNS.controlAutonomia, 'Control y autonomía sobre el trabajo'),
            demandasAmbientales: countRiskLevels(formaARows, FORMA_A_COLUMNS.demandasAmbientales, 'Demandas ambientales y de esfuerzo físico'),
            demandasEmocionales: countRiskLevels(formaARows, FORMA_A_COLUMNS.demandasEmocionales, 'Demandas emocionales'),
            demandasCuantitativas: countRiskLevels(formaARows, FORMA_A_COLUMNS.demandasCuantitativas, 'Demandas cuantitativas'),
            influenciaExtralaboral: countRiskLevels(formaARows, FORMA_A_COLUMNS.influenciaExtralaboral, 'Influencia del trabajo sobre el entorno extralaboral'),
            exigenciasResponsabilidad: countRiskLevels(formaARows, FORMA_A_COLUMNS.exigenciasResponsabilidad, 'Exigencias de responsabilidad del cargo'),
            demandasCargaMental: countRiskLevels(formaARows, FORMA_A_COLUMNS.demandasCargaMental, 'Demandas de carga mental'),
            consistenciaRol: countRiskLevels(formaARows, FORMA_A_COLUMNS.consistenciaRol, 'Consistencia del Rol'),
            demandasJornada: countRiskLevels(formaARows, FORMA_A_COLUMNS.demandasJornada, 'Demandas de la jornada de trabajo'),
            recompensasPertenencia: countRiskLevels(formaARows, FORMA_A_COLUMNS.recompensasPertenencia, 'Recompensas derivadas de la pertenencia a la organización y del trabajo que realiza'),
            reconocimientoCompensacion: countRiskLevels(formaARows, FORMA_A_COLUMNS.reconocimientoCompensacion, 'Reconocimiento y compensación'),
          },
          dominios_A: {
            dominioLiderazgo: countRiskLevels(formaARows, FORMA_A_COLUMNS.dominioLiderazgo, 'Liderazgo y relaciones sociales en el trabajo'),
            dominioControl: countRiskLevels(formaARows, FORMA_A_COLUMNS.dominioControl, 'Control sobre el trabajo'),
            dominioDemandas: countRiskLevels(formaARows, FORMA_A_COLUMNS.dominioDemandas, 'Demandas del trabajo'),
            dominioRecompensas: countRiskLevels(formaARows, FORMA_A_COLUMNS.dominioRecompensas, 'Recompensas'),
          },
          consolidado_A: countRiskLevels(formaARows, FORMA_A_COLUMNS.consolidado, 'Consolidado Intralaboral A'),

          dimensiones_B: {
            caracteristicasLiderazgo: countRiskLevels(formaBRows, FORMA_B_COLUMNS.caracteristicasLiderazgo, 'Características del liderazgo'),
            relacionesSociales: countRiskLevels(formaBRows, FORMA_B_COLUMNS.relacionesSociales, 'Relaciones sociales en el trabajo'),
            retroalimentacionDesempeno: countRiskLevels(formaBRows, FORMA_B_COLUMNS.retroalimentacionDesempeno, 'Retroalimentación del desempeño'),
            claridadRol: countRiskLevels(formaBRows, FORMA_B_COLUMNS.claridadRol, 'Claridad sobre el rol'),
            capacitacion: countRiskLevels(formaBRows, FORMA_B_COLUMNS.capacitacion, 'Capacitación'),
            participacionCambio: countRiskLevels(formaBRows, FORMA_B_COLUMNS.participacionCambio, 'Participación y manejo del cambio'),
            oportunidadesDesarrollo: countRiskLevels(formaBRows, FORMA_B_COLUMNS.oportunidadesDesarrollo, 'Oportunidades para el uso y desarrollo de habilidades y conocimientos'),
            controlAutonomia: countRiskLevels(formaBRows, FORMA_B_COLUMNS.controlAutonomia, 'Control y autonomía sobre el trabajo'),
            demandasAmbientales: countRiskLevels(formaBRows, FORMA_B_COLUMNS.demandasAmbientales, 'Demandas ambientales y de esfuerzo físico'),
            demandasEmocionales: countRiskLevels(formaBRows, FORMA_B_COLUMNS.demandasEmocionales, 'Demandas emocionales'),
            demandasCuantitativas: countRiskLevels(formaBRows, FORMA_B_COLUMNS.demandasCuantitativas, 'Demandas cuantitativas'),
            influenciaExtralaboral: countRiskLevels(formaBRows, FORMA_B_COLUMNS.influenciaExtralaboral, 'Influencia del trabajo sobre el entorno extralaboral'),
            demandasCargaMental: countRiskLevels(formaBRows, FORMA_B_COLUMNS.demandasCargaMental, 'Demandas de carga mental'),
            demandasJornada: countRiskLevels(formaBRows, FORMA_B_COLUMNS.demandasJornada, 'Demandas de la jornada de trabajo'),
            recompensasPertenencia: countRiskLevels(formaBRows, FORMA_B_COLUMNS.recompensasPertenencia, 'Recompensas derivadas de la pertenencia a la organización y del trabajo que realiza'),
            reconocimientoCompensacion: countRiskLevels(formaBRows, FORMA_B_COLUMNS.reconocimientoCompensacion, 'Reconocimiento y compensación'),
          },
          dominios_B: {
            dominioLiderazgo: countRiskLevels(formaBRows, FORMA_B_COLUMNS.dominioLiderazgo, 'Liderazgo y relaciones sociales en el trabajo'),
            dominioControl: countRiskLevels(formaBRows, FORMA_B_COLUMNS.dominioControl, 'Control sobre el trabajo'),
            dominioDemandas: countRiskLevels(formaBRows, FORMA_B_COLUMNS.dominioDemandas, 'Demandas del trabajo'),
            dominioRecompensas: countRiskLevels(formaBRows, FORMA_B_COLUMNS.dominioRecompensas, 'Recompensas'),
          },
          consolidado_B: countRiskLevels(formaBRows, FORMA_B_COLUMNS.consolidado, 'Consolidado Intralaboral B'),

          totalFormaA: formaARows.length,
          totalFormaB: formaBRows.length,
          extralaboralA: null,
          extralaboralB: null,
          estresA: null,
          estresB: null,
        };

        const calculateExtralaboral = (rows: any[][]) => ({
          tiempoFueraTrabajo: countRiskLevels(rows, EXTRALABORAL_COLUMNS.tiempoFueraTrabajo, 'Tiempo fuera del trabajo'),
          relacionesFamiliares: countRiskLevels(rows, EXTRALABORAL_COLUMNS.relacionesFamiliares, 'Relaciones familiares'),
          comunicacionRelaciones: countRiskLevels(rows, EXTRALABORAL_COLUMNS.comunicacionRelaciones, 'Comunicación y relaciones interpersonales'),
          situacionEconomica: countRiskLevels(rows, EXTRALABORAL_COLUMNS.situacionEconomica, 'Situación económica del grupo familiar'),
          caracteristicasVivienda: countRiskLevels(rows, EXTRALABORAL_COLUMNS.caracteristicasVivienda, 'Características de la vivienda y su entorno'),
          influenciaEntorno: countRiskLevels(rows, EXTRALABORAL_COLUMNS.influenciaEntorno, 'Influencia del entorno extralaboral sobre el trabajo'),
          desplazamientoVivienda: countRiskLevels(rows, EXTRALABORAL_COLUMNS.desplazamientoVivienda, 'Desplazamiento vivienda - trabajo - vivienda'),
          consolidadoExtralaboral: countRiskLevels(rows, EXTRALABORAL_COLUMNS.consolidado, 'Consolidado Extralaboral'),
          total: rows.length,
        });

        const calculateStress = (rows: any[][]) => ({
          fisiologico: countRiskLevels(rows, ESTR_COLUMNS.fisiologico, 'Síntomas Fisiológicos'),
          social: countRiskLevels(rows, ESTR_COLUMNS.social, 'Comportamiento Social'),
          psicologico: countRiskLevels(rows, ESTR_COLUMNS.psicologico, 'Síntomas Intelectuales y Laborales'),
          psicoemocional: countRiskLevels(rows, ESTR_COLUMNS.psicoemocional, 'Síntomas Psicoemocionales'),
          consolidadoEstres: countRiskLevels(rows, ESTR_COLUMNS.consolidado, 'Consolidado Estrés'),
          total: rows.length,
        });

        const extralaboralA = calculateExtralaboral(formaARows);
        const extralaboralB = calculateExtralaboral(formaBRows);
        const estresA = calculateStress(formaARows);
        const estresB = calculateStress(formaBRows);

        const result: IntralaboralStats = {
          ...stats,
          extralaboralA,
          extralaboralB,
          estresA,
          estresB
        };

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
};

// Función para convertir RiskLevelData a formato de porcentajes para las tablas
export const riskDataToPercentages = (data: RiskLevelData): {
  muyAlto: number;
  alto: number;
  medio: number;
  bajo: number;
  sinRiesgo: number;
} => {
  const total = data.total || 1;
  return {
    muyAlto: Math.round((data.muyAlto / total) * 100),
    alto: Math.round((data.alto / total) * 100),
    medio: Math.round((data.medio / total) * 100),
    bajo: Math.round((data.bajo / total) * 100),
    sinRiesgo: Math.round((data.sinRiesgo / total) * 100),
  };
};

export const addRiskData = (a: RiskLevelData, b: RiskLevelData): RiskLevelData => {
  return {
    name: a.name,
    muyAlto: (a.muyAlto || 0) + (b.muyAlto || 0),
    alto: (a.alto || 0) + (b.alto || 0),
    medio: (a.medio || 0) + (b.medio || 0),
    bajo: (a.bajo || 0) + (b.bajo || 0),
    sinRiesgo: (a.sinRiesgo || 0) + (b.sinRiesgo || 0),
    total: (a.total || 0) + (b.total || 0),
  };
};



const excelDateToJSDate = (serial: number) => {
  if (!serial) return '-';
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export const extractIndividualReports = async (file: File): Promise<IntralaboralReport[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const reports: IntralaboralReport[] = [];
        const rows = jsonData.slice(1);

        rows.forEach(row => {
          if (!row || row.length < 20) return; // Skip empty rows

          // Demographics (Indices based on analysis of headers_dump.txt)
          // [0] FECHA DE APLICACIÓN
          // [2] ID
          // [3] NOMBRE COMPLETO
          // [4] SEXO
          // [5] AÑO DE NACIMIENTO
          // [17] NOMBRE DEL CARGO
          // [20] DEPARTAMENTO O SECCIÓN DE LA EMPRESA DONDE TRABAJA

          const rawFecha = row[0];
          const fecha = typeof rawFecha === 'number'
            ? excelDateToJSDate(rawFecha)
            : String(rawFecha || '-');

          const cedula = String(row[2] || '');
          const nombre = String(row[3] || '');
          const sexo = String(row[4] || '');
          const cargo = String(row[17] || row[8] || '');
          const departamento = String(row[20] || row[10] || '');

          const anioNacimiento = Number(row[5]);
          const currentYear = new Date().getFullYear();
          const edad = !isNaN(anioNacimiento) && anioNacimiento > 1900
            ? String(currentYear - anioNacimiento)
            : String(row[5] || ''); // Fallback if not a year

          if (!cedula) return;

          // Determine Form
          const isFormaA = !!row[FORMA_A_COLUMNS.caracteristicasLiderazgo];
          const forma = isFormaA ? 'A' : 'B';
          const cols = isFormaA ? FORMA_A_COLUMNS : FORMA_B_COLUMNS;

          // Helper to get result
          const getRes = (idx: number, name: string): DimensionResult => ({
            name,
            score: row[idx - 1] !== undefined ? Number(row[idx - 1]).toFixed(1) : '-',
            level: normalizeRiskLevel(row[idx]) || 'Sin dato'
          });

          // Dimensions List (Order matching the report image)
          const dimensiones: DimensionResult[] = [];

          // Liderazgo
          dimensiones.push(getRes(cols.caracteristicasLiderazgo, 'Características del liderazgo'));
          dimensiones.push(getRes(cols.relacionesSociales, 'Relaciones sociales en el trabajo'));
          dimensiones.push(getRes(cols.retroalimentacionDesempeno, 'Retroalimentación del desempeño'));
          if (isFormaA) {
            dimensiones.push(getRes(FORMA_A_COLUMNS.relacionColaboradores, 'Relación con los colaboradores'));
          }

          // Control
          dimensiones.push(getRes(cols.claridadRol, 'Claridad de rol'));
          dimensiones.push(getRes(cols.capacitacion, 'Capacitación'));
          dimensiones.push(getRes(cols.participacionCambio, 'Participación y manejo del cambio'));
          dimensiones.push(getRes(cols.oportunidadesDesarrollo, 'Oportunidades para el uso y desarrollo de habilidades y conocimientos'));
          dimensiones.push(getRes(cols.controlAutonomia, 'Control y autonomía sobre el trabajo'));

          // Demandas
          dimensiones.push(getRes(cols.demandasAmbientales, 'Demandas ambientales y de esfuerzo físico'));
          dimensiones.push(getRes(cols.demandasEmocionales, 'Demandas emocionales'));
          dimensiones.push(getRes(cols.demandasCuantitativas, 'Demandas cuantitativas'));
          dimensiones.push(getRes(cols.influenciaExtralaboral, 'Influencia del trabajo sobre el entorno extralaboral'));
          if (isFormaA) {
            dimensiones.push(getRes(FORMA_A_COLUMNS.exigenciasResponsabilidad, 'Exigencias de responsabilidad del cargo'));
            dimensiones.push(getRes(FORMA_A_COLUMNS.consistenciaRol, 'Consistencia del rol'));
          }
          dimensiones.push(getRes(cols.demandasCargaMental, 'Demandas de carga mental'));
          dimensiones.push(getRes(cols.demandasJornada, 'Demandas de la jornada de trabajo'));

          // Recompensas
          dimensiones.push(getRes(cols.recompensasPertenencia, 'Recompensas derivadas de la pertenencia a la organización y del trabajo'));
          dimensiones.push(getRes(cols.reconocimientoCompensacion, 'Reconocimiento y compensación'));

          // Dominios
          const dominios: DimensionResult[] = [];
          dominios.push(getRes(cols.dominioLiderazgo, 'Liderazgo y relaciones sociales en el trabajo'));
          dominios.push(getRes(cols.dominioControl, 'Control sobre el trabajo'));
          dominios.push(getRes(cols.dominioDemandas, 'Demandas del trabajo'));
          dominios.push(getRes(cols.dominioRecompensas, 'Recompensas'));

          // Totals
          const intralaboralTotal = getRes(cols.consolidado, 'TOTAL GENERAL FACTORES DE RIESGO PSICOSOCIAL INTRALABORAL');

          // Extralaboral & Stress (Common columns)
          const extralaboralTotal = getRes(EXTRALABORAL_COLUMNS.consolidado, 'RIESGO EXTRALABORAL');
          const estresTotal = getRes(ESTR_COLUMNS.consolidado, 'ESTRÉS');

          reports.push({
            fecha, cedula, nombre, sexo, cargo, departamento, edad, forma,
            dimensiones, dominios,
            intralaboralTotal, extralaboralTotal, estresTotal
          });
        });

        resolve(reports);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};



// Baremos definitions (risk level thresholds)
const BAREMOS_A = {
  'Liderazgo y relaciones sociales en el trabajo': [9.2, 17.8, 25.7, 34.8], //cambiada
  'Control sobre el trabajo': [10.8, 19.1, 29.9, 40.6], //cambiada
  'Demandas del trabajo': [28.6, 35.1, 41.6, 47.6], //cambiada
  'Recompensas': [4.6, 11.5, 20.6, 29.6], //cambiada
  'Características del liderazgo': [3.9, 15.5, 30.9, 46.3],  // cambiada
  'Relaciones sociales en el trabajo': [5.5, 16.2, 25.1, 37.6], //cambiada
  'Retroalimentación del desempeño': [14, 25.1, 40.1, 55.1], //cambiada
  'Relación con los colaboradores': [13.9, 25, 33.4, 47.3], //cambiada
  'Claridad de rol': [1, 10.8, 21.5, 39.4], //cambiada
  'Capacitación': [1, 16, 33.4, 50.1], //cambiada
  'Participación y manejo del cambio': [12.5, 24.9, 37.5, 50.0],//cambiada
  'Oportunidades para el uso y desarrollo de habilidades y conocimientos': [1, 6.3, 18.8, 31.3], //cambiada
  'Control y autonomía sobre el trabajo': [8.4, 25.1, 41.8, 58.4], //cambiada
  'Demandas ambientales y de esfuerzo físico': [14.6, 22.9, 31.3, 39.6], //cambiada
  'Demandas emocionales': [16.7, 25.0, 33.3, 47.2], //cambiada
  'Demandas cuantitativas': [24.9, 33.3, 45.8, 54.2], //cambiada
  'Influencia del trabajo sobre el entorno extralaboral': [18.8, 31.4, 43.9, 50.1], //cambiada
  'Exigencias de responsabilidad del cargo': [37.5, 54.2, 66.7, 79.2], //cambiada
  'Demandas de carga mental': [60.0, 70.0, 80.0, 90.0], //cambiada
  'Consistencia del rol': [15.1, 25, 35.1, 45.1], //cambiada
  'Demandas de la jornada de trabajo': [8.3, 25.0, 33.3, 50.0], //cambiada
  'Recompensas derivadas de la pertenencia a la organización y del trabajo que se realiza': [1, 5.0, 10.0, 20.0], //cambiada
  'Reconocimiento y compensación': [4.2, 16.7, 25.0, 37.5], //cambiada
  'PUNTAJE TOTAL del cuestionario de factores de riesgo psicosocial intralaboral': [18.9, 26.0, 31.6, 38.1], //cambiada
};

const BAREMOS_B = {
  'Liderazgo y relaciones sociales en el trabajo': [8.3, 17.7, 26.8, 38.4], //cambiada
  'Control sobre el trabajo': [19.5, 26.5, 34.8, 43.2], //cambiada
  'Demandas del trabajo': [27.0, 33.4, 37.9, 44.3], //cambiada
  'Recompensas': [2.6, 10.1, 17.6, 27.6], //cambiada
  'Características del liderazgo': [3.9, 13.6, 25.1, 38.6], //cambiada
  'Relaciones sociales en el trabajo': [6.4, 14.7, 27.2, 37.5], //cambiada
  'Retroalimentación del desempeño': [5.1, 20, 30.0, 50.0], //cambiada 
  'Claridad de rol': [1, 5.1, 15, 30], //cambiada
  'Capacitación': [1, 16.7, 25.1, 50.1], //cambiada
  'Participación y manejo del cambio': [16.7, 33.3, 41.7, 58.4], //cambiada
  'Oportunidades para el uso y desarrollo de habilidades y conocimientos': [12.5, 25.0, 37.5, 56.4], //cambiada
  'Control y autonomía sobre el trabajo': [33.4, 50.1, 66.8, 75.1], //cambiada
  'Demandas ambientales y de esfuerzo físico': [23, 31.4, 39.7, 48], //cambiada
  'Demandas emocionales': [19.4, 27.8, 38.9, 47.3], //cambiada
  'Demandas cuantitativas': [16.7, 33.3, 41.7, 50.0], //cambiada
  'Influencia del trabajo sobre el entorno extralaboral': [12.5, 25.0, 37.5, 50.0], //cambiada
  'Demandas de carga mental': [50.0, 65.1, 75.1, 85.1], //cambiada
  'Demandas de la jornada de trabajo': [25.0, 37.5, 45.8, 58.3], //cambiada
  'Recompensas derivadas de la pertenencia a la organización y del trabajo que se realiza': [1.0, 6.4, 12.6, 18.9], //cambiada
  'Reconocimiento y compensación': [1, 12.6, 25.0, 37.6], //cambiada
  'PUNTAJE TOTAL del cuestionario de factores de riesgo psicosocial intralaboral': [20.7, 26.1, 31.3, 38.1], //cambiada
};

function getRiskLevel(score: number, thresholds: number[]): string {
  if (score <= thresholds[0]) return 'Sin riesgo';
  if (score <= thresholds[1]) return 'Riesgo bajo';
  if (score <= thresholds[2]) return 'Riesgo medio';
  if (score <= thresholds[3]) return 'Riesgo alto';
  return 'Riesgo muy alto';
}

export interface DepartmentBaremosData {
  departments: string[];
  rows: BaremosRow[];
}

export interface BaremosRow {
  dimension: string;
  isDomain: boolean;
  values: { [dept: string]: { formaA: BaremosCell; formaB: BaremosCell } };
}

export interface BaremosCell {
  score: number | null;
  riskLevel: string;
}

export const calculateDepartmentAverages = async (file: File): Promise<DepartmentBaremosData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const departments = new Set<string>();
        jsonData.slice(1).forEach(row => {
          const dept = String(row[20] || '').trim();
          if (dept && dept !== '') departments.add(dept);
        });

        const deptArray = Array.from(departments).sort();

        const dimensionsA = [
          { name: 'Liderazgo y relaciones sociales en el trabajo', col: 32, isDomain: true },
          { name: 'Características del liderazgo', col: 24, isDomain: false },
          { name: 'Relaciones sociales en el trabajo', col: 26, isDomain: false },
          { name: 'Retroalimentación del desempeño', col: 28, isDomain: false },
          { name: 'Relación con los colaboradores', col: 30, isDomain: false },
          { name: 'Control sobre el trabajo', col: 44, isDomain: true },
          { name: 'Claridad de rol', col: 34, isDomain: false },
          { name: 'Capacitación', col: 36, isDomain: false },
          { name: 'Participación y manejo del cambio', col: 38, isDomain: false },
          { name: 'Oportunidades para el uso y desarrollo de habilidades y conocimientos', col: 40, isDomain: false },
          { name: 'Control y autonomía sobre el trabajo', col: 42, isDomain: false },
          { name: 'Demandas del trabajo', col: 62, isDomain: true },
          { name: 'Demandas ambientales y de esfuerzo físico', col: 46, isDomain: false },
          { name: 'Demandas emocionales', col: 48, isDomain: false },
          { name: 'Demandas cuantitativas', col: 50, isDomain: false },
          { name: 'Influencia del trabajo sobre el entorno extralaboral', col: 52, isDomain: false },
          { name: 'Exigencias de responsabilidad del cargo', col: 54, isDomain: false },
          { name: 'Demandas de carga mental', col: 56, isDomain: false },
          { name: 'Consistencia del rol', col: 58, isDomain: false },
          { name: 'Demandas de la jornada de trabajo', col: 60, isDomain: false },
          { name: 'Recompensas', col: 68, isDomain: true },
          { name: 'Recompensas derivadas de la pertenencia a la organización y del trabajo que se realiza', col: 64, isDomain: false },
          { name: 'Reconocimiento y compensación', col: 66, isDomain: false },
          { name: 'PUNTAJE TOTAL del cuestionario de factores de riesgo psicosocial intralaboral', col: 70, isDomain: false },
        ];

        const dimensionsB = [
          { name: 'Liderazgo y relaciones sociales en el trabajo', col: 78, isDomain: true },
          { name: 'Características del liderazgo', col: 72, isDomain: false },
          { name: 'Relaciones sociales en el trabajo', col: 74, isDomain: false },
          { name: 'Retroalimentación del desempeño', col: 76, isDomain: false },
          { name: 'Control sobre el trabajo', col: 90, isDomain: true },
          { name: 'Claridad de rol', col: 80, isDomain: false },
          { name: 'Capacitación', col: 82, isDomain: false },
          { name: 'Participación y manejo del cambio', col: 84, isDomain: false },
          { name: 'Oportunidades para el uso y desarrollo de habilidades y conocimientos', col: 86, isDomain: false },
          { name: 'Control y autonomía sobre el trabajo', col: 88, isDomain: false },
          { name: 'Demandas del trabajo', col: 104, isDomain: true },
          { name: 'Demandas ambientales y de esfuerzo físico', col: 92, isDomain: false },
          { name: 'Demandas emocionales', col: 94, isDomain: false },
          { name: 'Demandas cuantitativas', col: 96, isDomain: false },
          { name: 'Influencia del trabajo sobre el entorno extralaboral', col: 98, isDomain: false },
          { name: 'Demandas de carga mental', col: 100, isDomain: false },
          { name: 'Demandas de la jornada de trabajo', col: 102, isDomain: false },
          { name: 'Recompensas', col: 110, isDomain: true },
          { name: 'Recompensas derivadas de la pertenencia a la organización y del trabajo que se realiza', col: 106, isDomain: false },
          { name: 'Reconocimiento y compensación', col: 108, isDomain: false },
          { name: 'PUNTAJE TOTAL del cuestionario de factores de riesgo psicosocial intralaboral', col: 112, isDomain: false },
        ];

        const rows: BaremosRow[] = [];
        const allDimensions = new Set(dimensionsA.map(d => d.name));

        allDimensions.forEach(dimName => {
          const dimA = dimensionsA.find(d => d.name === dimName);
          const dimB = dimensionsB.find(d => d.name === dimName);

          const row: BaremosRow = {
            dimension: dimName,
            isDomain: dimA?.isDomain || dimB?.isDomain || false,
            values: {}
          };

          deptArray.forEach(dept => {
            const deptRows = jsonData.slice(1).filter(r => String(r[20] || '').trim() === dept);

            let scoreA: number | null = null;
            if (dimA) {
              const validValues = deptRows
                .map(r => r[dimA.col])
                .filter(v => v !== null && v !== '' && !isNaN(Number(v)))
                .map(v => Number(v));

              if (validValues.length > 0) {
                const sum = validValues.reduce((acc, v) => acc + v, 0);
                scoreA = sum / validValues.length;
              }
            }

            let scoreB: number | null = null;
            if (dimB) {
              const validValues = deptRows
                .map(r => r[dimB.col])
                .filter(v => v !== null && v !== '' && !isNaN(Number(v)))
                .map(v => Number(v));

              if (validValues.length > 0) {
                const sum = validValues.reduce((acc, v) => acc + v, 0);
                scoreB = sum / validValues.length;
              }
            }

            const baremoA = BAREMOS_A[dimName as keyof typeof BAREMOS_A];
            const baremoB = BAREMOS_B[dimName as keyof typeof BAREMOS_B];

            row.values[dept] = {
              formaA: {
                score: scoreA,
                riskLevel: scoreA !== null && baremoA ? getRiskLevel(scoreA, baremoA) : 'N/A'
              },
              formaB: {
                score: scoreB,
                riskLevel: scoreB !== null && baremoB ? getRiskLevel(scoreB, baremoB) : 'N/A'
              }
            };
          });

          rows.push(row);
        });

        resolve({
          departments: deptArray,
          rows
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
