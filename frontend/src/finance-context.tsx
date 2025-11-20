import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AccountType = "Asset" | "Liability" | "Equity" | "Income" | "Expense"; // (pt: tiposConta)
export type AssetGroup = "Availability" | "Rights" | "Goods"; // (pt: gruposAtivo)

export type Account = { // (pt: Conta)
  id: string; // (pt: id)
  name: string; // (pt: nomeSistema)
  displayName: string; // (pt: nomeExibicao)
  type: AccountType; // (pt: tipo)
  assetGroup?: AssetGroup; // (pt: grupoAtivo)
  isActive: boolean; // (pt: ativa)
};

export type JournalLine = { accountId: string; debit: number; credit: number }; // (pt: LinhaLancamento)
export type JournalEntry = { id: string; description: string; lines: JournalLine[] }; // (pt: Lancamento)

export type QuickEntryType =
  | "expense"
  | "income"
  | "transfer"
  | "card_purchase"
  | "card_payment"
  | "installment_purchase"
  | "loan_installment"; // (pt: tiposLancamentoRapido)

type QuickEntryPayload = { // (pt: DadosLancamentoRapido)
  description: string; // (pt: descricao)
  amount: number; // (pt: valor)
  type: QuickEntryType; // (pt: tipo)
  payFromId?: string; // (pt: pagarDe)
  receiveInId?: string; // (pt: receberEm)
  transferFromId?: string; // (pt: transferirDe)
  transferToId?: string; // (pt: transferirPara)
  cardAccountId?: string; // (pt: contaCartao)
  loanAccountId?: string; // (pt: contaEmprestimo)
  expenseCategoryId?: string; // (pt: categoriaDespesa)
  incomeCategoryId?: string; // (pt: categoriaReceita)
  parcelCount?: number; // (pt: quantidadeParcelas)
};

