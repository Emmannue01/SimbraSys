import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Package, LogOut, LayoutGrid, FileText, RotateCw, BarChart2, Users, Menu, X } from 'lucide-react';
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

export default function Navbar() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleLinkClick = () => {
    if (isOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const linkClass = "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkClass = "bg-orange-700 text-white";
  const inactiveLinkClass = "text-orange-100 hover:bg-orange-700 hover:text-white";

  return (
    <header className="bg-orange-600 shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo y Título */}
          <NavLink to="/pagina-principal" className="flex items-center gap-3">
            <Package className="h-8 w-8 text-white" />
            <h1 className="text-xl font-bold text-white hidden sm:block">CIMBRA-SYS</h1>
          </NavLink>

          {/* Navegación para Desktop */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map(({ to, text, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                <Icon size={18} />
                <span>{text}</span>
              </NavLink>
            ))}
          </nav>

          {/* Botón de Logout y Menú Móvil */}
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className={`${inactiveLinkClass} ${linkClass} hidden lg:flex`}>
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-white hover:bg-orange-700 p-2 rounded-md">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable para Móvil */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden px-2 pt-2 pb-4 space-y-1 border-t border-orange-500">
          {navLinks.map(({ to, text, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={handleLinkClick} className={({ isActive }) => `block ${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
              <Icon size={20} />
              <span>{text}</span>
            </NavLink>
          ))}
          <button onClick={handleLogout} className={`w-full block ${linkClass} ${inactiveLinkClass}`}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      )}
    </header>
  );
}