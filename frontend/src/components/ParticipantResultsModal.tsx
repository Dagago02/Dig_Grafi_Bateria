import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

interface ResultItem {
  id: number;
  tipo_resultado: string;
  nombre_target: string;
  puntaje_bruto: number;
  puntaje_transformado: number;
  nivel_riesgo: string;
}

interface ParticipantResultsSummary {
  nombres: string;
  cedula: string;
  tipo_forma: string;
  results: ResultItem[];
}

interface Props {
  participantId: number;
  onClose: () => void;
}

const DIMENSIONS_NAMES: Record<string, string> = {
  // Forma A/B Dominios
  'liderazgo_y_relaciones_sociales_en_el_trabajo': 'Liderazgo y relaciones sociales en el trabajo',
  'control_sobre_el_trabajo': 'Control sobre el trabajo',
  'demandas_del_trabajo': 'Demandas del trabajo',
  'recompensas': 'Recompensas',
  
  // Forma A/B Dimensiones Liderazgo
  'caracteristicas_del_liderazgo': 'Características del liderazgo',
  'relaciones_sociales_en_el_trabajo': 'Relaciones sociales en el trabajo',
  'retroalimentacion_del_desempeno': 'Retroalimentación del desempeño',
  'relacion_con_los_colaboradores': 'Relación con los colaboradores (Subordinados)',

  // Forma A/B Dimensiones Control
  'claridad_de_rol': 'Claridad de rol',
  'capacitacion': 'Capacitación',
  'participacion_y_manejo_del_cambio': 'Participación y manejo del cambio',
  'oportunidades_para_el_uso_y_desarrollo_de_habilidades_y_conocimientos': 'Oportunidades para uso de habilidades',
  'control_y_autonomia_sobre_el_trabajo': 'Control y autonomía sobre el trabajo',

  // Forma A/B Dimensiones Demandas
  'demandas_ambientales_y_de_esfuerzo_fisico': 'Demandas ambientales y esfuerzo físico',
  'demandas_emocionales': 'Demandas emocionales',
  'demandas_cuantitativas': 'Demandas cuantitativas',
  'influencia_del_trabajo_sobre_el_entorno_extralaboral': 'Influencia en el entorno extralaboral',
  'exigencias_de_responsabilidad_del_cargo': 'Exigencias de responsabilidad del cargo',
  'demandas_de_carga_mental': 'Demandas de carga mental',
  'consistencia_del_rol': 'Consistencia del rol',
  'demandas_de_la_jornada_de_trabajo': 'Demandas de la jornada de trabajo',

  // Forma A/B Dimensiones Recompensas
  'recompensas_derivadas_de_la_pertenencia_a_la_organizacion_y_del_trabajo_que_se_realiza': 'Recompensas de pertenencia',
  'reconocimiento_y_compensacion': 'Reconocimiento y compensación',

  // Extralaboral Dimensiones
  'tiempo_fuera_del_trabajo': 'Tiempo fuera del trabajo',
  'relaciones_familiares': 'Relaciones familiares',
  'comunicacion_y_relaciones_interpersonales': 'Comunicación y relaciones interpersonales',
  'situacion_economica_del_grupo_familiar': 'Situación económica del grupo familiar',
  'caracteristicas_de_la_vivienda_y_de_su_entorno': 'Características de la vivienda y de su entorno',
  'influencia_del_entorno_extralaboral_sobre_el_trabajo': 'Influencia del entorno sobre el trabajo',
  'desplazamiento_vivienda_trabajo_vivienda': 'Desplazamiento vivienda - trabajo - vivienda',
};

const getDisplayName = (target: string, type: string) => {
  if (!target) return '-';
  if (type === 'general') {
    const map: any = {
      'total_general': 'Total General (Intra + Extra)',
      'intralaboral': 'Total Intralaboral',
      'extralaboral': 'Total Extralaboral',
      'estres': 'Nivel de Estrés'
    };
    return map[target] || target;
  }
  return DIMENSIONS_NAMES[target] || target.replace(/_/g, ' ');
};

