import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import "./App.css";

type SettingsPanelProps = {
  open: boolean; // (pt: painelAberto)
  onClose: () => void; // (pt: aoFechar)
}; // (pt: PropsPainelConfiguracoes)

function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [userName, setUserName] = useState("Você"); // (pt: nomeUsuario)
  const [defaultCurrency, setDefaultCurrency] = useState("BRL"); // (pt: moedaPadrao)
  const [preferredLanguage, setPreferredLanguage] = useState("pt-BR"); // (pt: idiomaPreferido)
  const [fastMode, setFastMode] = useState(true); // (pt: modoRapido)
  const [dataSync, setDataSync] = useState<"local" | "future-cloud">("local"); // (pt: sincronizacaoDados)

  return (
    <>
      <div
        className={`settingsOverlay ${open ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`settingsPanel ${open ? "open" : ""}`} aria-hidden={!open}>
        <header className="settingsHeader">
          <div>
            <p className="settingsKicker">Perfil & preferências</p>
            <h2 className="settingsTitle">Configurações</h2>
          </div>
          <button type="button" className="headerButton ghost" onClick={onClose} aria-label="Fechar painel">
            ✕
          </button>
        </header>

        <div className="settingsBody">
          <section className="settingsSection">
            <p className="settingsLabel">Perfil</p>
            <div className="formRow">
              <label htmlFor="userName">Nome exibido</label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex.: Ana, Família Silva"
              />
              <p className="inputHint">Usamos no cabeçalho e em relatórios futuros.</p>
            </div>
          </section>

          <section className="settingsSection">
            <p className="settingsLabel">Ferramentas</p>
            <div className="formRow">
              <label htmlFor="currency">Moeda padrão</label>
              <select
                id="currency"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
              >
                <option value="BRL">BRL — Real</option>
                <option value="USD">USD — Dólar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
              <p className="inputHint">Usaremos em saldos e projeções.</p>
            </div>

            <div className="formRow">
              <label htmlFor="language">Idioma</label>
              <select
                id="language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English</option>
                <option value="es-ES">Español</option>
              </select>
              <p className="inputHint">Interface e relatórios seguirão essa escolha.</p>
            </div>
          </section>

          <section className="settingsSection">
            <p className="settingsLabel">Fluxo rápido</p>
            <label className="switchRow">
              <input
                type="checkbox"
                checked={fastMode}
                onChange={(e) => setFastMode(e.target.checked)}
              />
              <span>
                Ativar modo rápido para lançamentos (menos campos, mais presets).
              </span>
            </label>
          </section>

          <section className="settingsSection">
            <p className="settingsLabel">Armazenamento</p>
            <label className="switchRow">
              <input
                type="radio"
                name="dataSync"
                value="local"
                checked={dataSync === "local"}
                onChange={() => setDataSync("local")}
              />
              <span>Salvar apenas no dispositivo (localStorage).</span>
            </label>
            <label className="switchRow">
              <input
                type="radio"
                name="dataSync"
                value="future-cloud"
                checked={dataSync === "future-cloud"}
                onChange={() => setDataSync("future-cloud")}
              />
              <span>Cloud + login (chegará quando ativarmos backend).</span>
            </label>
          </section>

          <div className="settingsSection">
            <p className="inputHint">
              Salvaremos essas preferências quando conectarmos autenticação e sincronização. Por ora
              servem como guia visual para o que vamos priorizar.
            </p>
            <button type="button" className="secondaryButton ghost" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false); // (pt: menuAberto)
  const [settingsOpen, setSettingsOpen] = useState(false); // (pt: configuracoesAbertas)
  const closeMenu = () => setMenuOpen(false); // (pt: fecharMenu)
  const openSettings = () => setSettingsOpen(true); // (pt: abrirConfiguracoes)
  const closeSettings = () => setSettingsOpen(false); // (pt: fecharConfiguracoes)
  const location = useLocation();

  const sections = useMemo(
    () => [
      { path: "/", label: "Overview" },
      { path: "/new", label: "Novo" },
      { path: "/journal", label: "Lançamentos" },
      { path: "/accounts", label: "Plano" },
      { path: "/balances", label: "Saldos" },
      { path: "/recurrences", label: "Recorrências" },
    ],
    [],
  ); // (pt: secoesNavegacao)

  const currentSection =
    sections.find((item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/"))?.label ??
    "Overview"; // (pt: secaoAtual)

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="headerBar">
          <button
            type="button"
            className="headerButton"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <div className="headerTitle">
            Finanças 2P — {currentSection}
          </div>
          <button
            type="button"
            className="headerButton ghost"
            aria-label="Configurações"
            onClick={openSettings}
          >
            ⚙︎
          </button>
        </div>
        <p className="appSubtitle">Mobile-first: lançamentos rápidos com dupla entrada automática.</p>
      </header>
      <SettingsPanel open={settingsOpen} onClose={closeSettings} />
      <Outlet />
      <Link to="/new" className="fab" aria-label="Novo lançamento rápido">
        +
      </Link>
      <nav className="bottomNav" aria-label="Navegação principal">
        <NavLink
          to="/"
          className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          <span className="icon">🏠</span>
          <span>Overview</span>
        </NavLink>
        <NavLink
          to="/journal"
          className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          <span className="icon">📒</span>
          <span>Movs</span>
        </NavLink>
        <NavLink
          to="/recurrences"
          className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          <span className="icon">🔁</span>
          <span>Recor.</span>
        </NavLink>
        <NavLink
          to="/balances"
          className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          <span className="icon">💰</span>
          <span>Saldos</span>
        </NavLink>
        <NavLink
          to="/accounts"
          className={({ isActive }: { isActive: boolean }) => `bottomLink ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          <span className="icon">📂</span>
          <span>Plano</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default App;
