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
      <div className="cardList" aria-live="polite">
        {Object.entries(grouped).map(([type, accounts]) => (
          <article className="infoCard" key={type}>
            <div className="infoHeader">
              <span className="resultLabel">{typeAccountLabel[type] || type}</span>
              <span className="pill neutral">{accounts.length} contas</span>
            </div>
            <div className="cardList">
              {accounts.map((acc) => (
                <div key={acc.id} className={`accountRow ${acc.isActive ? "" : "accountInactive"}`}>
                  <div>
                    <p className="rowTitle">{acc.displayName}</p>
                    <p className="rowMeta">{acc.id}</p>
                  </div>
                  <span className={`pill ${acc.isActive ? "success" : "warning"}`}>
                    {acc.isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
