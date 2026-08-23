import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { StressStats, RiskLevelData } from '../types/dashboard';
import { RiskGroupedBarChart } from './charts/RiskGroupedBarChart';
import { ConsolidatedRiskChart } from './charts/ConsolidatedRiskChart';

interface StressDashboardProps {
  statsA?: StressStats | null;
  statsB?: StressStats | null;
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

const emptyStress = (suffix: string): StressStats => ({
  fisiologico: emptyRisk("Fisiológicos"),
  psicoemocional: emptyRisk("Psicoemocionales"),
  psicologico: emptyRisk("Cognitivos y comportamentales"),
  social: emptyRisk("Sociales"),
  consolidadoEstres: emptyRisk(`Consolidado Estrés ${suffix}`),
  total: 0,
});

const StressContent = ({ stats, title }: { stats: StressStats; title: string }) => {
  const symptomsData = [
    stats.fisiologico,
    stats.psicoemocional,
    stats.psicologico,
    stats.social,
  ];

  const hasDetailedData = symptomsData.some(d => d.total > 0);

  return (
    <div className="space-y-6">
      <div style={{
        background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{title}</h2>
        <p style={{ opacity: 0.8, margin: '4px 0 0', fontSize: '0.9rem' }}>
          Sintomatología asociada al estrés ({stats.total} registros)
        </p>
      </div>

      {/* Only show detailed chart if data exists */}
      {hasDetailedData && (
        <div className="grid grid-cols-1 gap-6">
          <RiskGroupedBarChart
            title="SINTOMATOLOGÍA"
            data={symptomsData}
          />
        </div>
      )}

      <ConsolidatedRiskChart
        title={`NIVEL TOTAL DE ${title}`}
        data={stats.consolidadoEstres}
      />
    </div>
  );
};

export const StressDashboard = ({ statsA, statsB }: StressDashboardProps) => {
  const safeStatsA = statsA || emptyStress('A');
  const safeStatsB = statsB || emptyStress('B');

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
          ESTRÉS A ({safeStatsA.total} registros)
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
          ESTRÉS B ({safeStatsB.total} registros)
        </button>
      </div>

      {activeTab === 'A' && (
        <StressContent stats={safeStatsA} title="ESTRÉS A" />
      )}

      {activeTab === 'B' && (
        <StressContent stats={safeStatsB} title="ESTRÉS B" />
      )}
    </div>
  );
};
