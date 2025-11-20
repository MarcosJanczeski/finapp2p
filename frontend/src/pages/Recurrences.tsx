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
  const {
    recurrences,
    upcomingRecurrences,
    accountPlan,
    addRecurrence,
    updateRecurrence,
    deleteRecurrence,
    toggleRecurrenceActive,
  } = useFinance();
  const [description, setDescription] = useState(""); // (pt: descricao)
  const [amount, setAmount] = useState(""); // (pt: valor)
  const [day, setDay] = useState("5"); // (pt: dia)
  const [type, setType] = useState<"expense" | "income">("expense"); // (pt: tipo)
  const [frequency, setFrequency] = useState<"monthly" | "weekly">("monthly"); // (pt: frequencia)
  const [weekday, setWeekday] = useState("1"); // (pt: diaSemana)
  const [categoryAccountId, setCategoryAccountId] = useState(
    accountPlan.find((a) => a.type === "Expense")?.id ?? "",
  ); // (pt: contaCategoria)
  const [counterAccountId, setCounterAccountId] = useState(accountPlan.find((a) => a.type === "Asset")?.id ?? ""); // (pt: contaContrapartida)
  const [editingId, setEditingId] = useState<string | null>(null); // (pt: idEdicao)
  const [hint, setHint] = useState("Preencha e cadastre a recorrência."); // (pt: dica)

  const grouped = groupByMonth(upcomingRecurrences);
  const activeCount = recurrences.filter((rec) => rec.isActive).length; // (pt: totalAtivas)
  const pausedCount = recurrences.filter((rec) => !rec.isActive).length; // (pt: totalPausadas)
  const monthDrift = Object.entries(grouped).map(([month, occs]) => ({
    month,
    amount: occs.reduce((sum, occ) => sum + (occ.type === "expense" ? -occ.amount : occ.amount), 0),
  })); // (pt: saldoPorMes)

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
    const chosenDay = frequency === "monthly" ? Number(day) || 1 : Number(weekday) || 1; // (pt: diaEscolhido)
    if (editingId) {
      const rec = recurrences.find((item) => item.id === editingId);
      if (!rec) {
        setHint("Não foi possível localizar para editar.");
        return;
      }
      updateRecurrence({
        ...rec,
        description: description.trim(),
        amount: numericAmount,
        day: chosenDay,
        weekday: frequency === "weekly" ? chosenDay : rec.weekday,
        frequency,
        categoryAccountId,
        counterAccountId,
      });
    } else {
      addRecurrence({
        description: description.trim(),
        amount: numericAmount,
        day: chosenDay,
        weekday: frequency === "weekly" ? chosenDay : undefined,
        frequency,
        type,
        categoryAccountId,
        counterAccountId,
        startDate: new Date().toISOString().slice(0, 10),
      });
    }
    setDescription("");
    setAmount("");
    setEditingId(null);
    setHint("Recorrência salva.");
  };

  const startEdit = (id: string) => {
    const rec = recurrences.find((item) => item.id === id);
    if (!rec) return;
    setEditingId(rec.id);
    setDescription(rec.description);
    setAmount(String(rec.amount));
    setDay(String(rec.day));
    setType(rec.type);
    setFrequency(rec.frequency);
    setWeekday(String(rec.weekday ?? 1));
    setCategoryAccountId(rec.categoryAccountId);
    setCounterAccountId(rec.counterAccountId);
    setHint("Editando recorrência; salve ou cancele.");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDescription("");
    setAmount("");
    setDay("5");
    setWeekday("1");
    setFrequency("monthly");
    setHint("Edição cancelada.");
  };

  return (
    <section className="ctaCard">
      <div className="sectionHeader">
        <div>
          <h2 className="ctaTitle">Recorrências & Parcelas</h2>
          <p className="appSubtitle">
            Agenda de compromissos: quanto sai/entra a cada mês e quantas recorrências estão ativas.
          </p>
        </div>
        <div className="pillRow">
          <span className="pill success">Ativas: {activeCount}</span>
          <span className="pill warning">Pausadas: {pausedCount}</span>
        </div>
      </div>

      {!!monthDrift.length && (
        <div className="recurrenceSummary">
          {monthDrift.map((item) => (
            <div key={item.month} className="summaryCard">
              <p className="resultLabel">{item.month}</p>
              <p className={item.amount >= 0 ? "textPositive" : "textNegative"}>
                {formatCurrencyBRL(item.amount)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="resultBox">
        <span className="resultLabel">{editingId ? "Editar recorrência" : "Cadastrar recorrência"}</span>
        <div className="formGrid">
          <div className="formRow">
            <label htmlFor="recFrequency">Frequência</label>
            <select
              id="recFrequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as "monthly" | "weekly")}
            >
              <option value="monthly">Mensal</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
          <div className="formRow">
            <label htmlFor="recType">Tipo</label>
            <select
              id="recType"
              value={type}
              onChange={(e) => setType(e.target.value as "expense" | "income")}
              disabled={!!editingId}
            >
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
            {frequency === "monthly" ? (
              <>
                <label htmlFor="recDay">Dia do mês</label>
                <input
                  id="recDay"
                  type="number"
                  min="1"
                  max="28"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                />
              </>
            ) : (
              <>
                <label htmlFor="recWeekday">Dia da semana</label>
                <select id="recWeekday" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                  <option value="1">Segunda</option>
                  <option value="2">Terça</option>
                  <option value="3">Quarta</option>
                  <option value="4">Quinta</option>
                  <option value="5">Sexta</option>
                  <option value="6">Sábado</option>
                  <option value="0">Domingo</option>
                </select>
              </>
            )}
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
            {editingId ? "Salvar" : "Adicionar"}
          </button>
          {editingId && (
            <button className="secondaryButton ghost" type="button" onClick={cancelEdit}>
              Cancelar
            </button>
          )}
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
        <div className="recurrenceList">
          {recurrences.map((rec) => {
            const cat = accountPlan.find((a) => a.id === rec.categoryAccountId)?.displayName ?? rec.categoryAccountId;
            const contra =
              accountPlan.find((a) => a.id === rec.counterAccountId)?.displayName ?? rec.counterAccountId;
            const toneClass = rec.type === "expense" ? "textExpense" : "textIncome";
            return (
              <article key={rec.id} className={`recCard ${rec.isActive ? "" : "muted"}`}>
                <div className="recMain">
                  <div>
                    <p className={`recTitle ${toneClass}`}>{rec.description}</p>
                    <p className="recMeta">
                      {formatCurrencyBRL(rec.amount)} •{" "}
                      {rec.frequency === "monthly"
                        ? `Dia ${rec.day}`
                        : `Semanal toda ${["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][rec.weekday ?? 1]}`}
                      {" — "}
                      {cat} ↔ {contra}
                    </p>
                  </div>
                  <span className={`pill ${rec.isActive ? "success" : "warning"}`}>
                    {rec.isActive ? "Ativa" : "Pausada"}
                  </span>
                </div>
                <div className="recActions">
                  <button className="chipButton" type="button" onClick={() => startEdit(rec.id)}>
                    Editar
                  </button>
                  <button
                    className="chipButton"
                    type="button"
                    onClick={() => toggleRecurrenceActive(rec.id, !rec.isActive)}
                  >
                    {rec.isActive ? "Pausar" : "Reativar"}
                  </button>
                  <button className="chipButton danger" type="button" onClick={() => deleteRecurrence(rec.id)}>
                    Excluir
                  </button>
                </div>
              </article>
            );
          })}
          {!recurrences.length && <p>Nenhuma recorrência ainda. Cadastre a primeira acima.</p>}
        </div>
      </div>
    </section>
  );
}