export const ParticipantResultsModal: React.FC<Props> = ({ participantId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ParticipantResultsSummary | null>(null);
  const [privacyMode, setPrivacyMode] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [participantId]);

  const fetchResults = async () => {
    try {
      const res = await api.get(`/results/participant/${participantId}`);
      setSummary(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al obtener los resultados individuales.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeClass = (risk: string) => {
    const r = (risk || '').toLowerCase();
    if (r.includes('sin riesgo') || r.includes('muy bajo')) return 'badge-success';
    if (r.includes('bajo')) return 'badge-active';
    if (r.includes('medio')) return 'badge-warning';
    return 'badge-danger';
  };

  const getRiskColor = (risk: string) => {
    const r = (risk || '').toLowerCase();
    if (r.includes('sin riesgo') || r.includes('muy bajo')) return '#10b981';
    if (r.includes('bajo')) return '#3b82f6';
    if (r.includes('medio')) return '#f59e0b';
    if (r.includes('muy alto')) return '#ef4444';
    return '#f97316';
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-content" style={{ maxWidth: '1000px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">Resultados Individuales</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando resultados...
          </div>
        ) : summary && summary.results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px' }}>
            {(() => {
              const genResult = summary.results.find((r) => r.tipo_resultado === 'general' && r.nombre_target === 'total_general');
              const intraResult = summary.results.find((r) => r.tipo_resultado === 'general' && r.nombre_target === 'intralaboral');
              const extraResult = summary.results.find((r) => r.tipo_resultado === 'general' && r.nombre_target === 'extralaboral');
              const estresResult = summary.results.find((r) => r.tipo_resultado === 'general' && r.nombre_target === 'estres');

              return (
                <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Trabajador: <strong>{privacyMode ? '*** ***' : summary.nombres}</strong> (Cédula: {privacyMode ? '***' : summary.cedula} | Forma {summary.tipo_forma})
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      onClick={() => setPrivacyMode(!privacyMode)}
                      title="Modo Privacidad"
                    >
                      {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
                      {privacyMode ? ' Ocultar Datos' : ' Mostrar Datos'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '16px' }}>
                    <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total General (Intra + Extra)</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: getRiskColor(genResult?.nivel_riesgo || '') }}>
                        {genResult?.puntaje_transformado ?? '-'}
                      </div>
                      <span className={`badge ${getRiskBadgeClass(genResult?.nivel_riesgo || '')}`} style={{ marginTop: '6px' }}>
                        {genResult?.nivel_riesgo || 'N/A'}
                      </span>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Intralaboral</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: getRiskColor(intraResult?.nivel_riesgo || '') }}>
                        {intraResult?.puntaje_transformado ?? '-'}
                      </div>
                      <span className={`badge ${getRiskBadgeClass(intraResult?.nivel_riesgo || '')}`} style={{ marginTop: '6px' }}>
                        {intraResult?.nivel_riesgo || 'N/A'}
                      </span>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Extralaboral</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: getRiskColor(extraResult?.nivel_riesgo || '') }}>
                        {extraResult?.puntaje_transformado ?? '-'}
                      </div>
                      <span className={`badge ${getRiskBadgeClass(extraResult?.nivel_riesgo || '')}`} style={{ marginTop: '6px' }}>
                        {extraResult?.nivel_riesgo || 'N/A'}
                      </span>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nivel de Estrés</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: getRiskColor(estresResult?.nivel_riesgo || '') }}>
                        {estresResult?.puntaje_transformado ?? '-'}
                      </div>
                      <span className={`badge ${getRiskBadgeClass(estresResult?.nivel_riesgo || '')}`} style={{ marginTop: '6px' }}>
                        {estresResult?.nivel_riesgo || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Dominios & Dimensiones Breakdown */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>Desglose por Dominios y Dimensiones</h3>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Componente / Dominio / Dimensión</th>
                      <th>Tipo</th>
                      <th>Puntaje Bruto</th>
                      <th>Puntaje Transformado</th>
                      <th>Nivel de Riesgo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.results.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: r.tipo_resultado === 'dominio' ? 700 : r.tipo_resultado === 'general' ? 800 : 400 }}>
                          {getDisplayName(r.nombre_target, r.tipo_resultado)}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                            {r.tipo_resultado}
                          </span>
                        </td>
                        <td>{r.puntaje_bruto}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 600, width: '40px' }}>{r.puntaje_transformado}</span>
                            <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(r.puntaje_transformado, 100)}%`,
                                  backgroundColor: getRiskColor(r.nivel_riesgo),
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getRiskBadgeClass(r.nivel_riesgo)}`}>{r.nivel_riesgo}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay resultados calculados para este participante. Asegúrate de procesar la evaluación completa.
          </div>
        )}
      </div>
    </div>
  );
};
