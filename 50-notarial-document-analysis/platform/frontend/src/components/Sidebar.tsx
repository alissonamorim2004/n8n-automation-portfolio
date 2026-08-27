import { LayoutDashboard, FileText, Tags, Users, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { signOut, profile } = useAuth();

  const allMenuItems = [
    { id: 'token-usage', label: 'Uso de Tokens', icon: Activity, adminOnly: true },
    { id: 'analysis', label: 'Análises', icon: FileText, adminOnly: false },
    { id: 'analysis-types', label: 'Tipos de Análise', icon: Tags, adminOnly: true },
    { id: 'users', label: 'Usuários', icon: Users, adminOnly: true },
  ];

  const menuItems = allMenuItems.filter(
    item => !item.adminOnly || profile?.role === 'admin'
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white w-64 shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Document AI</h1>
            <p className="text-xs text-slate-400">Analysis Platform</p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 overflow-y-auto">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="mb-4 px-4 py-3 bg-slate-700/50 rounded-lg">
          <p className="text-sm font-medium text-slate-300">{profile?.full_name}</p>
          <p className="text-xs text-slate-400">{profile?.email}</p>
          {profile?.role === 'admin' && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
              Admin
            </span>
          )}
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}
