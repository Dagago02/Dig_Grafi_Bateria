import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, X, AlertTriangle, Search, Filter, UserCheck, FileText, BarChart3, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { ParticipantResultsModal } from '../components/ParticipantResultsModal';

interface Company {
  id: number;
  nombre: string;
}

interface Evaluation {
  id: number;
  empresa_id: number;
  nombre: string;
  estado?: string;
}

interface Participant {
  id: number;
  empresa_id: number;
  evaluacion_id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  sexo: string | null;
  edad: number | null;
  estado_civil: string | null;
  nivel_educativo: string | null;
  cargo: string | null;
  area: string | null;
  tipo_contrato: string | null;
  tiempo_empresa: string | null;
  tipo_forma: string | null;
  estado_evaluacion: string;
  created_at: string;
  updated_at: string;
  empresa_nombre?: string;
  evaluacion_nombre?: string;
}

export const Participants: React.FC = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter States
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [filterEvaluation, setFilterEvaluation] = useState<string>('');
  const [filterForm, setFilterForm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [viewingParticipantId, setViewingParticipantId] = useState<number | null>(null);

  // Privacy Mode State
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);

  // Form State
  const [empresaId, setEmpresaId] = useState<number | ''>('');
  const [evaluacionId, setEvaluacionId] = useState<number | ''>('');
  const [cedula, setCedula] = useState<string>('');
  const [nombres, setNombres] = useState<string>('');
  const [apellidos, setApellidos] = useState<string>('');
  const [sexo, setSexo] = useState<string>('');
  const [edad, setEdad] = useState<number | ''>('');
  const [estadoCivil, setEstadoCivil] = useState<string>('');
  const [nivelEducativo, setNivelEducativo] = useState<string>('');
  const [cargo, setCargo] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [tipoContrato, setTipoContrato] = useState<string>('');
  const [tiempoEmpresa, setTiempoEmpresa] = useState<string>('');
  const [tipoForma, setTipoForma] = useState<string>('A');
  const [estadoEvaluacion, setEstadoEvaluacion] = useState<string>('pendiente');

  useEffect(() => {
    fetchCompanies();
    fetchEvaluations();
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [filterCompany, filterEvaluation, filterForm, filterStatus, searchQuery]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error('Error al cargar empresas', err);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const res = await api.get('/evaluations/');
      setEvaluations(res.data);
    } catch (err) {
      console.error('Error al cargar evaluaciones', err);
    }
  };

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filterCompany) params.empresa_id = filterCompany;
      if (filterEvaluation) params.evaluacion_id = filterEvaluation;
      if (filterForm) params.tipo_forma = filterForm;
      if (filterStatus) params.estado_evaluacion = filterStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/participants/', { params });
      setParticipants(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar los participantes.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvaluationsForForm = evaluations.filter(
    (e) => !empresaId || e.empresa_id === Number(empresaId)
  );

  const openCreateModal = () => {
    setEditingParticipant(null);
    const initialCompanyId = companies.length > 0 ? companies[0].id : '';
    setEmpresaId(initialCompanyId);

    const availableEvals = evaluations.filter((e) => !initialCompanyId || e.empresa_id === initialCompanyId);
    setEvaluacionId(availableEvals.length > 0 ? availableEvals[0].id : '');

    setCedula('');
    setNombres('');
    setApellidos('');
    setSexo('M');
    setEdad('');
    setEstadoCivil('Soltero(a)');
    setNivelEducativo('Profesional');
    setCargo('');
    setArea('');
    setTipoContrato('Término indefinido');
    setTiempoEmpresa('1 a 5 años');
    setTipoForma('A');
    setEstadoEvaluacion('pendiente');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Participant) => {
    setEditingParticipant(p);
    setEmpresaId(p.empresa_id);
    setEvaluacionId(p.evaluacion_id);
    setCedula(p.cedula);
    setNombres(p.nombres);
    setApellidos(p.apellidos);
    setSexo(p.sexo || 'M');
    setEdad(p.edad || '');
    setEstadoCivil(p.estado_civil || '');
    setNivelEducativo(p.nivel_educativo || '');
    setCargo(p.cargo || '');
    setArea(p.area || '');
    setTipoContrato(p.tipo_contrato || '');
    setTiempoEmpresa(p.tiempo_empresa || '');
    setTipoForma(p.tipo_forma || 'A');
    setEstadoEvaluacion(p.estado_evaluacion);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!empresaId || !evaluacionId) {
      setError('Debes seleccionar empresa y evaluación.');
      return;
    }

    const payload = {
      empresa_id: Number(empresaId),
      evaluacion_id: Number(evaluacionId),
      cedula,
      nombres,
      apellidos,
      sexo: sexo || null,
      edad: edad !== '' ? Number(edad) : null,
      estado_civil: estadoCivil || null,
      nivel_educativo: nivelEducativo || null,
      cargo: cargo || null,
      area: area || null,
      tipo_contrato: tipoContrato || null,
      tiempo_empresa: tiempoEmpresa || null,
      tipo_forma: tipoForma || null,
      estado_evaluacion: estadoEvaluacion,
    };

    try {
      if (editingParticipant) {
        await api.put(`/participants/${editingParticipant.id}`, payload);
        setSuccess('Participante actualizado exitosamente.');
      } else {
        await api.post('/participants/', payload);
        setSuccess('Participante registrado exitosamente.');
      }
      setIsModalOpen(false);
      fetchParticipants();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar participante.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este participante?')) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/participants/${id}`);
      setSuccess('Participante eliminado exitosamente.');
      fetchParticipants();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar participante.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Participantes</h1>
          <p className="page-subtitle">Gestión de trabajadores a evaluar y asignación de Forma A / B</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`btn ${privacyMode ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setPrivacyMode(!privacyMode)}
            title="Modo Privacidad"
          >
            {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
            {privacyMode ? ' Ocultar Datos' : ' Mostrar Datos'}
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            Nuevo Participante
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
          <span>{success}</span>
        </div>
      )}

      {/* Filters bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por cédula o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={filterCompany}
              onChange={(e) => {
                setFilterCompany(e.target.value);
                setFilterEvaluation('');
              }}
            >
              <option value="">Todas las empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-control"
              value={filterEvaluation}
              onChange={(e) => setFilterEvaluation(e.target.value)}
            >
              <option value="">Todas las evaluaciones</option>
              {evaluations
                .filter((ev) => !filterCompany || ev.empresa_id === Number(filterCompany))
                .map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nombre}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <select
              className="form-control"
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
            >
              <option value="">Todas las Formas</option>
              <option value="A">Forma A (Jefes / Profesionales)</option>
              <option value="B">Forma B (Operativos / Auxiliares)</option>
            </select>
          </div>

          <div>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando participantes...
          </div>
        ) : participants.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No se encontraron participantes. Haz clic en "Nuevo Participante" para comenzar.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre Completo</th>
                  <th>Empresa / Evaluación</th>
                  <th>Forma</th>
                  <th>Cargo / Área</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{privacyMode ? '***' : p.cedula}</td>
                    <td>
                      {privacyMode ? '*** ***' : `${p.nombres} ${p.apellidos}`}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 500 }}>{p.empresa_nombre}</span>
                        <div style={{ color: 'var(--text-secondary)' }}>{p.evaluacion_nombre}</div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: p.tipo_forma === 'A' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                          color: p.tipo_forma === 'A' ? '#60a5fa' : '#c084fc',
                          fontWeight: 700,
                        }}
                      >
                        Forma {p.tipo_forma || '-'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span>{p.cargo || '-'}</span>
                        {p.area && <span style={{ color: 'var(--text-secondary)', display: 'block' }}>{p.area}</span>}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.estado_evaluacion === 'completado'
                            ? 'badge-success'
                            : p.estado_evaluacion === 'en_progreso'
                            ? 'badge-active'
                            : 'badge-inactive'
                        }`}
                      >
                        {p.estado_evaluacion}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          title="Digitalizar Encuesta"
                          onClick={() => navigate(`/digitador/${p.id}`)}
                        >
                          <FileText size={16} />
                          Encuesta
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px' }}
                          title="Ver Resultados"
                          onClick={() => setViewingParticipantId(p.id)}
                        >
                          <BarChart3 size={16} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px' }}
                          title="Editar"
                          onClick={() => openEditModal(p)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleDelete(p.id)}
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
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingParticipant ? 'Editar Participante' : 'Registrar Nuevo Participante'}
              </h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Empresa *</label>
                  <select
                    className="form-control"
                    value={empresaId}
                    onChange={(e) => {
                      const newEmpId = Number(e.target.value);
                      setEmpresaId(newEmpId);
                      const avail = evaluations.filter((ev) => ev.empresa_id === newEmpId);
                      setEvaluacionId(avail.length > 0 ? avail[0].id : '');
                    }}
                    disabled={!!editingParticipant}
                    required
                  >
                    <option value="" disabled>
                      Seleccionar empresa
                    </option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Evaluación *</label>
                  <select
                    className="form-control"
                    value={evaluacionId}
                    onChange={(e) => setEvaluacionId(Number(e.target.value))}
                    disabled={!!editingParticipant}
                    required
                  >
                    <option value="" disabled>
                      Seleccionar evaluación
                    </option>
                    {filteredEvaluationsForForm.map((ev) => (
                      <option 
                        key={ev.id} 
                        value={ev.id}
                        disabled={!editingParticipant && ev.estado === 'completada'}
                      >
                        {ev.nombre} {ev.estado === 'completada' ? '(Completada)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cédula de Identidad *</label>
                <input
                  type="text"
                  className="form-control"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Nombres *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Apellidos *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Forma *</label>
                  <select
                    className="form-control"
                    value={tipoForma}
                    onChange={(e) => setTipoForma(e.target.value)}
                    required
                  >
                    <option value="A">Forma A (Profesional/Jefe)</option>
                    <option value="B">Forma B (Operativo/Auxiliar)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sexo</label>
                  <select
                    className="form-control"
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <input
                    type="number"
                    className="form-control"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value ? Number(e.target.value) : '')}
                    min={18}
                    max={99}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Área / Departamento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Contrato</label>
                <select
                  className="form-control"
                  value={tipoContrato}
                  onChange={(e) => setTipoContrato(e.target.value)}
                >
                  <option value="Término indefinido">Término indefinido</option>
                  <option value="Término fijo">Término fijo</option>
                  <option value="Obra o labor">Obra o labor</option>
                  <option value="Prestación de servicios">Prestación de servicios</option>
                  <option value="Aprendizaje / Prácticas">Aprendizaje / Prácticas</option>
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
                  {editingParticipant ? 'Guardar Cambios' : 'Registrar Participante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingParticipantId !== null && (
        <ParticipantResultsModal 
          participantId={viewingParticipantId} 
          onClose={() => setViewingParticipantId(null)} 
        />
      )}
    </div>
  );
};
