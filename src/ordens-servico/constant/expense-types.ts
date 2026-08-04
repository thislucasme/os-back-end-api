// constants/expense-types.ts
export const EXPENSE_TYPES = [
  { id: 1, label: "Gasolina" },
  { id: 2, label: "Alimentação" },
  { id: 3, label: "Pedágio" },
  { id: 4, label: "Hotel" },
  { id: 5, label: "Hospedagem" },
  { id: 6, label: "Outros" },
];

export function getExpenseTypeLabel(id: number): string {
  const found = EXPENSE_TYPES.find(type => type.id === id);
  return found ? found.label : `Tipo ${id}`;
}