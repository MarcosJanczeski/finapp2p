import { useEffect, useMemo, useState } from "react";
import "./App.css";

type AccountType = "Asset" | "Liability" | "Equity" | "Income" | "Expense"; // (pt: tiposConta)
type AssetGroup = "Availability" | "Rights" | "Goods"; // (pt: gruposAtivo)

type Account = { // (pt: Conta)
  id: string; // (pt: id)
  name: string; // (pt: nomeSistema)
  displayName: string; // (pt: nomeExibicao)
  type: AccountType; // (pt: tipo)
  assetGroup?: AssetGroup; // (pt: grupoAtivo)
  isActive: boolean; // (pt: ativa)
};

type JournalLine = { accountId: string; debit: number; credit: number }; // (pt: LinhaLancamento)
type JournalEntry = { id: string; description: string; lines: JournalLine[] }; // (pt: Lancamento)

type QuickEntryType =
  | "expense"
  | "income"
  | "transfer"
  | "card_purchase"
  | "card_payment"
  | "installment_purchase"
  | "loan_installment"; // (pt: tiposLancamentoRapido)

const monthlyCapacity = 12000; // (pt: capacidadeMensal)
const rentMonthly = 1650; // (pt: aluguelMensal)
const powerMonthly = 400; // (pt: energiaMensal)
const waterMonthly = 300; // (pt: aguaMensal)
const carRentalWeekly = 1400; // (pt: locacaoCarroSemanal)
const internetMonthly = 139.9; // (pt: internetMensal)
const streamingMonthly = 200; // (pt: streamingMensal)
const chatgptMonthly = 100; // (pt: chatgptMensal)
const weeksPerMonth = 4.345; // (pt: semanasPorMes)

const storagePrefix = "finapp2p"; // (pt: prefixoArmazenamento)
const STORAGE_KEY_JOURNAL_PREFIX = `${storagePrefix}:journal:`; // (pt: chavePrefixoLancamentos)

const accountPlan: Account[] = [
  { id: "A1", name: "Cash", displayName: "Dinheiro em Caixa", type: "Asset", assetGroup: "Availability", isActive: true }, // (pt: DinheiroCaixa)
  { id: "A2", name: "Checking Account", displayName: "Conta Corrente", type: "Asset", assetGroup: "Availability", isActive: true }, // (pt: ContaCorrente)
  { id: "A3", name: "Savings Account", displayName: "Poupança", type: "Asset", assetGroup: "Availability", isActive: true }, // (pt: Poupanca)
  { id: "A4", name: "Receivables", displayName: "Contas a Receber", type: "Asset", assetGroup: "Rights", isActive: true }, // (pt: ContasReceber)
  { id: "A5", name: "Equipment", displayName: "Equipamentos", type: "Asset", assetGroup: "Goods", isActive: true }, // (pt: Equipamentos)
  { id: "L1", name: "Credit Card", displayName: "Cartão de Crédito", type: "Liability", isActive: true }, // (pt: CartaoCredito)
  { id: "L2", name: "Taxes Payable", displayName: "Impostos a Pagar", type: "Liability", isActive: true }, // (pt: ImpostosPagar)
  { id: "E1", name: "Opening Equity", displayName: "Capital Inicial", type: "Equity", isActive: true }, // (pt: CapitalInicial)
  { id: "I1", name: "Salary Income", displayName: "Salário", type: "Income", isActive: true }, // (pt: Salario)
  { id: "I2", name: "Side Income", displayName: "Renda Extra", type: "Income", isActive: true }, // (pt: RendaExtra)
  { id: "X1", name: "Rent Expense", displayName: "Despesa de Aluguel", type: "Expense", isActive: true }, // (pt: DespesaAluguel)
  { id: "X2", name: "Utilities Expense", displayName: "Contas de Serviços (Luz/Água/Internet)", type: "Expense", isActive: true }, // (pt: DespesaServicos)
  { id: "X3", name: "Transport Expense", displayName: "Transporte / Locação de Veículo", type: "Expense", isActive: true }, // (pt: DespesaTransporte)
  { id: "X4", name: "Subscriptions Expense", displayName: "Assinaturas e Streaming", type: "Expense", isActive: true }, // (pt: DespesaAssinaturas)
  { id: "X5", name: "Groceries Expense", displayName: "Higiene, Alimentação e Limpeza", type: "Expense", isActive: true }, // (pt: DespesaMercado)
  { id: "X6", name: "Health Expense", displayName: "Saúde", type: "Expense", isActive: true }, // (pt: DespesaSaude)
  { id: "X7", name: "Learning Expense", displayName: "Aprendizado", type: "Expense", isActive: true }, // (pt: DespesaAprendizado)
  { id: "X8", name: "Suspense Expense", displayName: "A Classificar (Transição)", type: "Expense", isActive: false }, // (pt: DespesaAClassificar)
];

