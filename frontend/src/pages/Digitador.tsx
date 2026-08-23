import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, FileText, User, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../services/api';

interface Participant {
  id: number;
  empresa_id: number;
  evaluacion_id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  tipo_forma: string;
  estado_evaluacion: string;
  empresa_nombre?: string;
  evaluacion_nombre?: string;
}

interface Question {
  id: number;
  texto: string;
  db_id?: number;
  opciones?: any[];
  tipo?: string;
}

interface Section {
  nombre: string;
  preguntas: Question[];
}

interface QuestionnaireStructure {
  cuestionario_id: string;
  nombre: string;
  instrucciones?: string;
  escala_respuesta?: { valor: number; etiqueta: string }[];
  secciones?: Section[];
  preguntas?: Question[];
}

type QuestionnaireType = 'datos_generales' | 'intralaboral' | 'extralaboral' | 'estres';

export const Digitador: React.FC = () => {
  const { participantId } = useParams<{ participantId: string }>();
  const navigate = useNavigate();

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [activeTab, setActiveTab] = useState<QuestionnaireType>('datos_generales');

  // Questionnaires Data
  const [structDG, setStructDG] = useState<QuestionnaireStructure | null>(null);
  const [structIntra, setStructIntra] = useState<QuestionnaireStructure | null>(null);
  const [structExtra, setStructExtra] = useState<QuestionnaireStructure | null>(null);
  const [structEstres, setStructEstres] = useState<QuestionnaireStructure | null>(null);

  // Map of question_id -> value
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [allQuestionsMap, setAllQuestionsMap] = useState<Record<number, Question>>({});

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (participantId) {
      loadData(Number(participantId));
    }
  }, [participantId]);

  const loadData = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Participant
      const partRes = await api.get(`/participants/${id}`);
      const part: Participant = partRes.data;
      setParticipant(part);

      const formaIntra = part.tipo_forma || 'A';

      // 2. Fetch Questionnaire Structures
      const [resDG, resIntra, resExtra, resEstres, resAnswers] = await Promise.all([
        api.get('/questions/structure/datos_generales'),
        api.get(`/questions/structure/${formaIntra}`),
        api.get('/questions/structure/extralaboral'),
        api.get('/questions/structure/estres'),
        api.get(`/answers/participant/${id}`),
      ]);

      setStructDG(resDG.data);
      setStructIntra(resIntra.data);
      setStructExtra(resExtra.data);
      setStructEstres(resEstres.data);

      // Build Map of Answers
      const existingAnswersMap: Record<number, string> = {};
      resAnswers.data.forEach((ans: any) => {
        existingAnswersMap[ans.question_id] = ans.value;
      });
      setAnswers(existingAnswersMap);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar información del participante o cuestionarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const saveAnswers = async (newStatus?: string) => {
    if (!participant) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const answersList = Object.entries(answers).map(([qId, val]) => ({
      question_id: Number(qId),
      value: val,
    }));

    try {
      await api.post('/answers/batch', {
        participant_id: participant.id,
        answers: answersList,
        estado_evaluacion: newStatus || (participant.estado_evaluacion === 'completado' ? 'completado' : 'en_progreso'),
      });
      setSuccess('Respuestas guardadas exitosamente.');
      if (newStatus) {
        setParticipant((prev) => prev ? { ...prev, estado_evaluacion: newStatus } : null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar las respuestas.');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStructure = (): QuestionnaireStructure | null => {
    switch (activeTab) {
      case 'datos_generales':
        return structDG;
      case 'intralaboral':
        return structIntra;
      case 'extralaboral':
        return structExtra;
      case 'estres':
        return structEstres;
      default:
        return null;
    }
  };

  const currentStruct = getCurrentStructure();

  // Extract all questions for active questionnaire
  const getQuestionsList = (struct: QuestionnaireStructure | null): Question[] => {
    if (!struct) return [];
    if (struct.secciones) {
      return struct.secciones.flatMap((s) => s.preguntas);
    }
    return struct.preguntas || [];
  };

  const activeQuestions = getQuestionsList(currentStruct);
  const answeredActiveCount = activeQuestions.filter((q) => q.db_id && answers[q.db_id] !== undefined && answers[q.db_id] !== '').length;
  const activeProgressPercent = activeQuestions.length > 0 ? Math.round((answeredActiveCount / activeQuestions.length) * 100) : 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/participants')}>
          <ArrowLeft size={18} />
          Volver a Participantes
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => saveAnswers('en_progreso')} disabled={saving}>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Borrador'}
          </button>
          <button className="btn btn-primary" onClick={() => saveAnswers('completado')} disabled={saving}>
            <CheckCircle2 size={18} />
            Marcar como Completado
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Participant Info Banner */}
      {participant && (
        <div className="card" style={{ marginBottom: '20px', padding: '20px 24px', background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  {participant.nombres} {participant.apellidos}
                </h2>
                <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 700 }}>
                  Cédula: {participant.cedula}
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: participant.tipo_forma === 'A' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                    color: participant.tipo_forma === 'A' ? '#c084fc' : '#f472b6',
                    fontWeight: 700,
                  }}
                >
                  Forma {participant.tipo_forma || 'A'}
                </span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
                Empresa: <strong style={{ color: '#e2e8f0' }}>{participant.empresa_nombre}</strong> | Evaluación: <strong style={{ color: '#e2e8f0' }}>{participant.evaluacion_nombre}</strong>
              </div>
            </div>

            <div>
              <span
                className={`badge ${
                  participant.estado_evaluacion === 'completado'
                    ? 'badge-success'
                    : participant.estado_evaluacion === 'en_progreso'
                    ? 'badge-active'
                    : 'badge-inactive'
                }`}
                style={{ fontSize: '0.9rem', padding: '6px 14px' }}
              >
                Estado: {participant.estado_evaluacion}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', overflowX: 'auto' }}>
        <button
          className={`btn ${activeTab === 'datos_generales' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('datos_generales')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          1. Datos Generales
        </button>

        <button
          className={`btn ${activeTab === 'intralaboral' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('intralaboral')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          2. Intralaboral (Forma {participant?.tipo_forma || 'A'})
        </button>

        <button
          className={`btn ${activeTab === 'extralaboral' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('extralaboral')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          3. Extralaboral
        </button>

        <button
          className={`btn ${activeTab === 'estres' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('estres')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          4. Estrés
        </button>
      </div>

      {/* Active Questionnaire Container */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando cuestionario oficial...
        </div>
      ) : currentStruct ? (
        <div className="card">
          <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', pb: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{currentStruct.nombre}</h3>
            {currentStruct.instrucciones && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {currentStruct.instrucciones}
              </p>
            )}

            {/* Progress bar */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                <span>Progreso en esta sección</span>
                <span>
                  {answeredActiveCount} de {activeQuestions.length} respondidas ({activeProgressPercent}%)
                </span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${activeProgressPercent}%`,
                    backgroundColor: activeProgressPercent === 100 ? '#10b981' : '#3b82f6',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Render Sections or Flat Questions */}
          {currentStruct.secciones ? (
            currentStruct.secciones.map((sec, secIdx) => (
              <div key={secIdx} style={{ marginBottom: '32px' }}>
                <h4
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: '#60a5fa',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                  }}
                >
                  {sec.nombre}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sec.preguntas.map((q) => (
                    <QuestionRow
                      key={q.id}
                      question={q}
                      scale={currentStruct.escala_respuesta}
                      currentValue={q.db_id ? answers[q.db_id] || '' : ''}
                      onChange={(val) => q.db_id && handleAnswerChange(q.db_id, val)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentStruct.preguntas?.map((q) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  scale={currentStruct.escala_respuesta}
                  currentValue={q.db_id ? answers[q.db_id] || '' : ''}
                  onChange={(val) => q.db_id && handleAnswerChange(q.db_id, val)}
                />
              ))}
            </div>
          )}

          {/* Navigation Controls bottom */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (activeTab === 'intralaboral') setActiveTab('datos_generales');
                else if (activeTab === 'extralaboral') setActiveTab('intralaboral');
                else if (activeTab === 'estres') setActiveTab('extralaboral');
              }}
              disabled={activeTab === 'datos_generales'}
            >
              <ChevronLeft size={18} />
              Sección Anterior
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                saveAnswers();
                if (activeTab === 'datos_generales') setActiveTab('intralaboral');
                else if (activeTab === 'intralaboral') setActiveTab('extralaboral');
                else if (activeTab === 'extralaboral') setActiveTab('estres');
              }}
            >
              Guardar y Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Component for a Single Question Row
interface QuestionRowProps {
  question: Question;
  scale?: { valor: number; etiqueta: string }[];
  currentValue: string;
  onChange: (val: string) => void;
}

const QuestionRow: React.FC<QuestionRowProps> = ({ question, scale, currentValue, onChange }) => {
  const optionsToRender = question.opciones
    ? question.opciones.map((opt: any) =>
        typeof opt === 'string'
          ? { valor: opt, etiqueta: opt }
          : { valor: opt.valor !== undefined ? String(opt.valor) : opt.etiqueta, etiqueta: opt.etiqueta }
      )
    : scale
    ? scale.map((s) => ({ valor: String(s.valor), etiqueta: s.etiqueta }))
    : [];

  const isAnswered = currentValue !== undefined && currentValue !== '';

  return (
    <div
      style={{
        padding: '16px 20px',
        borderRadius: '8px',
        backgroundColor: isAnswered ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.3)',
        borderLeft: isAnswered ? '4px solid #10b981' : '4px solid #475569',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '12px', color: '#f1f5f9', lineHeight: 1.4 }}>
        <span style={{ fontWeight: 700, color: '#94a3b8', marginRight: '8px' }}>{question.id}.</span>
        {question.texto}
      </div>

      {optionsToRender.length > 0 ? (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {optionsToRender.map((opt, idx) => (
            <label
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: currentValue === String(opt.valor) ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: currentValue === String(opt.valor) ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                color: currentValue === String(opt.valor) ? '#60a5fa' : '#cbd5e1',
                fontSize: '0.88rem',
                fontWeight: currentValue === String(opt.valor) ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name={`q_${question.id}`}
                value={String(opt.valor)}
                checked={currentValue === String(opt.valor)}
                onChange={() => onChange(String(opt.valor))}
                style={{ cursor: 'pointer' }}
              />
              {opt.etiqueta}
            </label>
          ))}
        </div>
      ) : (
        <div>
          <input
            type="text"
            className="form-control"
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ingrese la respuesta..."
            style={{ maxWidth: '400px' }}
          />
        </div>
      )}
    </div>
  );
};
