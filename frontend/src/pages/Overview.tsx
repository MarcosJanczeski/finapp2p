import { Link } from "react-router-dom";
import {
  accountPlan,
  freeCashFlow,
  formatCurrencyBRL,
  monthlyCapacity,
  targetSavings,
  totalFixedExpenses,
  useFinance,
} from "../finance-context";

export function OverviewPage() {
  const { journalEntries, lastSavedAt, balances } = useFinance();
  const recent = [...journalEntries].slice(-5).reverse(); // (pt: ultimosLancamentos)

  return (
    <section className="ctaCard">
      <h2 className="ctaTitle">Overview</h2>
      <div className="navBar" style={{ marginTop: "0.25rem" }}>
        <Link className="secondaryButton" to="/new">
          Novo lançamento
        </Link>
        <Link className="secondaryButton ghost" to="/journal">
          Ver lançamentos
        </Link>
      </div>

      <div className="cardList" aria-live="polite">
        <div className="infoCard">
          <div className="infoHeader">
            <span className="resultLabel">Resumo rápido</span>
            <span className="pill neutral">Base mensal</span>
          </div>
          <div className="textIncome">Capacidade mensal: {formatCurrencyBRL(monthlyCapacity)}</div>
          <div className="textExpense">Despesa fixa total: {formatCurrencyBRL(totalFixedExpenses)}</div>
          <div className={freeCashFlow >= 0 ? "textPositive" : "textNegative"}>
            Fluxo de caixa livre: {formatCurrencyBRL(freeCashFlow)}
          </div>
          <div className="textPositive">Meta de poupança (3%): {formatCurrencyBRL(targetSavings)}</div>
        </div>

        <div className="infoCard">
          <div className="infoHeader">
            <span className="resultLabel">Últimos lançamentos</span>
            <Link className="pill neutral" to="/journal">
              Ver todos
            </Link>
          </div>
          {recent.length === 0 && <div>Nenhum lançamento ainda.</div>}
          <div className="entryList">
            {recent.map((entry) => {
              const debitTotal = entry.lines.reduce((sum, line) => sum + line.debit, 0);
              const creditTotal = entry.lines.reduce((sum, line) => sum + line.credit, 0);
              const isBalanced = debitTotal === creditTotal;
              return (
                <article className="entryCard" key={entry.id}>
                  <div className="entryHeader">
                    <div>
                      <p className="recTitle">{entry.description}</p>
                      <p className="recMeta">
                        {entry.id} • {entry.lines.length} linhas • Total: {formatCurrencyBRL(debitTotal)}
                      </p>
                    </div>
                    <span className={`pill ${isBalanced ? "success" : "danger"}`}>
                      {isBalanced ? "Balanceado" : "Diferença"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="footerNote">
            {lastSavedAt ? `Último salvamento: ${new Date(lastSavedAt).toLocaleString("pt-BR")}` : "Ainda não salvo"}
          </div>
        </div>

        <div className="infoCard">
          <div className="infoHeader">
            <span className="resultLabel">Saldo de caixa rápido</span>
            <span className="pill neutral">Ativos</span>
          </div>
          <div className="cardList">
            {accountPlan
              .filter((acc) => balances.has(acc.id) && acc.type === "Asset")
              .map((acc) => {
                const totals = balances.get(acc.id)!;
                const net = totals.debit - totals.credit;
                return (
                  <div key={acc.id} className={`accountRow ${acc.isActive ? "" : "accountInactive"}`}>
                    <div>
                      <p className="rowTitle">{acc.displayName}</p>
                      <p className="rowMeta">Saldo: {formatCurrencyBRL(net)}</p>
                    </div>
                    <span className={`pill ${net >= 0 ? "success" : "danger"}`}>
                      {net >= 0 ? "Positivo" : "Negativo"}
                    </span>
                  </div>
                );
              })}
          </div>
          {!Array.from(balances.keys()).some((id) => accountPlan.find((a) => a.id === id)?.type === "Asset") && (
            <div>Nenhum saldo ainda.</div>
          )}
        </div>
      </div>
    </section>
  );
}
