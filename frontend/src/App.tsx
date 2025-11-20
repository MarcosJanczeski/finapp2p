import { NavLink, Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="appShell">
      <header className="appHeader">
        <p className="appSubtitle">
          Mobile-first para lançamentos rápidos com dupla entrada automática.
        </p>
        <h1 className="appTitle">Finanças 2P — React + TS</h1>
        <nav className="navBar" aria-label="Navegação">
          <NavLink to="/" className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}>
            Overview
          </NavLink>
          <NavLink to="/new" className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}>
            Novo
          </NavLink>
          <NavLink
            to="/journal"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
          >
            Lançamentos
          </NavLink>
          <NavLink
            to="/accounts"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
          >
            Plano
          </NavLink>
          <NavLink
            to="/balances"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
          >
            Saldos
          </NavLink>
          <NavLink
            to="/recurrences"
            className={({ isActive }: { isActive: boolean }) => `navLink ${isActive ? "active" : ""}`}
          >
            Recorrências
          </NavLink>
        </nav>
      </header>
      <Outlet />
      <footer className="bottomNav" aria-label="Navegação inferior">
        <NavLink to="/" className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}>
          Overview
        </NavLink>
        <NavLink
          to="/new"
          className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}
        >
          Novo
        </NavLink>
        <NavLink
          to="/journal"
          className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}
        >
          Lançamentos
        </NavLink>
        <NavLink
          to="/balances"
          className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}
        >
          Saldos
        </NavLink>
        <NavLink
          to="/recurrences"
          className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}
        >
          Recorrências
        </NavLink>
      </footer>
    </div>
  );
}

export default App;