type FinanceContextValue = { // (pt: ContextoFinancas)
  accountPlan: Account[]; // (pt: planoContas)
  journalEntries: JournalEntry[]; // (pt: lancamentos)
  lastSavedAt: string | null; // (pt: ultimoSalvo)
  balances: Map<string, { debit: number; credit: number }>; // (pt: saldos)
  saveMonth: () => void; // (pt: salvarMes)
  loadMonth: () => void; // (pt: carregarMes)
  addQuickEntry: (payload: QuickEntryPayload) => void; // (pt: adicionarLancamentoRapido)
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

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

export const accountPlan: Account[] = [
  { id: "A1", name: "Cash", displayName: "Dinheiro em Caixa", type: "Asset", assetGroup: "Availability", isActive: true },
  { id: "A2", name: "Checking Account", displayName: "Conta Corrente", type: "Asset", assetGroup: "Availability", isActive: true },
  { id: "A3", name: "Savings Account", displayName: "Poupança", type: "Asset", assetGroup: "Availability", isActive: true },
  { id: "A4", name: "Receivables", displayName: "Contas a Receber", type: "Asset", assetGroup: "Rights", isActive: true },
  { id: "A5", name: "Equipment", displayName: "Equipamentos", type: "Asset", assetGroup: "Goods", isActive: true },
  { id: "L1", name: "Credit Card", displayName: "Cartão de Crédito", type: "Liability", isActive: true },
  { id: "L2", name: "Taxes Payable", displayName: "Impostos a Pagar", type: "Liability", isActive: true },
  { id: "E1", name: "Opening Equity", displayName: "Capital Inicial", type: "Equity", isActive: true },
  { id: "I1", name: "Salary Income", displayName: "Salário", type: "Income", isActive: true },
  { id: "I2", name: "Side Income", displayName: "Renda Extra", type: "Income", isActive: true },
  { id: "X1", name: "Rent Expense", displayName: "Despesa de Aluguel", type: "Expense", isActive: true },
  { id: "X2", name: "Utilities Expense", displayName: "Contas de Serviços (Luz/Água/Internet)", type: "Expense", isActive: true },
  { id: "X3", name: "Transport Expense", displayName: "Transporte / Locação de Veículo", type: "Expense", isActive: true },
  { id: "X4", name: "Subscriptions Expense", displayName: "Assinaturas e Streaming", type: "Expense", isActive: true },
  { id: "X5", name: "Groceries Expense", displayName: "Higiene, Alimentação e Limpeza", type: "Expense", isActive: true },
  { id: "X6", name: "Health Expense", displayName: "Saúde", type: "Expense", isActive: true },
  { id: "X7", name: "Learning Expense", displayName: "Aprendizado", type: "Expense", isActive: true },
  { id: "X8", name: "Suspense Expense", displayName: "A Classificar (Transição)", type: "Expense", isActive: false },
];

const initialJournalEntries: JournalEntry[] = [
  {
    id: "JE1",
    description: "Pagamento de aluguel",
    lines: [
      { accountId: "X1", debit: 1650, credit: 0 },
      { accountId: "A1", debit: 0, credit: 1650 },
    ],
  },
  {
    id: "JE2",
    description: "Compra de mercado",
    lines: [
      { accountId: "X5", debit: 450, credit: 0 },
      { accountId: "A2", debit: 0, credit: 450 },
    ],
  },
  {
    id: "JE3",
    description: "Curso online",
    lines: [
      { accountId: "X7", debit: 120, credit: 0 },
      { accountId: "L1", debit: 0, credit: 120 },
    ],
  },
  {
    id: "JE4",
    description: "Pagamento em trânsito a classificar",
    lines: [
      { accountId: "X8", debit: 300, credit: 0 },
      { accountId: "A1", debit: 0, credit: 300 },
    ],
  },
];

function getMonthKey(date = new Date()) { // (pt: obterChaveMes)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function computeMonthlyFromWeekly(weeklyAmount: number) { // (pt: calcularMensalAPartirSemanal)
  return weeklyAmount * weeksPerMonth;
}

function computeBalances(entries: JournalEntry[]) { // (pt: calcularSaldos)
  const totals = new Map<string, { debit: number; credit: number }>();
  entries.forEach((entry) => {
    entry.lines.forEach((line) => {
      const current = totals.get(line.accountId) ?? { debit: 0, credit: 0 };
      totals.set(line.accountId, {
        debit: current.debit + line.debit,
        credit: current.credit + line.credit,
      });
    });
  });
  return totals;
}

function formatCurrencyBRL(value: number) { // (pt: formatarMoedaBRL)
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mapQuickEntryToLines(payload: QuickEntryPayload): JournalLine[] { // (pt: mapearLancamentoRapido)
  const {
    type,
    amount,
    payFromId = "",
    receiveInId = "",
    transferFromId = "",
    transferToId = "",
    cardAccountId = "",
    loanAccountId = "",
    expenseCategoryId = "",
    incomeCategoryId = "",
  } = payload;

  if (type === "expense") {
    return [
      { accountId: expenseCategoryId, debit: amount, credit: 0 },
      { accountId: payFromId, debit: 0, credit: amount },
    ];
  }
  if (type === "income") {
    return [
      { accountId: receiveInId, debit: amount, credit: 0 },
      { accountId: incomeCategoryId, debit: 0, credit: amount },
    ];
  }
  if (type === "transfer") {
    return [
      { accountId: transferToId, debit: amount, credit: 0 },
      { accountId: transferFromId, debit: 0, credit: amount },
    ];
  }
  if (type === "card_purchase" || type === "installment_purchase") {
    return [
      { accountId: expenseCategoryId, debit: amount, credit: 0 },
      { accountId: cardAccountId, debit: 0, credit: amount },
    ];
  }
  if (type === "card_payment") {
    return [
      { accountId: cardAccountId, debit: amount, credit: 0 },
      { accountId: payFromId, debit: 0, credit: amount },
    ];
  }
  if (type === "loan_installment") {
    return [
      { accountId: loanAccountId, debit: amount, credit: 0 },
      { accountId: payFromId, debit: 0, credit: amount },
    ];
  }
  return [
    { accountId: payFromId, debit: amount, credit: 0 },
    { accountId: receiveInId, debit: 0, credit: amount },
  ];
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("FinanceContext not found");
  return ctx;
}

export function FinanceProvider({ children }: { children: React.ReactNode }) { // (pt: ProvedorFinancas)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const balances = useMemo(() => computeBalances(journalEntries), [journalEntries]);

  useEffect(() => {
    const key = `${STORAGE_KEY_JOURNAL_PREFIX}${getMonthKey()}`;
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
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
          return;
        }
      }
      setJournalEntries(entries);
      setLastSavedAt(savedAt);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const saveMonth = () => { // (pt: salvarMes)
    const key = `${STORAGE_KEY_JOURNAL_PREFIX}${getMonthKey()}`;
    const payload = { savedAt: new Date().toISOString(), entries: journalEntries };
    try {
      localStorage.setItem(key, JSON.stringify(payload));
      setLastSavedAt(payload.savedAt);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMonth = () => { // (pt: carregarMes)
    const key = `${STORAGE_KEY_JOURNAL_PREFIX}${getMonthKey()}`;
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
          return;
        }
      }
      setJournalEntries(entries);
      setLastSavedAt(savedAt);
    } catch (error) {
      console.error(error);
    }
  };

  const addQuickEntry = (payload: QuickEntryPayload) => { // (pt: adicionarLancamentoRapido)
    const parcelInfo =
      (payload.type === "installment_purchase" || payload.type === "loan_installment") &&
      payload.parcelCount &&
      payload.parcelCount > 1
        ? ` (${payload.parcelCount}x)`
        : "";

    const newEntry: JournalEntry = {
      id: `JE${Date.now()}`,
      description: `${payload.description}${parcelInfo}`,
      lines: mapQuickEntryToLines(payload),
    };
    setJournalEntries((prev) => [...prev, newEntry]);
    setTimeout(() => saveMonth(), 0);
  };

  const value: FinanceContextValue = {
    accountPlan,
    journalEntries,
    lastSavedAt,
    balances,
    saveMonth,
    loadMonth,
    addQuickEntry,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

// Helpers para resumo base
export const carRentalMonthly = computeMonthlyFromWeekly(carRentalWeekly);
export const totalFixedExpenses =
  rentMonthly +
  powerMonthly +
  waterMonthly +
  carRentalMonthly +
  internetMonthly +
  streamingMonthly +
  chatgptMonthly;
export const freeCashFlow = monthlyCapacity - totalFixedExpenses;
export const targetSavings = monthlyCapacity * 0.03;
export { monthlyCapacity, formatCurrencyBRL };
