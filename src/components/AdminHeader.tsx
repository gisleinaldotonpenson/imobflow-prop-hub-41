import { Link, NavLink, useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { Button } from '@/components/ui/button';
import { Home, LogOut, ExternalLink, LayoutDashboard, Users, KanbanSquare, Building2, Settings, Brain } from 'lucide-react';

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const navLinkClasses = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors';
  const activeNavLinkClasses = 'bg-primary text-primary-foreground';
  const inactiveNavLinkClasses = 'text-muted-foreground hover:bg-muted';

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/admin/properties" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Home className="w-7 h-7 text-primary" />
              <span className="text-2xl font-montserrat font-bold text-primary">ImobFlow</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <NavLink 
                to="/admin/dashboard"
                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink 
                to="/admin/properties" 
                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
              >
                <Building2 className="w-4 h-4" />
                Imóveis
              </NavLink>
              <NavLink 
                to="/admin/crm" 
                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
              >
                <KanbanSquare className="w-4 h-4" />
                CRM
              </NavLink>
              <NavLink 
                to="/admin/contacts" 
                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
              >
                <Users className="w-4 h-4" />
                Contatos
              </NavLink>
              <NavLink 
                to="/admin/ai-chat" 
                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
              >
                <Brain className="w-4 h-4" />
                Chat IA
              </NavLink>
              <div className="flex items-center">
                <NavLink 
                  to="/admin/settings"
                  className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses} hover:bg-primary/10 hover:text-primary`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden md:inline">Ajustes</span>
                </NavLink>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <NotificationBell />
              </div>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Site
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-primary/10 hover:text-primary">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
