/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

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

export type RecurrenceType = "expense" | "income"; // (pt: tipoRecorrencia)
export type RecurrenceFrequency = "monthly" | "weekly"; // (pt: frequenciaRecorrencia)

export type Recurrence = { // (pt: Recorrencia)
  id: string; // (pt: id)
  description: string; // (pt: descricao)
  amount: number; // (pt: valor)
  day: number; // (pt: diaVencimento)
  weekday?: number; // 0-6 (pt: diaSemana)
  type: RecurrenceType; // (pt: tipo)
  frequency: RecurrenceFrequency; // (pt: frequencia)
  categoryAccountId: string; // (pt: contaCategoria)
  counterAccountId: string; // (pt: contaContraPartida)
  startDate: string; // ISO (pt: inicio)
  endDate?: string; // ISO opcional (pt: fim)
  isActive: boolean; // (pt: ativa)
}; // (pt: Recorrencia)

export type RecurrenceOccurrence = { // (pt: OcorrenciaRecorrencia)
  id: string; // (pt: idOcorrencia)
  recurrenceId: string; // (pt: idRecorrencia)
  description: string; // (pt: descricao)
  amount: number; // (pt: valor)
  date: string; // ISO (pt: data)
  type: RecurrenceType; // (pt: tipo)
  frequency: RecurrenceFrequency; // (pt: frequencia)
  categoryAccountId: string; // (pt: contaCategoria)
  counterAccountId: string; // (pt: contaContraPartida)
};

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
  recurrences: Recurrence[]; // (pt: recorrencias)
  upcomingRecurrences: RecurrenceOccurrence[]; // (pt: recorrenciasPrevistas)
  saveMonth: () => void; // (pt: salvarMes)
  loadMonth: () => void; // (pt: carregarMes)
  addQuickEntry: (payload: QuickEntryPayload) => void; // (pt: adicionarLancamentoRapido)
  addRecurrence: (rec: Omit<Recurrence, "id" | "isActive">) => void; // (pt: adicionarRecorrencia)
  updateRecurrence: (rec: Recurrence) => void; // (pt: atualizarRecorrencia)
  deleteRecurrence: (id: string) => void; // (pt: excluirRecorrencia)
  toggleRecurrenceActive: (id: string, active: boolean) => void; // (pt: alternarRecorrenciaAtiva)
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

const recurrencesSeed: Recurrence[] = [
  {
    id: "R1",
    description: "Aluguel",
    amount: 1650,
    day: 5,
    type: "expense",
    frequency: "monthly",
    categoryAccountId: "X1",
    counterAccountId: "A1",
    startDate: "2024-01-01",
    isActive: true,
  },
  {
    id: "R2",
    description: "Salário",
    amount: 12000,
    day: 3,
    type: "income",
    frequency: "monthly",
    categoryAccountId: "I1",
    counterAccountId: "A2",
    startDate: "2024-01-01",
    isActive: true,
  },
  {
    id: "R3",
    description: "Internet",
    amount: 139.9,
    day: 10,
    type: "expense",
    frequency: "monthly",
    categoryAccountId: "X2",
    counterAccountId: "A2",
    startDate: "2024-01-01",
    isActive: true,
  },
  {
    id: "R4",
    description: "Corrida de app (semanal)",
    amount: 800,
    day: 1,
    weekday: 1,
    type: "income",
    frequency: "weekly",
    categoryAccountId: "I2",
    counterAccountId: "A2",
    startDate: "2024-01-01",
    isActive: true,
  },
]; // (pt: recorrenciasExemplo)

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

