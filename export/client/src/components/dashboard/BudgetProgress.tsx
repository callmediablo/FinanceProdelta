import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface BudgetProgressProps {
  showCreateButton?: boolean;
}

export default function BudgetProgress({ showCreateButton = true }: BudgetProgressProps) {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['/api/budgets/1'],
  });

  return (
    <Card className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-lg">Budget-Tracker</h2>
        <Link href="/budgets">
          <a className="text-sm text-primary">Anpassen</a>
        </Link>
      </div>
      
      <div className="space-y-5">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))
        ) : budgets && budgets.length > 0 ? (
          budgets.map(budget => {
            const amount = parseFloat(budget.amount.toString());
            const spent = parseFloat(budget.spent.toString());
            const percentage = (spent / amount) * 100;
            const isOverBudget = spent > amount;
            
            return (
              <div key={budget.id}>
                <div className="flex justify-between mb-1">
                  <div className="font-medium">{budget.category}</div>
                  <div className="text-sm">
                    <span className={`font-medium ${isOverBudget ? 'text-danger' : ''}`}>{formatCurrency(spent)}</span>
                    <span className="text-neutral-500">/{formatCurrency(amount)}</span>
                  </div>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${isOverBudget ? 'bg-danger' : 'bg-secondary'}`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-neutral-500">
            <p>Keine Budgets vorhanden</p>
          </div>
        )}
      </div>
      
      {showCreateButton && (
        <Link href="/budgets">
          <Button className="w-full mt-5 py-2 text-center text-sm text-primary font-medium border border-primary rounded-md hover:bg-primary-light hover:text-white transition-colors" variant="outline">
            Budget erstellen
          </Button>
        </Link>
      )}
    </Card>
  );
}
