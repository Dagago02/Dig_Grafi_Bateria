import React, { useEffect, useState } from 'react';
import { Download, Calculator, BarChart3, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { DashboardResponse } from '../types/dashboard';

// Dashboard Components
import { Dashboard } from '../components/Dashboard';
import { IntralaboralDashboard } from '../components/IntralaboralDashboard';
import { ExtralaboralDashboard } from '../components/ExtralaboralDashboard';
import { StressDashboard } from '../components/StressDashboard';
import { CombinedDashboard } from '../components/CombinedDashboard';
import { BaremosTableDashboard, DepartmentBaremosData } from '../components/charts/BaremosTableDashboard';

interface Company {
  id: number;
  nombre: string;
}

interface Evaluation {
  id: number;
  empresa_id: number;
  nombre: string;
}

export const Results: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('');

  const [dashboardStats, setDashboardStats] = useState<DashboardResponse | null>(null);
  const [baremosData, setBaremosData] = useState<DepartmentBaremosData | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('demografico');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchEvaluations(Number(selectedCompany));
    } else {
      setEvaluations([]);
      setSelectedEvaluation('');
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedEvaluation) {
      fetchDashboardStats(Number(selectedEvaluation));
      fetchBaremosData(Number(selectedEvaluation));
    } else {
      setDashboardStats(null);
      setBaremosData(null);
    }
  }, [selectedEvaluation]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies/');
      setCompanies(res.data);
      if (res.data.length > 0) {
        setSelectedCompany(String(res.data[0].id));
      }
    } catch (err) {
      console.error('Error al cargar empresas', err);
    }
  };

  const fetchEvaluations = async (companyId: number) => {
    try {
      const res = await api.get(`/evaluations/?empresa_id=${companyId}`);
      setEvaluations(res.data);
      if (res.data.length > 0) {
        setSelectedEvaluation(String(res.data[0].id));
      } else {
        setSelectedEvaluation('');
      }
    } catch (err) {
      console.error('Error al cargar evaluaciones', err);
    }
  };

  const fetchBaremosData = async (evalId: number) => {
    try {
      const res = await api.get(`/results/evaluation/${evalId}/baremos-por-departamento`);
      setBaremosData(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setBaremosData(null);
      }
    }
  };

  const fetchDashboardStats = async (evalId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/results/evaluation/${evalId}/dashboard-stats`);
      setDashboardStats(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setDashboardStats(null);
      } else {
        setError(err.response?.data?.detail || 'Error al obtener estadísticas del dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateAll = async () => {
    if (!selectedEvaluation) return;
    setCalculating(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/results/calculate-evaluation/${selectedEvaluation}`);
      setSuccess('Cálculo finalizado para todos los participantes de la evaluación.');
      fetchDashboardStats(Number(selectedEvaluation));
      fetchBaremosData(Number(selectedEvaluation));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al ejecutar cálculo masivo.');
    } finally {
      setCalculating(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedEvaluation) return;
    setDownloading(true);
    setError(null);
    try {
      const response = await api.get(`/results/export/evaluation/${selectedEvaluation}/excel`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Base_Datos_Riesgo_Psicosocial_Eval_${selectedEvaluation}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Archivo Excel (.xlsx) generado y descargado exitosamente.');
    } catch (err: any) {
      setError('Error al generar la base de datos en Excel.');
    } finally {
      setDownloading(false);
    }
  };

  const hasData = dashboardStats !== null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Dashboard Consolidado</h1>
          <p className="page-subtitle">Estadísticas demográficas y de riesgo psicosocial de la empresa</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={handleCalculateAll}
            disabled={calculating || !selectedEvaluation}
          >
            <RefreshCw size={18} className={calculating ? 'spin' : ''} />
            {calculating ? 'Calculando...' : 'Recalcular Evaluación'}
          </button>

          <button
            className="btn btn-primary"
            onClick={handleExportExcel}
            disabled={downloading || !selectedEvaluation}
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
          >
            <Download size={18} />
            {downloading ? 'Generando Excel...' : 'Exportar Base de Datos Excel (.xlsx)'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Empresa</label>
            <select
              className="form-control"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Evaluación</label>
            <select
              className="form-control"
              value={selectedEvaluation}
              onChange={(e) => setSelectedEvaluation(e.target.value)}
            >
              {evaluations.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando estadísticas del dashboard...
        </div>
      ) : !hasData ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No hay datos o participantes en esta evaluación. Asegúrate de procesar las encuestas primero.
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {/* Tabs header */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px', overflowX: 'auto' }}>
            <button
              className={`btn ${activeTab === 'demografico' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('demografico')}
            >
              📊 Demográficos
            </button>
            <button
              className={`btn ${activeTab === 'intralaboral' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('intralaboral')}
            >
              📈 Intralaboral
            </button>
            <button
              className={`btn ${activeTab === 'extralaboral' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('extralaboral')}
            >
              🏠 Extralaboral
            </button>
            <button
              className={`btn ${activeTab === 'estres' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('estres')}
            >
              😫 Estrés
            </button>
            <button
              className={`btn ${activeTab === 'consolidado' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('consolidado')}
            >
              📑 Consolidado
            </button>
            <button
              className={`btn ${activeTab === 'baremos' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('baremos')}
            >
              🚦 Baremos
            </button>
          </div>

          {/* Tab contents */}
          <div style={{ paddingBottom: '40px' }}>
            {activeTab === 'demografico' && (
              <Dashboard stats={dashboardStats.demographics as any} />
            )}
            {activeTab === 'intralaboral' && (
              <IntralaboralDashboard stats={dashboardStats.intralaboral} />
            )}
            {activeTab === 'extralaboral' && (
              <ExtralaboralDashboard
                statsA={dashboardStats.intralaboral.extralaboralA as any}
                statsB={dashboardStats.intralaboral.extralaboralB as any}
              />
            )}
            {activeTab === 'estres' && (
              <StressDashboard
                statsA={dashboardStats.intralaboral.estresA as any}
                statsB={dashboardStats.intralaboral.estresB as any}
              />
            )}
            {activeTab === 'consolidado' && (
              <CombinedDashboard stats={dashboardStats.intralaboral} />
            )}
            {activeTab === 'baremos' && (
              <BaremosTableDashboard data={baremosData} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
