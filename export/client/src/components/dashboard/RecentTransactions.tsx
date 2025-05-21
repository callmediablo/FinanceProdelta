import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { ShoppingBag, CreditCard, Receipt, DollarSign, PlusCircle } from "lucide-react";

interface RecentTransactionsProps {
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export default function RecentTransactions({ showAddButton = true, onAddClick }: RecentTransactionsProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/1'],
  });
  
  // Get recent transactions (latest 4)
  const recentTransactions = transactions 
    ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)
    : [];

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'lebensmittel':
        return <ShoppingBag className="h-5 w-5" />;
      case 'einkommen':
        return <DollarSign className="h-5 w-5" />;
      case 'unterhaltung':
        return <CreditCard className="h-5 w-5" />;
      case 'shopping':
        return <ShoppingBag className="h-5 w-5" />;
      default:
        return <Receipt className="h-5 w-5" />;
    }
  };

  // Category background color mapping
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'lebensmittel':
        return 'bg-primary-light';
      case 'einkommen':
        return 'bg-secondary-light';
      case 'unterhaltung':
        return 'bg-neutral-400';
      case 'shopping':
        return 'bg-accent';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-lg">Letzte Transaktionen</h2>
        <Link href="/expenses">
          <a className="text-primary text-sm font-medium">Alle anzeigen</a>
        </Link>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center py-2 border-b border-neutral-100">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="ml-4 flex-grow">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-16 mb-1 ml-auto" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
            </div>
          ))
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map((transaction, index) => (
            <div 
              key={transaction.id} 
              className={`flex items-center py-2 ${
                index < recentTransactions.length - 1 ? 'border-b border-neutral-100' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 ${getCategoryColor(transaction.category)} rounded-full flex items-center justify-center text-white`}>
                {getCategoryIcon(transaction.category)}
              </div>
              <div className="ml-4 flex-grow">
                <div className="font-medium">{transaction.description}</div>
                <div className="text-sm text-neutral-500">{transaction.category}</div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${parseFloat(transaction.amount.toString()) < 0 ? 'text-danger' : 'text-secondary'}`}>
                  {parseFloat(transaction.amount.toString()) < 0 
                    ? formatCurrency(parseFloat(transaction.amount.toString()) * -1, true) 
                    : formatCurrency(parseFloat(transaction.amount.toString()), true)}
                </div>
                <div className="text-sm text-neutral-500">{formatRelativeDate(new Date(transaction.date))}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-neutral-500">
            <p>Keine Transaktionen vorhanden</p>
          </div>
        )}
      </div>
      
      {showAddButton && (
        <Button 
          variant="outline" 
          className="w-full mt-4 py-2 text-center text-sm text-primary font-medium border border-primary rounded-md hover:bg-primary-light hover:text-white transition-colors"
          onClick={onAddClick}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Transaktion hinzufügen
        </Button>
      )}
    </Card>
  );
}
