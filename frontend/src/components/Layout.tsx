import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  BarChart3, 
  FileText, 
  Settings,
  Activity
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Activity size={24} />
          <span>Riesgo Psicosocial</span>
        </div>
        
        <nav className="sidebar-menu">
          <NavLink 
            to="/" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/companies" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Building2 size={20} />
            <span>Empresas</span>
          </NavLink>
          
          <NavLink 
            to="/evaluations" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ClipboardList size={20} />
            <span>Evaluaciones</span>
          </NavLink>
          
          <NavLink 
            to="/participants" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Users size={20} />
            <span>Participantes</span>
          </NavLink>
          
          <NavLink 
            to="/results" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={(e) => e.preventDefault()} // Disabled/placeholder for now
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            <BarChart3 size={20} />
            <span>Resultados</span>
          </NavLink>
          
          <NavLink 
            to="/reports" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={(e) => e.preventDefault()} // Disabled/placeholder for now
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            <FileText size={20} />
            <span>Reportes</span>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={(e) => e.preventDefault()} // Disabled/placeholder for now
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            <Settings size={20} />
            <span>Configuración</span>
          </NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Consola de Administración
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--success)', backgroundColor: 'var(--success-bg)', padding: '4px 8px', borderRadius: '50px', fontWeight: 'bold' }}>
              Modo Local
            </span>
          </div>
        </header>
        
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};
