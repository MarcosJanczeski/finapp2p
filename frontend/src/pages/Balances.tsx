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
      <div className="resultBox" aria-live="polite">
        <span className="resultLabel">Saldos</span>
        {entries.map(({ acc, net, totals }) => (
          <div key={acc.id} className={`accountGroup ${acc.isActive ? "" : "accountInactive"}`}>
            <span className="resultLabel">
              {acc.displayName} {acc.isActive ? "" : <span className="inactiveTag">(inativa)</span>}
            </span>
            <div>
              Débito: {formatCurrencyBRL(totals.debit)} | Crédito: {formatCurrencyBRL(totals.credit)}
            </div>
            <div className={net >= 0 ? "textPositive" : "textNegative"}>
              Saldo (débito - crédito): {formatCurrencyBRL(net)}
            </div>
          </div>
        ))}
        {!entries.length && <div>Nenhum saldo ainda.</div>}
      </div>
    </section>
  );
}
