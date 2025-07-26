import { Link, NavLink } from 'react-router-dom';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { Button } from '@/components/ui/button';
import { Home, LogOut, ExternalLink, LayoutDashboard, Users, KanbanSquare, Building2, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AdminHeader = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const navLinkClasses = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors';
  const activeNavLinkClasses = 'bg-primary text-primary-foreground';
  const inactiveNavLinkClasses = 'text-muted-foreground hover:bg-muted';

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Main Nav */}
          <div className="flex items-center gap-2 sm:gap-8">
            <Link to="/admin/properties" className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity">
              <Home className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              <span className="text-lg sm:text-2xl font-montserrat font-bold text-primary">ImobFlow</span>
            </Link>
            
            {/* Desktop Navigation */}
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
                to="/admin/settings"
                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
              >
                <Settings className="w-4 h-4" />
                Ajustes
              </NavLink>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile: Only Notification */}
            <div className="md:hidden">
              <NotificationBell />
            </div>
            
            {/* Desktop: All buttons */}
            <div className="hidden md:flex items-center gap-2">
              <NotificationBell />
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
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
            
            {/* Mobile: Logout button only */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-primary/10 hover:text-primary p-2">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
