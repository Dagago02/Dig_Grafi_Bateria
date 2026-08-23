import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ExtralaboralStats, RiskLevelData } from '../types/dashboard';
import { RiskGroupedBarChart } from './charts/RiskGroupedBarChart';
import { ConsolidatedRiskChart } from './charts/ConsolidatedRiskChart';

interface ExtralaboralDashboardProps {
  statsA?: ExtralaboralStats | null;
  statsB?: ExtralaboralStats | null;
}

const emptyRisk = (name: string): RiskLevelData => ({
  name,
  muyAlto: 0,
  alto: 0,
  medio: 0,
  bajo: 0,
  sinRiesgo: 0,
  total: 0,
});

const emptyExtralaboral = (suffix: string): ExtralaboralStats => ({
  tiempoFueraTrabajo: emptyRisk("Tiempo fuera del trabajo"),
  relacionesFamiliares: emptyRisk("Relaciones familiares"),
  comunicacionRelaciones: emptyRisk("Comunicación y relaciones interpersonales"),
  situacionEconomica: emptyRisk("Situación económica del grupo familiar"),
  caracteristicasVivienda: emptyRisk("Características de la vivienda y de su entorno"),
  influenciaEntorno: emptyRisk("Influencia del entorno extralaboral sobre el trabajo"),
  desplazamientoVivienda: emptyRisk("Desplazamiento vivienda-trabajo-vivienda"),
  consolidadoExtralaboral: emptyRisk(`Consolidado Extralaboral ${suffix}`),
  total: 0,
});

const ExtralaboralContent = ({ stats, title }: { stats: ExtralaboralStats; title: string }) => {
  const dimensionsData = [
    stats.tiempoFueraTrabajo,
    stats.relacionesFamiliares,
    stats.comunicacionRelaciones,
    stats.situacionEconomica,
    stats.caracteristicasVivienda,
    stats.influenciaEntorno,
    stats.desplazamientoVivienda,
  ];

  return (
    <div className="space-y-6">
      <div style={{
        background: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{title}</h2>
        <p style={{ opacity: 0.8, margin: '4px 0 0', fontSize: '0.9rem' }}>
          Análisis de Factores Psicosociales Extralaborales ({stats.total} registros)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RiskGroupedBarChart
          title="DIMENSIONES EXTRALABORALES"
          data={dimensionsData}
        />
      </div>

      <ConsolidatedRiskChart
        title={`CONSOLIDADO ${title}`}
        data={stats.consolidadoExtralaboral}
      />
    </div>
  );
};

export const ExtralaboralDashboard = ({ statsA, statsB }: ExtralaboralDashboardProps) => {
  const safeStatsA = statsA || emptyExtralaboral('A');
  const safeStatsB = statsB || emptyExtralaboral('B');

  const [activeTab, setActiveTab] = React.useState<'A' | 'B'>('A');

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('A')}
          style={{
            padding: '14px 20px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'A' ? 'var(--primary)' : 'var(--card)',
            color: activeTab === 'A' ? 'var(--primary-foreground)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          EXTRALABORAL A ({safeStatsA.total} registros)
        </button>
        <button
          onClick={() => setActiveTab('B')}
          style={{
            padding: '14px 20px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            borderLeft: '1px solid var(--border)',
            backgroundColor: activeTab === 'B' ? 'var(--primary)' : 'var(--card)',
            color: activeTab === 'B' ? 'var(--primary-foreground)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          EXTRALABORAL B ({safeStatsB.total} registros)
        </button>
      </div>

      {activeTab === 'A' && (
        <ExtralaboralContent stats={safeStatsA} title="EXTRALABORAL A" />
      )}

      {activeTab === 'B' && (
        <ExtralaboralContent stats={safeStatsB} title="EXTRALABORAL B" />
      )}
    </div>
  );
};
