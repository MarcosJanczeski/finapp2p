import { useState } from "react";
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
  const { recurrences, upcomingRecurrences, accountPlan, addRecurrence } = useFinance();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("5");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [categoryAccountId, setCategoryAccountId] = useState(
    accountPlan.find((a) => a.type === "Expense")?.id ?? "",
  );
  const [counterAccountId, setCounterAccountId] = useState(accountPlan.find((a) => a.type === "Asset")?.id ?? "");
  const [hint, setHint] = useState("Preencha e cadastre a recorrência.");

  const grouped = groupByMonth(upcomingRecurrences);

  const submit = () => {
    const numericAmount = parseFloat(amount);
    if (!description.trim()) {
      setHint("Informe a descrição.");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setHint("Valor deve ser maior que zero.");
      return;
    }
    if (!categoryAccountId || !counterAccountId) {
      setHint("Escolha contas válidas.");
      return;
    }
    addRecurrence({
      description: description.trim(),
      amount: numericAmount,
      day: Number(day) || 1,
      type,
      categoryAccountId,
      counterAccountId,
      startDate: new Date().toISOString().slice(0, 10),
    });
    setDescription("");
    setAmount("");
    setHint("Recorrência adicionada.");
  };

  return (
    <section className="ctaCard">
      <h2 className="ctaTitle">Recorrências & Parcelas</h2>
      <ul className="ctaList">
        <li>Resumo dos próximos meses para visualizar compromissos.</li>
        <li>Tipos: receita ou despesa; mapeia partidas automaticamente.</li>
      </ul>

      <div className="resultBox">
        <span className="resultLabel">Cadastrar recorrência</span>
        <div className="formGrid">
          <div className="formRow">
            <label htmlFor="recType">Tipo</label>
            <select id="recType" value={type} onChange={(e) => setType(e.target.value as "expense" | "income")}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          <div className="formRow">
            <label htmlFor="recDesc">Descrição</label>
            <input
              id="recDesc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Academia"
            />
          </div>
          <div className="formRow">
            <label htmlFor="recAmount">Valor (R$)</label>
            <input
              id="recAmount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="formRow">
            <label htmlFor="recDay">Dia do mês</label>
            <input id="recDay" type="number" min="1" max="28" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
          <div className="formRow">
            <label htmlFor="recCategory">{type === "expense" ? "Categoria de despesa" : "Categoria de receita"}</label>
            <select
              id="recCategory"
              value={categoryAccountId}
              onChange={(e) => setCategoryAccountId(e.target.value)}
            >
              {accountPlan
                .filter((acc) => acc.type === (type === "expense" ? "Expense" : "Income"))
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.displayName}
                    {acc.isActive ? "" : " (inativa)"}
                  </option>
                ))}
            </select>
          </div>
          <div className="formRow">
            <label htmlFor="recCounter">
              {type === "expense" ? "Pagar de (Ativo/Passivo)" : "Receber em (Ativo)"}
            </label>
            <select id="recCounter" value={counterAccountId} onChange={(e) => setCounterAccountId(e.target.value)}>
              {accountPlan
                .filter((acc) => (type === "expense" ? acc.type === "Asset" || acc.type === "Liability" : acc.type === "Asset"))
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.displayName}
                    {acc.isActive ? "" : " (inativa)"}
                  </option>
                ))}
            </select>
          </div>
          <button className="secondaryButton" type="button" onClick={submit}>
            Adicionar
          </button>
          <p className="inputHint">{hint}</p>
        </div>
      </div>

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
