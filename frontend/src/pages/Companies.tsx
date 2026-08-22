import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface Company {
  id: number;
  nombre: string;
  NIT: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form State
  const [nombre, setNombre] = useState<string>('');
  const [nit, setNit] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [estado, setEstado] = useState<string>('activo');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/companies/');
      setCompanies(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar las empresas.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCompany(null);
    setNombre('');
    setNit('');
    setEmail('');
    setTelefono('');
    setDireccion('');
    setEstado('activo');
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setNombre(company.nombre);
    setNit(company.NIT);
    setEmail(company.email || '');
    setTelefono(company.telefono || '');
    setDireccion(company.direccion || '');
    setEstado(company.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      nombre,
      NIT: nit,
      email: email || null,
      telefono: telefono || null,
      direccion: direccion || null,
      estado,
    };

    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany.id}`, payload);
        setSuccess('Empresa actualizada exitosamente.');
      } else {
        await api.post('/companies/', payload);
        setSuccess('Empresa creada exitosamente.');
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar la empresa.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta empresa? Esta acción no se puede deshacer.')) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/companies/${id}`);
      setSuccess('Empresa eliminada exitosamente.');
      fetchCompanies();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar la empresa.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Empresas</h1>
          <p className="page-subtitle">Gestiona las organizaciones registradas en la plataforma</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Registrar Empresa
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

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando empresas...
          </div>
        ) : companies.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay empresas registradas. Haz clic en "Registrar Empresa" para comenzar.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>NIT</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td style={{ fontWeight: 600 }}>{company.nombre}</td>
                    <td>{company.NIT}</td>
                    <td>{company.email || '-'}</td>
                    <td>{company.telefono || '-'}</td>
                    <td>
                      <span className={`badge ${company.estado === 'activo' ? 'badge-active' : 'badge-inactive'}`}>
                        {company.estado}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => openEditModal(company)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleDelete(company.id)}
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
              <h2 className="modal-title">{editingCompany ? 'Editar Empresa' : 'Registrar Nueva Empresa'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre de la Empresa *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIT *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={nit} 
                  onChange={(e) => setNit(e.target.value)} 
                  placeholder="e.g. 900.123.456-7"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono de Contacto</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dirección Física</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={direccion} 
                  onChange={(e) => setDireccion(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select 
                  className="form-control" 
                  value={estado} 
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCompany ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
