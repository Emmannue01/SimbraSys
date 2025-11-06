import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Package, LogOut, LayoutGrid, FileText, RotateCw, BarChart2, X, Users } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from './components/firebase';

const navLinks = [
  { to: "/pagina-principal", text: "Inventario", icon: LayoutGrid },
  { to: "/clientes", text: "Clientes", icon: Users },
  { to: "/contratos", text: "Contratos", icon: FileText },
  { to: "/devoluciones", text: "Devoluciones", icon: RotateCw },
  { to: "/reportes", text: "Reportes", icon: BarChart2 },
];

export default function Navbar({ isOpen, setIsOpen }) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleLinkClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const linkClass = "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkClass = "bg-amber-100 text-amber-800";
  const inactiveLinkClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-amber-800" />
          <h1 className="text-xl font-bold text-gray-800">CIMBRA-SYS</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navLinks.map(({ to, text, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={handleLinkClick} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
            <Icon size={20} />
            <span>{text}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200">
        <button onClick={handleLogout} className={`${linkClass} ${inactiveLinkClass} w-full` }>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}