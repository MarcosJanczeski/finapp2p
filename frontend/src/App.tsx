import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./App.css";

function App() {
  const [menuOpen, setMenuOpen] = useState(false); // (pt: menuAberto)
  const closeMenu = () => setMenuOpen(false); // (pt: fecharMenu)

  return (
    <div className="appShell">
      <header className="appHeader">
        <p className="appSubtitle">Mobile-first: lançamentos rápidos com dupla entrada automática.</p>
        <h1 className="appTitle">Finanças 2P — React + TS</h1>
        <button type="button" className="secondaryButton" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
          {menuOpen ? "Fechar menu" : "Menu"}
        </button>
        <nav className={`navBar ${menuOpen ? "open" : ""}`} aria-label="Navegação principal">
          <NavLink
            to="/"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            Overview
          </NavLink>
          <NavLink
            to="/new"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            Novo
          </NavLink>
          <NavLink
            to="/journal"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            Lançamentos
          </NavLink>
          <NavLink
            to="/accounts"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            Plano
          </NavLink>
          <NavLink
            to="/balances"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            Saldos
          </NavLink>
          <NavLink
            to="/recurrences"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            Recorrências
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
