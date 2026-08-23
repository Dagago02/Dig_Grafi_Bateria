import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, AlertTriangle, Calendar, Building } from 'lucide-react';
import api from '../services/api';

interface Company {
  id: number;
  nombre: string;
}

interface Evaluation {
  id: number;
  empresa_id: number;
  nombre: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
  total_participantes?: number;
  empresa_nombre?: string;
}

export const Evaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);

  // Form State
  const [empresaId, setEmpresaId] = useState<number | ''>('');
  const [nombre, setNombre] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [estado, setEstado] = useState<string>('activa');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchEvaluations();
  }, [selectedCompanyFilter, selectedStatusFilter]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies/');
      setCompanies(response.data);
    } catch (err: any) {
      console.error('Error al obtener empresas:', err);
    }
  };

  const fetchEvaluations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (selectedCompanyFilter) params.empresa_id = selectedCompanyFilter;
      if (selectedStatusFilter) params.estado = selectedStatusFilter;

      const response = await api.get('/evaluations/', { params });
      setEvaluations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar las evaluaciones.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEvaluation(null);
    setEmpresaId(companies.length > 0 ? companies[0].id : '');
    setNombre('');
    setFechaInicio('');
    setFechaFin('');
    setEstado('activa');
    setIsModalOpen(true);
  };

  const openEditModal = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setEmpresaId(evaluation.empresa_id);
    setNombre(evaluation.nombre);
    setFechaInicio(evaluation.fecha_inicio || '');
    setFechaFin(evaluation.fecha_fin || '');
    setEstado(evaluation.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!empresaId) {
      setError('Debes seleccionar una empresa.');
      return;
    }

    const payload = {
      empresa_id: Number(empresaId),
      nombre,
      fecha_inicio: fechaInicio || null,
      fecha_fin: fechaFin || null,
      estado,
    };

    try {
      if (editingEvaluation) {
        await api.put(`/evaluations/${editingEvaluation.id}`, payload);
        setSuccess('Evaluación actualizada exitosamente.');
      } else {
        await api.post('/evaluations/', payload);
        setSuccess('Evaluación creada exitosamente.');
      }
      setIsModalOpen(false);
      fetchEvaluations();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar la evaluación.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta evaluación y sus participantes?')) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/evaluations/${id}`);
      setSuccess('Evaluación eliminada exitosamente.');
      fetchEvaluations();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar la evaluación.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Evaluaciones</h1>
          <p className="page-subtitle">Gestiona los periodos de medición de riesgo psicosocial</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Nueva Evaluación
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
        </div>
      )}

      {/* Filters bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              style={{ width: '220px' }}
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            >
              <option value="">Todas las empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              style={{ width: '180px' }}
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="completada">Completada</option>
              <option value="archivada">Archivada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando evaluaciones...
          </div>
        ) : evaluations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No se encontraron evaluaciones registrados. Haz clic en "Nueva Evaluación" para comenzar.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Empresa</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Participantes</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600 }}>{ev.nombre}</td>
                    <td>{ev.empresa_nombre || '-'}</td>
                    <td>{ev.fecha_inicio || '-'}</td>
                    <td>{ev.fecha_fin || '-'}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                        {ev.total_participantes || 0} trabajadores
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ev.estado === 'activa'
                            ? 'badge-active'
                            : ev.estado === 'completada'
                            ? 'badge-success'
                            : 'badge-inactive'
                        }`}
                      >
                        {ev.estado}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px' }}
                          onClick={() => openEditModal(ev)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleDelete(ev.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingEvaluation ? 'Editar Evaluación' : 'Crear Nueva Evaluación'}
              </h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Empresa *</label>
                <select
                  className="form-control"
                  value={empresaId}
                  onChange={(e) => setEmpresaId(Number(e.target.value))}
                  disabled={!!editingEvaluation}
                  required
                >
                  <option value="" disabled>
                    Selecciona una empresa
                  </option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de la Evaluación *</label>
                <input
                  type="text"
                  className="form-control"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="e.g. Evaluación Anual 2026"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Fecha de Inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha Final</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-control"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="activa">Activa</option>
                  <option value="completada">Completada</option>
                  <option value="archivada">Archivada</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEvaluation ? 'Guardar Cambios' : 'Crear Evaluación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
