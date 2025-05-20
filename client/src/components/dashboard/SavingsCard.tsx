import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function SavingsCard() {
  const { data: savingsGoals, isLoading } = useQuery({
    queryKey: ['/api/savings-goals/1'],
  });

  // Get the first savings goal (for the dashboard card)
  const mainGoal = savingsGoals && savingsGoals.length > 0 ? savingsGoals[0] : null;
  
  const currentAmount = mainGoal ? parseFloat(mainGoal.currentAmount.toString()) : 0;
  const targetAmount = mainGoal ? parseFloat(mainGoal.targetAmount.toString()) : 0;
  const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  return (
    <Card className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200 flex flex-col">
      <div className="text-neutral-500 text-sm mb-2">Sparfortschritt</div>
      <div className="font-heading font-bold text-3xl mb-2 text-neutral-800">
        {isLoading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          formatCurrency(currentAmount)
        )}
      </div>
      <div className="w-full bg-neutral-100 rounded-full h-2.5 mt-auto mb-2">
        <div 
          className="bg-accent h-2.5 rounded-full" 
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        ></div>
      </div>
      <div className="text-sm text-neutral-600">
        {isLoading ? (
          <Skeleton className="h-4 w-full" />
        ) : mainGoal ? (
          `${Math.round(progressPercentage)}% zum ${mainGoal.name} (${formatCurrency(targetAmount)})`
        ) : (
          "Kein aktives Sparziel"
        )}
      </div>
    </Card>
  );
}