const initialJournalEntries: JournalEntry[] = [
  {
    id: "JE1", // (pt: idLancamento)
    description: "Pagamento de aluguel", // (pt: descricaoLancamento)
    lines: [
      { accountId: "X1", debit: 1650, credit: 0 }, // (pt: debitarAluguel)
      { accountId: "A1", debit: 0, credit: 1650 }, // (pt: creditarCaixa)
    ],
  },
  {
    id: "JE2", // (pt: idLancamento)
    description: "Compra de mercado", // (pt: descricaoLancamento)
    lines: [
      { accountId: "X5", debit: 450, credit: 0 }, // (pt: debitarMercado)
      { accountId: "A2", debit: 0, credit: 450 }, // (pt: creditarContaCorrente)
    ],
  },
  {
    id: "JE3", // (pt: idLancamento)
    description: "Curso online", // (pt: descricaoLancamento)
    lines: [
      { accountId: "X7", debit: 120, credit: 0 }, // (pt: debitarAprendizado)
      { accountId: "L1", debit: 0, credit: 120 }, // (pt: creditarCartaoCredito)
    ],
  },
  {
    id: "JE4", // (pt: idLancamento)
    description: "Pagamento em trânsito a classificar", // (pt: descricaoLancamento)
    lines: [
      { accountId: "X8", debit: 300, credit: 0 }, // (pt: debitarAClassificar)
      { accountId: "A1", debit: 0, credit: 300 }, // (pt: creditarCaixa)
    ],
  },
];

const typeLabels: Record<AccountType, string> = { // (pt: rotulosTipo)
  Asset: "Ativo",
  Liability: "Passivo",
  Equity: "Patrimônio Líquido",
  Income: "Receita",
  Expense: "Despesa",
};

const assetGroupOrder: { key: AssetGroup; label: string }[] = [ // (pt: ordemGruposAtivo)
  { key: "Availability", label: "Disponibilidades" },
  { key: "Rights", label: "Direitos" },
  { key: "Goods", label: "Bens" },
];

const typeOrder: AccountType[] = ["Asset", "Liability", "Equity", "Income", "Expense"]; // (pt: ordemTipos)

function getMonthKey(date = new Date()) { // (pt: obterChaveMes)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function computeMonthlyFromWeekly(weeklyAmount: number) { // (pt: calcularMensalAPartirSemanal)
  return weeklyAmount * weeksPerMonth;
}