function loadFromStorage() { // (pt: carregarDoStorage)
  if (typeof localStorage === "undefined") return null;
  const key = `${STORAGE_KEY_JOURNAL_PREFIX}${getMonthKey()}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    let entries: JournalEntry[] = parsed;
    let savedAt: string | null = null;
    if (!Array.isArray(parsed)) {
      if (parsed && Array.isArray(parsed.entries)) {
        entries = parsed.entries;
        savedAt = parsed.savedAt ?? null;
      } else {
        return null;
      }
    }
    return { entries, savedAt };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function loadRecurrencesFromStorage(): Recurrence[] { // (pt: carregarRecorrenciasDoStorage)
  if (typeof localStorage === "undefined") return recurrencesSeed;
  const key = `${storagePrefix}:recurrences`;
  const raw = localStorage.getItem(key);
  if (!raw) return recurrencesSeed;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((rec) => ({
        ...rec,
        isActive: rec.isActive ?? true,
        frequency: rec.frequency ?? "monthly",
      }));
    }
    return recurrencesSeed;
  } catch (error) {
    console.error(error);
    return recurrencesSeed;
  }
}

function saveRecurrencesToStorage(recs: Recurrence[]) { // (pt: salvarRecorrenciasNoStorage)
  if (typeof localStorage === "undefined") return;
  const key = `${storagePrefix}:recurrences`;
  localStorage.setItem(key, JSON.stringify(recs));
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

function generateRecurrenceOccurrences(recurrences: Recurrence[], monthsAhead = 2, weeksAhead = 12): RecurrenceOccurrence[] { // (pt: gerarOcorrenciasRecorrencias)
  const now = new Date();
  const startYear = now.getFullYear();
  const startMonth = now.getMonth(); // 0-based
  const occurrences: RecurrenceOccurrence[] = [];

  recurrences.forEach((rec) => {
    if (!rec.isActive) return;
    if (rec.frequency === "monthly") {
      for (let i = 0; i <= monthsAhead; i += 1) {
        const monthDate = new Date(startYear, startMonth + i, rec.day);
        const iso = monthDate.toISOString().slice(0, 10);
        if (rec.startDate && iso < rec.startDate.slice(0, 10)) continue;
        if (rec.endDate && iso > rec.endDate.slice(0, 10)) continue;
        occurrences.push({
          id: `${rec.id}-${iso}`,
          recurrenceId: rec.id,
          description: rec.description,
          amount: rec.amount,
          date: iso,
          type: rec.type,
          frequency: rec.frequency,
          categoryAccountId: rec.categoryAccountId,
          counterAccountId: rec.counterAccountId,
        });
      }
    } else {
      const weekday = rec.weekday ?? 0;
      const today = new Date();
      const offset = (weekday - today.getDay() + 7) % 7;
      let firstDate = new Date(today);
      firstDate.setDate(today.getDate() + offset);

      for (let w = 0; w < weeksAhead; w += 1) {
        const occDate = new Date(firstDate);
        occDate.setDate(firstDate.getDate() + w * 7);
        const iso = occDate.toISOString().slice(0, 10);
        if (rec.startDate && iso < rec.startDate.slice(0, 10)) continue;
        if (rec.endDate && iso > rec.endDate.slice(0, 10)) continue;
        occurrences.push({
          id: `${rec.id}-${iso}`,
          recurrenceId: rec.id,
          description: rec.description,
          amount: rec.amount,
          date: iso,
          type: rec.type,
          frequency: rec.frequency,
          categoryAccountId: rec.categoryAccountId,
          counterAccountId: rec.counterAccountId,
        });
      }
    }
  });

  return occurrences.sort((a, b) => a.date.localeCompare(b.date));
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("FinanceContext not found");
  return ctx;
}

export function FinanceProvider({ children }: { children: React.ReactNode }) { // (pt: ProvedorFinancas)
  const initial = loadFromStorage();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initial?.entries ?? initialJournalEntries);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initial?.savedAt ?? null);
  const [recurrences, setRecurrences] = useState<Recurrence[]>(loadRecurrencesFromStorage());

  const balances = useMemo(() => computeBalances(journalEntries), [journalEntries]);
  const upcomingRecurrences = useMemo(() => generateRecurrenceOccurrences(recurrences), [recurrences]);

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
    recurrences,
    upcomingRecurrences,
    saveMonth,
    loadMonth,
    addQuickEntry,
    addRecurrence(rec) {
      const newRec: Recurrence = { ...rec, id: `R${Date.now()}`, isActive: true };
      setRecurrences((prev) => {
        const updated = [...prev, newRec];
        saveRecurrencesToStorage(updated);
        return updated;
      });
    },
    updateRecurrence(updated) {
      setRecurrences((prev) => {
        const merged = prev.map((rec) => (rec.id === updated.id ? { ...updated } : rec));
        saveRecurrencesToStorage(merged);
        return merged;
      });
    },
    deleteRecurrence(id) {
      setRecurrences((prev) => {
        const filtered = prev.filter((rec) => rec.id !== id);
        saveRecurrencesToStorage(filtered);
        return filtered;
      });
    },
    toggleRecurrenceActive(id, active) {
      setRecurrences((prev) => {
        const updated = prev.map((rec) => (rec.id === id ? { ...rec, isActive: active } : rec));
        saveRecurrencesToStorage(updated);
        return updated;
      });
    },
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
