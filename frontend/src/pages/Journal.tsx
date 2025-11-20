import { formatCurrencyBRL, useFinance } from "../finance-context";

export function JournalPage() {
  const { journalEntries, accountPlan } = useFinance();

  return (
    <section className="ctaCard">
      <h2 className="ctaTitle">Lançamentos</h2>
      <div className="resultBox" aria-live="polite">
        <span className="resultLabel">Lista completa</span>
        {journalEntries.length === 0 && <div>Nenhum lançamento ainda.</div>}
        {journalEntries.map((entry) => {
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
              <ul className="bulletList">
                {entry.lines.map((line, idx) => {
                  const account = accountPlan.find((acc) => acc.id === line.accountId);
                  const name = account ? account.displayName : line.accountId;
                  return (
                    <li key={`${entry.id}-${idx}`}>
                      {name} — Débito: {formatCurrencyBRL(line.debit)} | Crédito: {formatCurrencyBRL(line.credit)}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
