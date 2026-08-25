import * as XLSX from 'xlsx';
import { ChartData, DashboardDemographics as DashboardStats } from '../../types/dashboard';

export interface EmployeeData {
  fechaAplicacion: string;
  anoAplicacion: number;
  id: number;
  nombreCompleto: string;
  sexo: string;
  anoNacimiento: number;
  estadoCivil: string;
  escolaridad: string;
  ocupacion: string;
  ciudadResidencia: string;
  departamentoResidencia: string;
  estrato: number | string;
  tipoVivienda: string;
  personasACargo: number;
  ciudadTrabajo: string;
  departamentoTrabajo: string;
  antiguedadEmpresa: string;
  nombreCargo: string;
  tipoCargo: string;
  antiguedadCargo: string;
  departamentoEmpresa: string;
  tipoContrato: string;
  horasDiarias: number;
  tipoSalario: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const parseAntiguedad = (value: string | number): string => {
  if (typeof value === 'number') {
    if (value < 1) return 'Menos de un año';
    if (value >= 1 && value <= 5) return '1 A 5 Años';
    if (value >= 6 && value <= 10) return '6 A 10 Años';
    if (value >= 11 && value <= 15) return '11 A 15 Años';
    if (value >= 16 && value <= 20) return '16 A 20 Años';
    return '21 o más';
  }
  const str = String(value).toLowerCase();
  if (str.includes('menos') || str === '0') return 'Menos de un año';
  const num = parseInt(str);
  if (!isNaN(num)) {
    if (num < 1) return 'Menos de un año';
    if (num >= 1 && num <= 5) return '1 A 5 Años';
    if (num >= 6 && num <= 10) return '6 A 10 Años';
    if (num >= 11 && num <= 15) return '11 A 15 Años';
    if (num >= 16 && num <= 20) return '16 A 20 Años';
    return '21 o más';
  }
  return 'Menos de un año';
};

const calculateAgeRange = (birthYear: number): string => {
  const age = CURRENT_YEAR - birthYear;
  if (age < 25) return 'Menor a 25';
  if (age >= 25 && age <= 30) return '26 A 30';
  return '31 o Más';
};

const countByField = (data: EmployeeData[], field: keyof EmployeeData): ChartData[] => {
  const counts: Record<string, number> = {};
  data.forEach(item => {
    const value = String(item[field] || 'No especificado');
    counts[value] = (counts[value] || 0) + 1;
  });
  
  const total = data.length;
  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 1000) / 10
    }))
    .sort((a, b) => b.value - a.value);
};

const countAntiguedad = (data: EmployeeData[], field: 'antiguedadEmpresa' | 'antiguedadCargo'): ChartData[] => {
  const categories = ['1 A 5 Años', '6 A 10 Años', '11 A 15 Años', '16 A 20 Años', '21 o más', 'Menos de un año'];
  const counts: Record<string, number> = {};
  categories.forEach(cat => counts[cat] = 0);

  data.forEach(item => {
    const category = parseAntiguedad(item[field]);
    counts[category] = (counts[category] || 0) + 1;
  });

  const total = data.length;
  return categories.map(name => ({
    name,
    value: counts[name] || 0,
    percentage: Math.round(((counts[name] || 0) / total) * 1000) / 10
  }));
};

const countRangosEdad = (data: EmployeeData[]): ChartData[] => {
  const categories = ['Menor a 25', '26 A 30', '31 o Más'];
  const counts: Record<string, number> = {};
  categories.forEach(cat => counts[cat] = 0);

  data.forEach(item => {
    const category = calculateAgeRange(item.anoNacimiento);
    counts[category] = (counts[category] || 0) + 1;
  });

  const total = data.length;
  return categories.map(name => ({
    name,
    value: counts[name] || 0,
    percentage: Math.round(((counts[name] || 0) / total) * 1000) / 10
  }));
};

const countEstrato = (data: EmployeeData[]): ChartData[] => {
  const categories = ['0', '1', '2', '3', '4', '5', '6', 'Finca', 'No se'];
  const counts: Record<string, number> = {};
  categories.forEach(cat => counts[cat] = 0);

  data.forEach(item => {
    const value = String(item.estrato || 'No se');
    if (categories.includes(value)) {
      counts[value] = (counts[value] || 0) + 1;
    } else {
      counts['No se'] = (counts['No se'] || 0) + 1;
    }
  });

  const total = data.length;
  return categories.map(name => ({
    name,
    value: counts[name] || 0,
    percentage: Math.round(((counts[name] || 0) / total) * 1000) / 10
  }));
};

const countPersonasACargo = (data: EmployeeData[]): ChartData[] => {
  const categories = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const counts: Record<string, number> = {};
  categories.forEach(cat => counts[cat] = 0);

  data.forEach(item => {
    const value = String(item.personasACargo || 0);
    if (categories.includes(value)) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  const total = data.length;
  return categories.map(name => ({
    name,
    value: counts[name] || 0,
    percentage: Math.round(((counts[name] || 0) / total) * 1000) / 10
  }));
};

export const parseExcelFile = async (file: File): Promise<EmployeeData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          reject(new Error('El archivo no contiene datos suficientes'));
          return;
        }

        const employees: EmployeeData[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 24) continue;
          
          employees.push({
            fechaAplicacion: String(row[0] || ''),
            anoAplicacion: Number(row[1]) || 0,
            id: Number(row[2]) || 0,
            nombreCompleto: String(row[3] || ''),
            sexo: String(row[4] || ''),
            anoNacimiento: Number(row[5]) || 0,
            estadoCivil: String(row[6] || ''),
            escolaridad: String(row[7] || ''),
            ocupacion: String(row[8] || ''),
            ciudadResidencia: String(row[9] || ''),
            departamentoResidencia: String(row[10] || ''),
            estrato: row[11],
            tipoVivienda: String(row[12] || ''),
            personasACargo: Number(row[13]) || 0,
            ciudadTrabajo: String(row[14] || ''),
            departamentoTrabajo: String(row[15] || ''),
            antiguedadEmpresa: String(row[16] || ''),
            nombreCargo: String(row[17] || ''),
            tipoCargo: String(row[18] || ''),
            antiguedadCargo: String(row[19] || ''),
            departamentoEmpresa: String(row[20] || ''),
            tipoContrato: String(row[21] || ''),
            horasDiarias: Number(row[22]) || 0,
            tipoSalario: String(row[23] || ''),
          });
        }

        resolve(employees);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
};

export const calculateStats = (data: EmployeeData[]): DashboardStats => {
  return {
    totalEmployees: data.length,
    sexo: countByField(data, 'sexo'),
    estadoCivil: countByField(data, 'estadoCivil'),
    escolaridad: countByField(data, 'escolaridad'),
    estrato: countEstrato(data),
    tipoVivienda: countByField(data, 'tipoVivienda'),
    personasACargo: countPersonasACargo(data),
    antiguedadEmpresa: countAntiguedad(data, 'antiguedadEmpresa'),
    tipoCargo: countByField(data, 'tipoCargo'),
    antiguedadCargo: countAntiguedad(data, 'antiguedadCargo'),
    tipoContrato: countByField(data, 'tipoContrato'),
    tipoSalario: countByField(data, 'tipoSalario'),
    rangosEdad: countRangosEdad(data),
  };
};
