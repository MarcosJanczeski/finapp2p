import { useEffect, useMemo, useState } from "react";
import type { QuickEntryType } from "../finance-context";
import { accountPlan, useFinance } from "../finance-context";

export function NewEntryPage() {
  const { addQuickEntry } = useFinance();
  const defaultAssetId = useMemo(() => accountPlan.find((a) => a.type === "Asset")?.id ?? "", []);
  const defaultLiabilityId = useMemo(() => accountPlan.find((a) => a.type === "Liability")?.id ?? "", []);
  const defaultExpenseId = useMemo(() => accountPlan.find((a) => a.type === "Expense")?.id ?? "", []);
  const defaultIncomeId = useMemo(() => accountPlan.find((a) => a.type === "Income")?.id ?? "", []);
  const [quickType, setQuickType] = useState<QuickEntryType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payFromId, setPayFromId] = useState(defaultAssetId);
  const [receiveInId, setReceiveInId] = useState(defaultAssetId);
  const [transferFromId, setTransferFromId] = useState(defaultAssetId);
  const [transferToId, setTransferToId] = useState(defaultAssetId);
  const [cardAccountId, setCardAccountId] = useState(defaultLiabilityId || defaultAssetId);
  const [loanAccountId, setLoanAccountId] = useState(defaultLiabilityId || defaultAssetId);
  const [expenseCategoryId, setExpenseCategoryId] = useState(accountPlan.find((a) => a.type === "Expense")?.id ?? "");
  const [incomeCategoryId, setIncomeCategoryId] = useState(accountPlan.find((a) => a.type === "Income")?.id ?? "");
  const [parcelCount, setParcelCount] = useState("1");
  const [hintMessage, setHintMessage] = useState(
    "Escolha o tipo e preencha apenas os campos pedidos.",
  ); // (pt: mensagemDica)
  const [hintTone, setHintTone] = useState<"neutral" | "ok" | "error">("neutral");

  useEffect(() => {
    // (pt: ajustarCamposPorTipo)
    setHintTone("neutral");
    setParcelCount("1");
    if (quickType === "expense") {
      setPayFromId((prev) => prev || defaultAssetId || defaultLiabilityId);
      setExpenseCategoryId((prev) => prev || defaultExpenseId);
    } else if (quickType === "income") {
      setReceiveInId((prev) => prev || defaultAssetId);
      setIncomeCategoryId((prev) => prev || defaultIncomeId);
    } else if (quickType === "transfer") {
      setTransferFromId((prev) => prev || defaultAssetId);
      setTransferToId((prev) => prev || defaultAssetId);
    } else if (quickType === "card_purchase" || quickType === "installment_purchase") {
      setCardAccountId((prev) => prev || defaultLiabilityId || defaultAssetId);
      setExpenseCategoryId((prev) => prev || defaultExpenseId);
    } else if (quickType === "card_payment") {
      setCardAccountId((prev) => prev || defaultLiabilityId || defaultAssetId);
      setPayFromId((prev) => prev || defaultAssetId);
    } else if (quickType === "loan_installment") {
      setLoanAccountId((prev) => prev || defaultLiabilityId || defaultAssetId);
      setPayFromId((prev) => prev || defaultAssetId);
    }
  }, [quickType, defaultAssetId, defaultLiabilityId, defaultExpenseId, defaultIncomeId]);

  const submit = () => {
    const trimmedDesc = description.trim();
    const numericAmount = parseFloat(amount);
    if (!trimmedDesc) {
      setHintMessage("Informe uma descrição.");
      setHintTone("error");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setHintMessage("Valor deve ser maior que zero.");
      setHintTone("error");
      return;
    }
    if (quickType === "transfer" && transferFromId === transferToId) {
      setHintMessage("Transferência precisa de contas diferentes.");
      setHintTone("error");
      return;
    }
    if (quickType === "expense" && (!expenseCategoryId || !payFromId)) {
      setHintMessage("Escolha a categoria e a conta de pagamento.");
      setHintTone("error");
      return;
    }
    if (quickType === "income" && (!incomeCategoryId || !receiveInId)) {
      setHintMessage("Escolha a categoria e a conta de recebimento.");
      setHintTone("error");
      return;
    }
    if (
      (quickType === "card_purchase" || quickType === "installment_purchase") &&
      (!cardAccountId || !expenseCategoryId)
    ) {
      setHintMessage("Escolha o cartão e a categoria.");
      setHintTone("error");
      return;
    }
    if (quickType === "card_payment" && (!cardAccountId || !payFromId)) {
      setHintMessage("Escolha o cartão e a conta pagadora.");
      setHintTone("error");
      return;
    }
    if (quickType === "loan_installment" && (!loanAccountId || !payFromId)) {
      setHintMessage("Escolha a conta do empréstimo e a conta pagadora.");
      setHintTone("error");
      return;
    }

    addQuickEntry({
      type: quickType,
      description: trimmedDesc,
      amount: numericAmount,
      payFromId,
      receiveInId,
      transferFromId,
      transferToId,
      cardAccountId,
      loanAccountId,
      expenseCategoryId,
      incomeCategoryId,
      parcelCount: Number(parcelCount) || 1,
    });

    setHintMessage("Lançamento adicionado e salvo no mês atual.");
    setHintTone("ok");
    setDescription("");
    setAmount("");
    setParcelCount("1");
  };

  return (
    <section className="ctaCard">
      <h2 className="ctaTitle">Novo lançamento</h2>
      <div className="resultBox">
        <div className="formGrid">
          <div className="formRow">
            <label htmlFor="quickType">Tipo</label>
            <select id="quickType" value={quickType} onChange={(e) => setQuickType(e.target.value as QuickEntryType)}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
              <option value="transfer">Transferência</option>
              <option value="card_purchase">Compra no cartão</option>
              <option value="card_payment">Pagamento de cartão</option>
              <option value="installment_purchase">Compra parcelada</option>
              <option value="loan_installment">Parcela de empréstimo</option>
            </select>
          </div>

          <div className="formRow">
            <label htmlFor="entryDesc">Descrição</label>
            <input
              id="entryDesc"
              type="text"
              placeholder="Ex.: Compra no mercado"
              autoComplete="off"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="formRow">
            <label htmlFor="entryAmount">Valor (R$)</label>
            <input
              id="entryAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {quickType !== "income" && (
            <div className="formRow">
              <label htmlFor="expenseCategory">Categoria de despesa</label>
              <select
                id="expenseCategory"
                value={expenseCategoryId}
                onChange={(e) => setExpenseCategoryId(e.target.value)}
              >
                {accountPlan
                  .filter((acc) => acc.type === "Expense")
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.displayName}
                      {acc.isActive ? "" : " (inativa)"}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {quickType === "income" && (
            <div className="formRow">
              <label htmlFor="incomeCategory">Categoria de receita</label>
              <select
                id="incomeCategory"
                value={incomeCategoryId}
                onChange={(e) => setIncomeCategoryId(e.target.value)}
              >
                {accountPlan
                  .filter((acc) => acc.type === "Income")
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.displayName}
                      {acc.isActive ? "" : " (inativa)"}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {(quickType === "expense" ||
            quickType === "card_payment" ||
            quickType === "loan_installment" ||
            quickType === "card_purchase" ||
            quickType === "installment_purchase") && (
            <div className="formRow">
              <label htmlFor="payFrom">Pagar de</label>
              <select id="payFrom" value={payFromId} onChange={(e) => setPayFromId(e.target.value)}>
                {accountPlan
                  .filter((acc) => acc.type === "Asset" || acc.type === "Liability")
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.displayName}
                      {acc.isActive ? "" : " (inativa)"}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {quickType === "income" && (
            <div className="formRow">
              <label htmlFor="receiveIn">Receber em</label>
              <select id="receiveIn" value={receiveInId} onChange={(e) => setReceiveInId(e.target.value)}>
                {accountPlan
                  .filter((acc) => acc.type === "Asset")
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.displayName}
                      {acc.isActive ? "" : " (inativa)"}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {quickType === "transfer" && (
            <>
              <div className="formRow">
                <label htmlFor="transferFrom">Transferir de</label>
                <select id="transferFrom" value={transferFromId} onChange={(e) => setTransferFromId(e.target.value)}>
                  {accountPlan
                    .filter((acc) => acc.type === "Asset")
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.displayName}
                        {acc.isActive ? "" : " (inativa)"}
                      </option>
                    ))}
                </select>
              </div>
              <div className="formRow">
                <label htmlFor="transferTo">Transferir para</label>
                <select id="transferTo" value={transferToId} onChange={(e) => setTransferToId(e.target.value)}>
                  {accountPlan
                    .filter((acc) => acc.type === "Asset")
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.displayName}
                        {acc.isActive ? "" : " (inativa)"}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}

          {(quickType === "card_purchase" || quickType === "installment_purchase" || quickType === "card_payment") && (
            <div className="formRow">
              <label htmlFor="cardAccount">Cartão / Passivo</label>
              <select id="cardAccount" value={cardAccountId} onChange={(e) => setCardAccountId(e.target.value)}>
                {accountPlan
                  .filter((acc) => acc.type === "Liability")
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.displayName}
                      {acc.isActive ? "" : " (inativa)"}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {quickType === "loan_installment" && (
            <div className="formRow">
              <label htmlFor="loanAccount">Conta de empréstimo</label>
              <select id="loanAccount" value={loanAccountId} onChange={(e) => setLoanAccountId(e.target.value)}>
                {accountPlan
                  .filter((acc) => acc.type === "Liability")
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.displayName}
                      {acc.isActive ? "" : " (inativa)"}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {(quickType === "installment_purchase" || quickType === "loan_installment") && (
            <div className="formRow">
              <label htmlFor="parcelCount">Parcelas</label>
              <input
                id="parcelCount"
                type="number"
                min="1"
                step="1"
                value={parcelCount}
                onChange={(e) => setParcelCount(e.target.value)}
              />
            </div>
          )}

          <button className="secondaryButton" type="button" onClick={submit}>
            Adicionar lançamento
          </button>
          <p
            className={`inputHint ${
              hintTone === "error" ? "textNegative" : hintTone === "ok" ? "textPositive" : ""
            }`}
          >
            {hintMessage}
          </p>
        </div>
      </div>
    </section>
  );
}
