import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import logoIcon from '../assets/tenna_logo.webp';
import ThemeToggle from './ThemeToggle.jsx';
import { limparSessao, request } from '../services/api.js';

// Mesmos ícones da sidebar do estudante, para as duas áreas terem a mesma identidade.
const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'home' },
  { to: '/admin/conteudos', label: 'Conteúdos', icon: 'book' },
  { to: '/admin/simulados', label: 'Simulados', icon: 'check' },
  { to: '/admin/provas', label: 'Provas anteriores', icon: 'file' },
  { to: '/admin/cronogramas', label: 'Cronogramas', icon: 'target' },
  { to: '/admin/calendario', label: 'Calendário', icon: 'calendar' },
  { to: '/admin/flashcards', label: 'FlashCards', icon: 'layers' },
  { to: '/admin/usuarios', label: 'Usuários', icon: 'user' },
];

const ICONS = {
  home: <path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" />,
  book: <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17ZM5 4.5v17M9 6h7M9 10h7M9 14h5" />,
  check: <path d="M5 5h14v14H5V5Zm3.5 7 2.5 2.5L16 9" />,
  file: <path d="M7 3h7l5 5v13H7V3Zm6 0v5h5M9 12h6M9 16h6" />,
  target: <path d="M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 10a2 2 0 1 0 2 2" />,
  calendar: <path d="M4 9h16M7 3v4M17 3v4M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />,
  eye: <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function AdminSidebar({ mobileOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const fecharRef = useRef(null);
  const [saindo, setSaindo] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('tenna_admin_sidebar_collapsed') === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('tenna_admin_sidebar_collapsed', String(collapsed)); }
    catch { /* Mantém a preferência durante a sessão. */ }
  }, [collapsed]);

  useEffect(() => {
    if (mobileOpen) fecharRef.current?.focus();
  }, [mobileOpen]);

  const abrirVisaoEstudante = () => {
    sessionStorage.setItem('etecamp_admin_preview', 'true');
    onClose();
    navigate('/home');
  };

  // Mesmo fluxo do "Sair da conta" do perfil do estudante:
  // encerra a sessão no servidor (se possível) e sempre limpa o login local.
  const sair = async () => {
    if (saindo) return;
    setSaindo(true);

    try {
      const token = localStorage.getItem('etecamp_token') || localStorage.getItem('token');
      const usuarioSalvo = localStorage.getItem('etecamp_usuario');
      const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;

      if (usuario?.id && token) {
        await request(`/sessoes/sair/${usuario.id}`, { method: 'PUT' });
      }
    } catch (erro) {
      console.error('Erro ao encerrar sessão:', erro);
    } finally {
      limparSessao();
      onClose();
      navigate('/login', { replace: true });
    }
  };

  return (
    <aside
      id="tenna-admin-nav"
      aria-label="Menu administrativo"
      className={`sidebar admin-sidebar admin-sidebar--student ${collapsed ? 'admin-sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
    >
      <div className="sidebar-brand admin-sidebar-brand">
        <button type="button" className="tenna-mobile-drawer-close" ref={fecharRef} onClick={onClose} aria-label="Fechar menu">×</button>

        <div className="admin-sidebar-brand-shell">
          <img src={logoIcon} alt="Tenna" className="admin-sidebar-logo" />
        </div>
        <button
          type="button"
          className="sidebar-collapse-btn admin-sidebar-collapse-btn"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expandir menu' : 'Diminuir menu'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expandir menu' : 'Diminuir menu'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={collapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'} />
          </svg>
        </button>
      </div>

      <nav className="admin-sidebar-navigation" aria-label="Navegação administrativa">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/admin/conteudos'}
            onClick={onClose}
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={({ isActive }) => `sidebar-link admin-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="admin-sidebar-icon"><Icon name={item.icon} /></span>
            <span className="label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-theme-toggle-wrap">
          <ThemeToggle className="admin-theme-toggle" />
        </div>

        <div className="admin-preview-card">
          <button
            type="button"
            className="sidebar-link admin-preview-link"
            onClick={abrirVisaoEstudante}
            title="Visualizar o site como estudante"
            aria-label={collapsed ? 'Visualizar como estudante' : undefined}
          >
            <span className="admin-preview-icon"><Icon name="eye" /></span>
            <span className="label">Visualizar como estudante</span>
          </button>
        </div>

        <div className="admin-logout-card">
          <button
            type="button"
            className="sidebar-link admin-logout-link"
            onClick={sair}
            disabled={saindo}
            title="Sair da conta"
            aria-label="Sair da conta"
          >
            <span className="admin-preview-icon"><Icon name="logout" /></span>
            <span className="label">{saindo ? 'Saindo...' : 'Sair'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
