import { formatCurrencyBRL, useFinance } from "../finance-context";

export function BalancesPage() {
  const { accountPlan, balances } = useFinance();

  const entries = accountPlan
    .filter((acc) => balances.has(acc.id))
    .map((acc) => {
      const totals = balances.get(acc.id)!;
      const net = totals.debit - totals.credit;
      return { acc, net, totals };
    });

  return (
    <section className="ctaCard">
      <h2 className="ctaTitle">Saldos por conta</h2>
      <div className="cardList" aria-live="polite">
        {entries.map(({ acc, net, totals }) => (
          <article key={acc.id} className={`infoCard ${acc.isActive ? "" : "accountInactive"}`}>
            <div className="infoHeader">
              <span className="rowTitle">{acc.displayName}</span>
              <span className={`pill ${net >= 0 ? "success" : "danger"}`}>
                {net >= 0 ? "Positivo" : "Negativo"}
              </span>
            </div>
            <p className="rowMeta">{acc.id}</p>
            <div className="entryAmounts">
              <span className="badge debit">Débito: {formatCurrencyBRL(totals.debit)}</span>
              <span className="badge credit">Crédito: {formatCurrencyBRL(totals.credit)}</span>
            </div>
            <div className="rowValue">Saldo (débito - crédito): {formatCurrencyBRL(net)}</div>
          </article>
        ))}
        {!entries.length && <div>Nenhum saldo ainda.</div>}
      </div>
    </section>
  );
}