function formatCurrencyBRL(value: number) { // (pt: formatarMoedaBRL)
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateTime(isoString: string) { // (pt: formatarDataHora)
  const date = new Date(isoString);
  return date.toLocaleString("pt-BR");
}

function computeBalances(entries: JournalEntry[]) { // (pt: calcularSaldos)
  const totals = new Map<string, { debit: number; credit: number }>(); // (pt: mapaTotais)
  entries.forEach((entry) => {
    entry.lines.forEach((line) => {
      const current = totals.get(line.accountId) ?? { debit: 0, credit: 0 }; // (pt: acumulador)
      totals.set(line.accountId, {
        debit: current.debit + line.debit,
        credit: current.credit + line.credit,
      });
    });
  });
  return totals;
}

function App() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries); // (pt: lancamentos)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null); // (pt: ultimoSalvo)
  const [statusMessage, setStatusMessage] = useState("Nenhum dado salvo no mês atual ainda."); // (pt: statusMensagem)
  const [description, setDescription] = useState(""); // (pt: descricaoInput)
  const [amount, setAmount] = useState(""); // (pt: valorInput)
  const [quickType, setQuickType] = useState<QuickEntryType>("expense"); // (pt: tipoLancamentoRapido)
  const defaultAssetId = accountPlan.find((a) => a.type === "Asset")?.id ?? ""; // (pt: ativoPadrao)
  const defaultLiabilityId = accountPlan.find((a) => a.type === "Liability")?.id ?? ""; // (pt: passivoPadrao)
  const [payFromId, setPayFromId] = useState(defaultAssetId); // (pt: pagarDe)
  const [receiveInId, setReceiveInId] = useState(defaultAssetId); // (pt: receberEm)
  const [transferFromId, setTransferFromId] = useState(defaultAssetId); // (pt: transferirDe)
  const [transferToId, setTransferToId] = useState(defaultAssetId); // (pt: transferirPara)
  const [cardAccountId, setCardAccountId] = useState(defaultLiabilityId || defaultAssetId); // (pt: contaCartao)
  const [loanAccountId, setLoanAccountId] = useState(defaultLiabilityId || defaultAssetId); // (pt: contaEmprestimo)
  const [expenseCategoryId, setExpenseCategoryId] = useState(accountPlan.find((a) => a.type === "Expense")?.id ?? ""); // (pt: categoriaDespesa)
  const [incomeCategoryId, setIncomeCategoryId] = useState(accountPlan.find((a) => a.type === "Income")?.id ?? ""); // (pt: categoriaReceita)
  const [parcelCount, setParcelCount] = useState("1"); // (pt: quantidadeParcelas)
  const [hintMessage, setHintMessage] = useState("Escolha o tipo e preencha só os campos pedidos. As partidas são geradas automaticamente."); // (pt: mensagemDica)
  const [hintTone, setHintTone] = useState<"neutral" | "ok" | "error">("neutral"); // (pt: tomDica)

  const carRentalMonthly = useMemo(() => computeMonthlyFromWeekly(carRentalWeekly), []); // (pt: aluguelCarroMensal)
  const totalFixedExpenses = useMemo(
    () =>
      rentMonthly +
      powerMonthly +
      waterMonthly +
      carRentalMonthly +
      internetMonthly +
      streamingMonthly +
      chatgptMonthly,
    [carRentalMonthly],
  ); // (pt: totalDespesasFixas)
  const freeCashFlow = monthlyCapacity - totalFixedExpenses; // (pt: fluxoCaixaLivre)
  const targetSavings = monthlyCapacity * 0.03; // (pt: poupancaAlvo)

  const balances = useMemo(() => computeBalances(journalEntries), [journalEntries]); // (pt: saldos)

  useEffect(() => {
    const key = `${STORAGE_KEY_JOURNAL_PREFIX}${getMonthKey()}`; // (pt: chaveMes)
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      let entries: JournalEntry[] = parsed;
      let savedAt: string | null = null;
      if (!Array.isArray(parsed)) {
        if (parsed && Array.isArray(parsed.entries)) {
          entries = parsed.entries;
          savedAt = parsed.savedAt ?? null;
        } else {
          setStatusMessage("Formato inválido no armazenamento."); // (pt: statusFormatoInvalido)
          return;
        }
      }
      setJournalEntries(entries);
      setLastSavedAt(savedAt);
      const suffix = savedAt ? ` (salvo em ${formatDateTime(savedAt)})` : "";
      setStatusMessage(`Carregado do localStorage: ${entries.length} lançamento(s)${suffix}`); // (pt: statusCarregado)
    } catch (error) {
      console.error(error);
      setStatusMessage("Erro ao ler do armazenamento local."); // (pt: statusErroCarregar)
    }
  }, []);

  const saveCurrentMonth = () => { // (pt: salvarMesAtual)
    const key = `${STORAGE_KEY_JOURNAL_PREFIX}${getMonthKey()}`;
    const payload = { savedAt: new Date().toISOString(), entries: journalEntries }; // (pt: cargaSalvar)
    try {
      localStorage.setItem(key, JSON.stringify(payload));
      setLastSavedAt(payload.savedAt);
      setStatusMessage(`Salvo em ${formatDateTime(payload.savedAt)} para ${key}`); // (pt: statusSalvo)
    } catch (error) {
      console.error(error);
      setStatusMessage("Erro ao salvar no armazenamento local."); // (pt: statusErroSalvar)
    }
  };

  const loadCurrentMonth = () => { // (pt: carregarMesAtual)
    const key = `${STORAGE_KEY_JOURNAL_PREFIX}${getMonthKey()}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      setStatusMessage("Nada salvo para este mês."); // (pt: statusNadaSalvo)
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      let entries: JournalEntry[] = parsed;
      let savedAt: string | null = null;
      if (!Array.isArray(parsed)) {
        if (parsed && Array.isArray(parsed.entries)) {
          entries = parsed.entries;
          savedAt = parsed.savedAt ?? null;
        } else {
          setStatusMessage("Formato inválido no armazenamento."); // (pt: statusFormatoInvalido)
          return;
        }
      }
      setJournalEntries(entries);
      setLastSavedAt(savedAt);
      const suffix = savedAt ? ` (salvo em ${formatDateTime(savedAt)})` : "";
      setStatusMessage(`Carregado do localStorage: ${entries.length} lançamento(s)${suffix}`); // (pt: statusCarregado)
    } catch (error) {
      console.error(error);
      setStatusMessage("Erro ao ler do armazenamento local."); // (pt: statusErroCarregar)
    }
  };

  const handleAddEntry = () => { // (pt: adicionarLancamento)
    const trimmedDesc = description.trim();
    const numericAmount = parseFloat(amount);
    if (!trimmedDesc) {
      setHintMessage("Informe uma descrição."); // (pt: dicaDescricao)
      setHintTone("error");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setHintMessage("Valor deve ser maior que zero."); // (pt: dicaValor)
      setHintTone("error");
      return;
    }
    if (quickType === "transfer" && transferFromId === transferToId) {
      setHintMessage("Transferência precisa de contas diferentes."); // (pt: dicaTransferencia)
      setHintTone("error");
      return;
    }

    const buildLines = (): JournalLine[] => { // (pt: montarLinhas)
      if (quickType === "expense") {
        return [
          { accountId: expenseCategoryId, debit: numericAmount, credit: 0 },
          { accountId: payFromId, debit: 0, credit: numericAmount },
        ];
      }
      if (quickType === "income") {
        return [
          { accountId: receiveInId, debit: numericAmount, credit: 0 },
          { accountId: incomeCategoryId, debit: 0, credit: numericAmount },
        ];
      }
      if (quickType === "transfer") {
        return [
          { accountId: transferToId, debit: numericAmount, credit: 0 },
          { accountId: transferFromId, debit: 0, credit: numericAmount },
        ];
      }
      if (quickType === "card_purchase" || quickType === "installment_purchase") {
        return [
          { accountId: expenseCategoryId, debit: numericAmount, credit: 0 },
          { accountId: cardAccountId, debit: 0, credit: numericAmount },
        ];
      }
      if (quickType === "card_payment") {
        return [
          { accountId: cardAccountId, debit: numericAmount, credit: 0 },
          { accountId: payFromId, debit: 0, credit: numericAmount },
        ];
      }
      if (quickType === "loan_installment") {
        return [
          { accountId: loanAccountId, debit: numericAmount, credit: 0 },
          { accountId: payFromId, debit: 0, credit: numericAmount },
        ];
      }
      return [
        { accountId: payFromId, debit: numericAmount, credit: 0 },
        { accountId: receiveInId, debit: 0, credit: numericAmount },
      ];
    };

    const parcelInfo =
      (quickType === "installment_purchase" || quickType === "loan_installment") && Number(parcelCount) > 1
        ? ` (${parcelCount}x)`
        : "";

    const newEntry: JournalEntry = {
      id: `JE${Date.now()}`,
      description: `${trimmedDesc}${parcelInfo}`,
      lines: buildLines(),
    };

    setJournalEntries((prev) => [...prev, newEntry]);
    setHintMessage("Lançamento adicionado e salvo no mês atual."); // (pt: dicaSucesso)
    setHintTone("ok");
    setDescription("");
    setAmount("");
    setParcelCount("1");
    setTimeout(() => saveCurrentMonth(), 0);
  };

  return (
    <div className="appShell">
      <header className="appHeader">
        <p className="appSubtitle">
          Começaremos mobile-first: tela clara e botões grandes para lançamentos rápidos.
        </p>
        <h1 className="appTitle">Finanças 2P — React + TS</h1>
      </header>

      <section className="ctaCard">
        <h2 className="ctaTitle">Lançamento rápido</h2>
        <ul className="ctaList">
          <li>Selecione o tipo, valor e conta(s); lançamos em dupla entrada automaticamente.</li>
          <li>Parceladas: colocamos “(Nx)” na descrição (refere-se à parcela atual).</li>
        </ul>

        <div className="storageRow">
          <button className="secondaryButton" type="button" onClick={saveCurrentMonth}>
            Salvar mês (local)
          </button>
          <button className="secondaryButton ghost" type="button" onClick={loadCurrentMonth}>
            Carregar mês
          </button>
        </div>
        <p className="note" aria-live="polite">
          {statusMessage}
        </p>

        <div className="resultBox">
          <div className="formGrid">
            <div className="formRow">
              <label htmlFor="quickType">Tipo</label>
              <select
                id="quickType"
                value={quickType}
                onChange={(e) => setQuickType(e.target.value as QuickEntryType)}
              >
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
                <select
                  id="payFrom"
                  value={payFromId}
                  onChange={(e) => setPayFromId(e.target.value)}
                >
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
                <select
                  id="receiveIn"
                  value={receiveInId}
                  onChange={(e) => setReceiveInId(e.target.value)}
                >
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
                  <select
                    id="transferFrom"
                    value={transferFromId}
                    onChange={(e) => setTransferFromId(e.target.value)}
                  >
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
                  <select
                    id="transferTo"
                    value={transferToId}
                    onChange={(e) => setTransferToId(e.target.value)}
                  >
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

            {(quickType === "card_purchase" ||
              quickType === "installment_purchase" ||
              quickType === "card_payment") && (
              <div className="formRow">
                <label htmlFor="cardAccount">Cartão / Passivo</label>
                <select
                  id="cardAccount"
                  value={cardAccountId}
                  onChange={(e) => setCardAccountId(e.target.value)}
                >
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
                <select
                  id="loanAccount"
                  value={loanAccountId}
                  onChange={(e) => setLoanAccountId(e.target.value)}
                >
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

            <button className="secondaryButton" type="button" onClick={handleAddEntry}>
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

        <div className="resultBox" aria-live="polite">
          <span className="resultLabel">Resumo rápido</span>
          <div className="textIncome">Capacidade mensal: {formatCurrencyBRL(monthlyCapacity)}</div>
          <div className="textExpense">Despesa fixa total: {formatCurrencyBRL(totalFixedExpenses)}</div>
          <div className={freeCashFlow >= 0 ? "textPositive" : "textNegative"}>
            Fluxo de caixa livre: {formatCurrencyBRL(freeCashFlow)}
          </div>
          <div className="textPositive">Meta de poupança (3%): {formatCurrencyBRL(targetSavings)}</div>
        </div>

        <div className="resultBox" aria-live="polite">
          <span className="resultLabel">Plano de contas</span>
          {typeOrder.map((type) => {
            const itemsOfType = accountPlan.filter((acc) => acc.type === type);
            if (!itemsOfType.length) return null;

            if (type === "Asset") {
              return (
                <div className="accountGroup" key={type}>
                  <span className="resultLabel">{typeLabels[type]}</span>
                  {assetGroupOrder.map(({ key, label }) => {
                    const grouped = itemsOfType.filter((acc) => acc.assetGroup === key);
                    if (!grouped.length) return null;
                    return (
                      <div className="accountGroup" key={key}>
                        <span className="resultLabel">{label}</span>
                        <ul className="bulletList">
                          {grouped.map((acc) => (
                            <li key={acc.id} className={acc.isActive ? "" : "accountInactive"}>
                              <strong>{acc.id}</strong> — {acc.displayName}{" "}
                              {acc.isActive ? "" : <span className="inactiveTag">(inativa)</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <div className="accountGroup" key={type}>
                <span className="resultLabel">{typeLabels[type]}</span>
                <ul className="bulletList">
                  {itemsOfType.map((acc) => (
                    <li key={acc.id} className={acc.isActive ? "" : "accountInactive"}>
                      <strong>{acc.id}</strong> — {acc.displayName}{" "}
                      {acc.isActive ? "" : <span className="inactiveTag">(inativa)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="resultBox" aria-live="polite">
          <span className="resultLabel">Lançamentos (dupla entrada)</span>
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
          <div className="footerNote">
            {lastSavedAt ? `Último salvamento: ${formatDateTime(lastSavedAt)}` : "Ainda não salvo neste mês"}
          </div>
        </div>

        <div className="resultBox" aria-live="polite">
          <span className="resultLabel">Saldos por conta</span>
          {accountPlan
            .filter((acc) => balances.has(acc.id))
            .map((acc) => {
              const totals = balances.get(acc.id)!;
              const net = totals.debit - totals.credit;
              return (
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
              );
            })}
          {!Array.from(balances.keys()).length && <div>Nenhum lançamento ainda.</div>}
        </div>
      </section>

      <p className="note">Próximos passos: simplificar campos por tipo e adicionar agenda de parcelas/recorrências.</p>
    </div>
  );
}

export default App;
