import React from 'react';
import { IntralaboralStats, RiskLevelData } from '../types/dashboard';
import { RiskGroupedBarChart } from './charts/RiskGroupedBarChart';
import { ConsolidatedRiskChart } from './charts/ConsolidatedRiskChart';

interface IntralaboralDashboardProps {
  stats: IntralaboralStats;
}

// Map each dimension name to its parent domain for Forma A
// Source: official_data/ batería de riesgo psicosocial
const DOMINIOS_A: Record<string, string[]> = {
  'LIDERAZGO Y RELACIONES SOCIALES EN EL TRABAJO': [
    'Características del liderazgo',
    'Relaciones sociales en el trabajo',
    'Retroalimentación del desempeño',
    'Relación con los colaboradores',
  ],
  'CONTROL SOBRE EL TRABAJO': [
    'Claridad de rol',
    'Capacitación',
    'Participación y manejo del cambio',
    'Oportunidades para el uso y desarrollo de habilidades y conocimientos',
    'Control y autonomía sobre el trabajo',
  ],
  'DEMANDAS DEL TRABAJO': [
    'Demandas ambientales y de esfuerzo físico',
    'Demandas emocionales',
    'Demandas cuantitativas',
    'Influencia del trabajo sobre el entorno extralaboral',
    'Exigencias de responsabilidad del cargo',
    'Demandas de carga mental',
    'Consistencia del rol',
    'Demandas de la jornada de trabajo',
  ],
  'RECOMPENSAS': [
    'Recompensas derivadas de la pertenencia a la organización',
    'Reconocimiento y compensación',
  ],
};

// Forma B has fewer dimensions (no "Relación con los colaboradores", no "Consistencia del rol", no "Exigencias de responsabilidad del cargo")
const DOMINIOS_B: Record<string, string[]> = {
  'LIDERAZGO Y RELACIONES SOCIALES EN EL TRABAJO': [
    'Características del liderazgo',
    'Relaciones sociales en el trabajo',
    'Retroalimentación del desempeño',
  ],
  'CONTROL SOBRE EL TRABAJO': [
    'Claridad de rol',
    'Capacitación',
    'Participación y manejo del cambio',
    'Oportunidades para el uso y desarrollo de habilidades y conocimientos',
    'Control y autonomía sobre el trabajo',
  ],
  'DEMANDAS DEL TRABAJO': [
    'Demandas ambientales y de esfuerzo físico',
    'Demandas emocionales',
    'Demandas cuantitativas',
    'Influencia del trabajo sobre el entorno extralaboral',
    'Demandas de carga mental',
    'Demandas de la jornada de trabajo',
  ],
  'RECOMPENSAS': [
    'Recompensas derivadas de la pertenencia a la organización',
    'Reconocimiento y compensación',
  ],
};

const emptyRisk = (name: string): RiskLevelData => ({
  name,
  muyAlto: 0,
  alto: 0,
  medio: 0,
  bajo: 0,
  sinRiesgo: 0,
  total: 0,
});

/**
 * Build chart data arrays from the dynamic dictionary returned by the API.
 * For each domain, look up each dimension name in the dimensiones dict.
 */
function buildDomainCharts(
  dominioMap: Record<string, string[]>,
  dimensionesDict: Record<string, RiskLevelData>
): { domainName: string; data: RiskLevelData[] }[] {
  return Object.entries(dominioMap).map(([domainName, dimNames]) => ({
    domainName,
    data: dimNames.map(name => dimensionesDict[name] || emptyRisk(name)),
  }));
}

export const IntralaboralDashboard = ({ stats }: IntralaboralDashboardProps) => {
  const chartsA = buildDomainCharts(DOMINIOS_A, stats.dimensiones_A || {});
  const chartsB = buildDomainCharts(DOMINIOS_B, stats.dimensiones_B || {});

  const [activeForma, setActiveForma] = React.useState<'A' | 'B'>('A');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Forma selector tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveForma('A')}
          style={{
            padding: '14px 20px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeForma === 'A' ? 'var(--primary)' : 'var(--card)',
            color: activeForma === 'A' ? 'var(--primary-foreground)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          INTRALABORAL A ({stats.totalFormaA} registros)
        </button>
        <button
          onClick={() => setActiveForma('B')}
          style={{
            padding: '14px 20px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            borderLeft: '1px solid var(--border)',
            backgroundColor: activeForma === 'B' ? 'var(--primary)' : 'var(--card)',
            color: activeForma === 'B' ? 'var(--primary-foreground)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          INTRALABORAL B ({stats.totalFormaB} registros)
        </button>
      </div>

      {activeForma === 'A' && (
        <div className="space-y-6">
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>INTRALABORAL A</h2>
            <p style={{ opacity: 0.8, margin: '4px 0 0', fontSize: '0.9rem' }}>Análisis de Riesgo Psicosocial - Forma A</p>
          </div>

          {/* Domain charts */}
          {chartsA.map(({ domainName, data }) => (
            <RiskGroupedBarChart
              key={domainName}
              title={domainName}
              data={data}
            />
          ))}

          {/* Consolidado A */}
          {stats.consolidado_A && (
            <ConsolidatedRiskChart
              title="CONSOLIDADO INTRALABORAL A"
              data={stats.consolidado_A}
            />
          )}
        </div>
      )}

      {activeForma === 'B' && (
        <div className="space-y-6">
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>INTRALABORAL B</h2>
            <p style={{ opacity: 0.8, margin: '4px 0 0', fontSize: '0.9rem' }}>Análisis de Riesgo Psicosocial - Forma B</p>
          </div>

          {/* Domain charts */}
          {chartsB.map(({ domainName, data }) => (
            <RiskGroupedBarChart
              key={domainName}
              title={domainName}
              data={data}
            />
          ))}

          {/* Consolidado B */}
          {stats.consolidado_B && (
            <ConsolidatedRiskChart
              title="CONSOLIDADO INTRALABORAL B"
              data={stats.consolidado_B}
            />
          )}
        </div>
      )}
    </div>
  );
};

