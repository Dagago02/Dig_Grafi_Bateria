import React, { useEffect, useState } from 'react';
import { Building2, ClipboardList, Users, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const [companyCount, setCompanyCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/companies/');
        setCompanyCount(response.data.length);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Bienvenido al sistema de digitalización y análisis de riesgo psicosocial</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Card 1 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: 0 }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <Building2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Empresas Registradas</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginTop: '4px' }}>
              {loading ? '...' : companyCount}
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: 0 }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <ClipboardList size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Evaluaciones Activas</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginTop: '4px' }}>0</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: 0 }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Participantes</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginTop: '4px' }}>0</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: 0 }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Encuestas Completadas</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginTop: '4px' }}>0</div>
          </div>
        </div>

      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>Información General del Sistema</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '12px', lineHeight: 1.6 }}>
          Esta plataforma permite la digitalización completa del instrumento para la evaluación de factores de riesgo psicosocial del Ministerio de Trabajo de Colombia.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Usa el menú lateral para acceder a la gestión de <strong>Empresas</strong> y comenzar el proceso de configuración.
        </p>
      </div>
    </div>
  );
};
