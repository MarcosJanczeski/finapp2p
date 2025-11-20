import { type Account, accountPlan } from "../finance-context";

export const typeAccountLabel: Record<string, string> = {
  Asset: "Ativo",
  Liability: "Passivo",
  Equity: "Patrimônio Líquido",
  Income: "Receita",
  Expense: "Despesa",
};

export function groupAccountsByType(plan: Account[] = accountPlan) {
  return plan.reduce<Record<string, Account[]>>((acc, account) => {
    acc[account.type] = acc[account.type] || [];
    acc[account.type].push(account);
    return acc;
  }, {});
}
