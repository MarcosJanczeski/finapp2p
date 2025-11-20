import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import { BalancesPage } from "./pages/Balances";
import { JournalPage } from "./pages/Journal";
import { NewEntryPage } from "./pages/NewEntry";
import { OverviewPage } from "./pages/Overview";
import { AccountsPage } from "./pages/Accounts";

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
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/new" element={<NewEntryPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/balances" element={<BalancesPage />} />
      </Routes>
    </div>
  );
}

export default App;
