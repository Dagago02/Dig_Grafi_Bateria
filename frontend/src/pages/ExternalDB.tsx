import React, { useState } from 'react';
import { UploadCloud, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { parseExcelFile, calculateStats } from '../utils/external-parsers/excelParser';
import { parseIntralaboralData, calculateDepartmentAverages } from '../utils/external-parsers/intralaboralParser';
import { DashboardResponse } from '../types/dashboard';
import { DepartmentBaremosData } from '../components/charts/BaremosTableDashboard';

// Dashboard Components
import { Dashboard } from '../components/Dashboard';
import { IntralaboralDashboard } from '../components/IntralaboralDashboard';
import { ExtralaboralDashboard } from '../components/ExtralaboralDashboard';
import { StressDashboard } from '../components/StressDashboard';
import { CombinedDashboard } from '../components/CombinedDashboard';
import { BaremosTableDashboard } from '../components/charts/BaremosTableDashboard';

export const ExternalDB: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('demografico');

  const [dashboardStats, setDashboardStats] = useState<DashboardResponse | null>(null);
  const [baremosData, setBaremosData] = useState<DepartmentBaremosData | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setError('Por favor sube un archivo con formato .xlsx');
      return;
    }

    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      // Parse data
      const [employees, intralaboral, baremos] = await Promise.all([
        parseExcelFile(file),
        parseIntralaboralData(file),
        calculateDepartmentAverages(file)
      ]);

      const demographics = calculateStats(employees);

      setDashboardStats({
        demographics,
        intralaboral
      });
      setBaremosData(baremos as any);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al procesar el archivo Excel. Asegúrate de que tenga el formato correcto.');
      setDashboardStats(null);
      setBaremosData(null);
    } finally {
      setLoading(false);
    }
  };

  const hasData = dashboardStats !== null;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Base de Datos Externa</h1>
        <p className="page-subtitle">Visualiza resultados a partir de un archivo Excel consolidado (.xlsx) sin persistir los datos en el sistema.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '32px', textAlign: 'center', border: '2px dashed var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <input
          type="file"
          id="excel-upload"
          accept=".xlsx"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <label htmlFor="excel-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <FileSpreadsheet size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
              {fileName ? fileName : 'Subir archivo Excel (.xlsx)'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {loading ? 'Procesando archivo...' : 'Haz clic para seleccionar o arrastra el archivo aquí'}
            </p>
          </div>
          <div className="btn btn-primary" style={{ pointerEvents: 'none' }}>
            <UploadCloud size={18} />
            {fileName ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
          </div>
        </label>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando y procesando estadísticas del archivo Excel...
        </div>
      )}

      {hasData && !loading && dashboardStats && (
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
