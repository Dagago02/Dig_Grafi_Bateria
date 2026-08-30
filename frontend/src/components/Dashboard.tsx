import { Users, Building2, Briefcase, Clock } from 'lucide-react';
import { DashboardStats } from '../types/dashboard';
import { StatCard } from './charts/StatCard';
import { PieChartCard } from './charts/PieChartCard';
import { BarChartCard } from './charts/BarChartCard';

interface DashboardProps {
  stats: DashboardStats;
}

const BLUE_ORANGE_COLORS = [
  'hsl(210, 70%, 40%)',
  'hsl(30, 90%, 50%)',
];

const PIE_COLORS = [
  'hsl(210, 70%, 40%)',
  'hsl(30, 90%, 50%)',
  'hsl(210, 10%, 70%)',
  'hsl(145, 60%, 42%)',
  'hsl(280, 60%, 50%)',
];

export const Dashboard = ({ stats }: DashboardProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Empleados" 
          value={stats.totalEmployees} 
          icon={Users}
          description="Registros cargados"
        />
        <StatCard 
          title="Tipos de Cargo" 
          value={stats.tipoCargo.length} 
          icon={Briefcase}
          description="Categorías identificadas"
        />
        <StatCard 
          title="Tipos de Contrato" 
          value={stats.tipoContrato.length} 
          icon={Building2}
          description="Modalidades de contratación"
        />
        <StatCard 
          title="Niveles de Escolaridad" 
          value={stats.escolaridad.length} 
          icon={Clock}
          description="Grados académicos"
        />
      </div>

      {/* First Row - Sexo, Escolaridad, Estrato */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PieChartCard 
          title="SEXO" 
          data={stats.sexo}
          colors={BLUE_ORANGE_COLORS}
        />
        <BarChartCard 
          title="GRADO DE ESCOLARIDAD" 
          data={stats.escolaridad}
          layout="horizontal"
          showTable={true}
        />
        <BarChartCard 
          title="ESTRATO" 
          data={stats.estrato}
          layout="vertical"
          showTable={true}

        />
      </div>

      {/* Second Row - Antigüedad Empresa, Tipo Vivienda, Personas a Cargo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BarChartCard 
          title="ANTIGÜEDAD EN LA EMPRESA" 
          data={stats.antiguedadEmpresa}
          layout="vertical"
          showTable={true}

        />
        <PieChartCard 
          title="TIPO DE VIVIENDA" 
          data={stats.tipoVivienda}
          colors={PIE_COLORS}
        />
        <BarChartCard 
          title="PERSONAS A CARGO" 
          data={stats.personasACargo}
          layout="vertical"
          showTable={true}

        />
      </div>

      {/* Third Row - Tipo Contrato, Estado Civil, Antigüedad Cargo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BarChartCard 
          title="TIPO DE CONTRATO" 
          data={stats.tipoContrato}
          layout="horizontal"
          showTable={true}

        />
        <BarChartCard 
          title="ESTADO CIVIL" 
          data={stats.estadoCivil}
          layout="vertical"
          showTable={true}

        />
        <BarChartCard 
          title="ANTIGÜEDAD EN EL CARGO" 
          data={stats.antiguedadCargo}
          layout="vertical"
          showTable={true}

        />
      </div>

      {/* Fourth Row - Tipo Cargo, Tipo Salario, Rangos de Edad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BarChartCard 
          title="TIPO DE CARGO" 
          data={stats.tipoCargo}
          layout="horizontal"
          showTable={true}

        />
        <BarChartCard 
          title="TIPO DE SALARIO" 
          data={stats.tipoSalario}
          layout="vertical"
          showTable={true}

        />
        <PieChartCard 
          title="RANGOS DE EDAD" 
          data={stats.rangosEdad}
          colors={PIE_COLORS}
        />
      </div>
    </div>
  );
};
