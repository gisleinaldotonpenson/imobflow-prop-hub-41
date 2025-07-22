import { LayoutDashboard, Building, KanbanSquare, Users, Settings, Brain } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Imóveis",
    to: "/admin/properties",
    icon: <Building className="w-5 h-5" />,
  },
  {
    label: "CRM",
    to: "/admin/crm",
    icon: <KanbanSquare className="w-5 h-5" />,
  },
  {
    label: "Contatos",
    to: "/admin/contacts",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Chat IA",
    to: "/admin/ai-chat",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    label: "Ajustes",
    to: "/admin/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function AdminBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-card flex justify-around items-center h-16 animate-fade-in">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center text-xs font-montserrat transition-colors px-2 py-1 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
} 