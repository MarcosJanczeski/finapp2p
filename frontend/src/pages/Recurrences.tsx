import { formatCurrencyBRL, useFinance } from "../finance-context";

function groupByMonth(occurrences: ReturnType<typeof useFinance>["upcomingRecurrences"]) {
  return occurrences.reduce<Record<string, typeof occurrences>>((acc, occ) => {
    const key = occ.date.slice(0, 7); // YYYY-MM
    acc[key] = acc[key] || [];
    acc[key].push(occ);
    return acc;
  }, {});
}

export function RecurrencesPage() {
  const { recurrences, upcomingRecurrences, accountPlan } = useFinance();
  const grouped = groupByMonth(upcomingRecurrences);

  return (
    <section className="ctaCard">
      <h2 className="ctaTitle">Recorrências & Parcelas</h2>
      <ul className="ctaList">
        <li>Resumo dos próximos meses para visualizar compromissos.</li>
        <li>Tipos: receita ou despesa; mapeia partidas automaticamente.</li>
      </ul>

      <div className="resultBox">
        <span className="resultLabel">Próximos meses</span>
        {Object.entries(grouped).map(([month, occs]) => {
          const total = occs.reduce((sum, occ) => sum + (occ.type === "expense" ? -occ.amount : occ.amount), 0);
          return (
            <div key={month} className="accountGroup">
              <span className="resultLabel">
                {month} — saldo previsto: {formatCurrencyBRL(total)}
              </span>
              <ul className="bulletList">
                {occs.map((occ) => {
                  const cat = accountPlan.find((a) => a.id === occ.categoryAccountId)?.displayName ?? occ.categoryAccountId;
                  const contra =
                    accountPlan.find((a) => a.id === occ.counterAccountId)?.displayName ?? occ.counterAccountId;
                  const toneClass = occ.type === "expense" ? "textExpense" : "textIncome";
                  return (
                    <li key={occ.id} className={toneClass}>
                      {occ.date}: {occ.description} — {formatCurrencyBRL(occ.amount)} ({cat} ↔ {contra})
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {!upcomingRecurrences.length && <div>Sem recorrências configuradas.</div>}
      </div>

      <div className="resultBox">
        <span className="resultLabel">Recorrências cadastradas</span>
        <ul className="bulletList">
          {recurrences.map((rec) => {
            const cat = accountPlan.find((a) => a.id === rec.categoryAccountId)?.displayName ?? rec.categoryAccountId;
            const contra =
              accountPlan.find((a) => a.id === rec.counterAccountId)?.displayName ?? rec.counterAccountId;
            const toneClass = rec.type === "expense" ? "textExpense" : "textIncome";
            return (
              <li key={rec.id} className={toneClass}>
                {rec.description} — {formatCurrencyBRL(rec.amount)} todo dia {rec.day} ({cat} ↔ {contra})
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
