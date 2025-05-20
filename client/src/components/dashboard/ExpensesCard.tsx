import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ExpensesCard() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/1'],
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calculate monthly expenses
  const monthlyExpenses = transactions
    ? transactions
        .filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear &&
                 t.type === 'expense';
        })
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount.toString())), 0)
    : 0;

  return (
    <Card className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200 flex flex-col">
      <div className="text-neutral-500 text-sm mb-2">Ausgaben im {getMonthName()}</div>
      <div className="font-heading font-bold text-3xl mb-2 text-neutral-800">
        {isLoading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          formatCurrency(monthlyExpenses)
        )}
      </div>
      <div className="flex items-center text-danger mt-auto">
        <TrendingDown className="h-5 w-5" />
        <span className="ml-1 text-sm font-medium">+124,15 € im Vergleich zum Vormonat</span>
      </div>
    </Card>
  );
}

function getMonthName() {
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  return months[new Date().getMonth()];
}
