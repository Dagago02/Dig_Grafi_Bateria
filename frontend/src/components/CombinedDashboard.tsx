import React from 'react';
import { IntralaboralStats, RiskLevelData } from '../types/dashboard';
import { addRiskData } from '../utils/dashboardUtils';
import { ConsolidatedRiskChart } from './charts/ConsolidatedRiskChart';

interface CombinedDashboardProps {
  stats: IntralaboralStats;
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

const ComparisonSection = ({ title, statsA, statsB, combined }: {
  title: string;
  statsA: RiskLevelData;
  statsB: RiskLevelData;
  combined: RiskLevelData;
}) => {
  return (
    <div className="dashboard-card" style={{ padding: '24px' }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        textAlign: 'center',
        textTransform: 'uppercase',
        color: 'var(--text-primary)',
        marginBottom: '24px',
        padding: '12px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
      }}>
        {title} — Consolidado A + B
      </h3>

      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '1rem' }}>
          Comparativa Forma A vs Forma B
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Forma A</div>
            <ConsolidatedRiskChart title="" data={statsA} showTitle={false} />
          </div>
          <div>
            <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Forma B</div>
            <ConsolidatedRiskChart title="" data={statsB} showTitle={false} />
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

      <div>
        <h4 style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '1rem' }}>
          Total Global (A + B)
        </h4>
        <ConsolidatedRiskChart title="" data={combined} showTitle={false} />
      </div>
    </div>
  );
};

export const CombinedDashboard = ({ stats }: CombinedDashboardProps) => {
  // Use snake_case property names to match API response
  const consolidadoA = stats.consolidado_A || emptyRisk('Consolidado A');
  const consolidadoB = stats.consolidado_B || emptyRisk('Consolidado B');
  const intraCombined = addRiskData(consolidadoA, consolidadoB);

  // Extralaboral Combined
  const extraA = stats.extralaboralA?.consolidadoExtralaboral;
  const extraB = stats.extralaboralB?.consolidadoExtralaboral;
  const extraCombined = (extraA && extraB) ? addRiskData(extraA, extraB) : (extraA || extraB);

  // Stress Combined
  const estresA = stats.estresA?.consolidadoEstres;
  const estresB = stats.estresB?.consolidadoEstres;
  const estresCombined = (estresA && estresB) ? addRiskData(estresA, estresB) : (estresA || estresB);

  return (
    <div className="space-y-8 animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>CONSOLIDADO GENERAL</h2>
        <p style={{ opacity: 0.9, marginTop: '8px', fontSize: '1rem' }}>Visión unificada de Forma A y Forma B</p>
      </div>

      <div className="space-y-8">
        {/* Intralaboral */}
        <ComparisonSection
          title="Intralaboral"
          statsA={consolidadoA}
          statsB={consolidadoB}
          combined={intraCombined}
        />

        {/* Extralaboral */}
        {extraCombined && extraA && extraB && (
          <ComparisonSection
            title="Extralaboral"
            statsA={extraA}
            statsB={extraB}
            combined={extraCombined}
          />
        )}

        {/* Stress */}
        {estresCombined && estresA && estresB && (
          <ComparisonSection
            title="Estrés"
            statsA={estresA}
            statsB={estresB}
            combined={estresCombined}
          />
        )}
      </div>
    </div>
  );
};
