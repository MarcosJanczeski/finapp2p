import { accountPlan } from "../finance-context";
import { typeAccountLabel } from "./helpers";

export function AccountsPage() {
  const grouped = accountPlan.reduce<Record<string, typeof accountPlan>>((acc, account) => {
    acc[account.type] = acc[account.type] || [];
    acc[account.type].push(account);
    return acc;
  }, {});

  return (
    <section className="ctaCard">
      <h2 className="ctaTitle">Plano de contas</h2>
      <div className="resultBox" aria-live="polite">
        <span className="resultLabel">Contas por tipo</span>
        {Object.entries(grouped).map(([type, accounts]) => (
          <div className="accountGroup" key={type}>
            <span className="resultLabel">{typeAccountLabel[type] || type}</span>
            <ul className="bulletList">
              {accounts.map((acc) => (
                <li key={acc.id} className={acc.isActive ? "" : "accountInactive"}>
                  <strong>{acc.id}</strong> — {acc.displayName}{" "}
                  {acc.isActive ? "" : <span className="inactiveTag">(inativa)</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
