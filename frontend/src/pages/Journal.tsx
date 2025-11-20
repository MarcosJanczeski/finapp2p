import { formatCurrencyBRL, useFinance } from "../finance-context";

export function JournalPage() {
  const { journalEntries, accountPlan } = useFinance();

  return (
    <section className="ctaCard">
      <h2 className="ctaTitle">Lançamentos</h2>
      <div className="entryList" aria-live="polite">
        {journalEntries.length === 0 && <div>Nenhum lançamento ainda.</div>}
        {journalEntries.map((entry) => {
          const debitTotal = entry.lines.reduce((sum, line) => sum + line.debit, 0);
          const creditTotal = entry.lines.reduce((sum, line) => sum + line.credit, 0);
          const isBalanced = debitTotal === creditTotal;
          const diff = debitTotal - creditTotal;
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
              {!isBalanced && (
                <p className="entryDiff textNegative">
                  Diferença: {formatCurrencyBRL(diff)} (débitos vs créditos)
                </p>
              )}
              <ul className="entryLines">
                {entry.lines.map((line, idx) => {
                  const account = accountPlan.find((acc) => acc.id === line.accountId);
                  const name = account ? account.displayName : line.accountId;
                  return (
                    <li key={`${entry.id}-${idx}`} className="entryLine">
                      <div>
                        <p className="entryAccount">{name}</p>
                        <p className="recMeta">Conta {line.accountId}</p>
                      </div>
                      <div className="entryAmounts">
                        <span className="badge debit">Débito: {formatCurrencyBRL(line.debit)}</span>
                        <span className="badge credit">Crédito: {formatCurrencyBRL(line.credit)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
