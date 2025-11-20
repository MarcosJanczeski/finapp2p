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
      <div className="navBar" style={{ marginTop: "0.5rem" }}>
        <Link className="secondaryButton" to="/new">
          Novo lançamento
        </Link>
        <Link className="secondaryButton ghost" to="/journal">
          Ver lançamentos
        </Link>
      </div>

      <div className="resultBox" aria-live="polite">
        <span className="resultLabel">Resumo rápido</span>
        <div className="textIncome">Capacidade mensal: {formatCurrencyBRL(monthlyCapacity)}</div>
        <div className="textExpense">Despesa fixa total: {formatCurrencyBRL(totalFixedExpenses)}</div>
        <div className={freeCashFlow >= 0 ? "textPositive" : "textNegative"}>
          Fluxo de caixa livre: {formatCurrencyBRL(freeCashFlow)}
        </div>
        <div className="textPositive">Meta de poupança (3%): {formatCurrencyBRL(targetSavings)}</div>
      </div>

      <div className="resultBox">
        <span className="resultLabel">Últimos lançamentos</span>
        {recent.length === 0 && <div>Nenhum lançamento ainda.</div>}
        {recent.map((entry) => {
          const debitTotal = entry.lines.reduce((sum, line) => sum + line.debit, 0);
          const creditTotal = entry.lines.reduce((sum, line) => sum + line.credit, 0);
          const isBalanced = debitTotal === creditTotal;
          return (
            <div className="accountGroup" key={entry.id}>
              <span className="resultLabel">
                {entry.id} — {entry.description}
              </span>
              <div className={isBalanced ? "textPositive" : "textNegative"}>
                {isBalanced ? "Balanceado" : "Não balanceado"} ({formatCurrencyBRL(debitTotal)} vs{" "}
                {formatCurrencyBRL(creditTotal)})
              </div>
            </div>
          );
        })}
        <div className="footerNote">
          {lastSavedAt ? `Último salvamento: ${new Date(lastSavedAt).toLocaleString("pt-BR")}` : "Ainda não salvo"}
        </div>
      </div>

      <div className="resultBox">
        <span className="resultLabel">Saldo de caixa rápido</span>
        {accountPlan
          .filter((acc) => balances.has(acc.id) && acc.type === "Asset")
          .map((acc) => {
            const totals = balances.get(acc.id)!;
            const net = totals.debit - totals.credit;
            return (
              <div key={acc.id} className={`accountGroup ${acc.isActive ? "" : "accountInactive"}`}>
                <span className="resultLabel">
                  {acc.displayName} {acc.isActive ? "" : <span className="inactiveTag">(inativa)</span>}
                </span>
                <div className={net >= 0 ? "textPositive" : "textNegative"}>{formatCurrencyBRL(net)}</div>
              </div>
            );
          })}
        {!Array.from(balances.keys()).some((id) => accountPlan.find((a) => a.id === id)?.type === "Asset") && (
          <div>Nenhum saldo ainda.</div>
        )}
      </div>
    </section>
  );
}
