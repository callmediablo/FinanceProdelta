import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BalanceCard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/1'],
  });

  return (
    <Card className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200 flex flex-col">
      <div className="text-neutral-500 text-sm mb-2">Aktueller Kontostand</div>
      <div className="font-heading font-bold text-3xl mb-2 text-neutral-800">
        {isLoading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          formatCurrency(user?.balance || 0)
        )}
      </div>
      <div className="flex items-center text-secondary mt-auto">
        <TrendingUp className="h-5 w-5" />
        <span className="ml-1 text-sm font-medium">+248,32 € seit letztem Monat</span>
      </div>
    </Card>
  );
}
