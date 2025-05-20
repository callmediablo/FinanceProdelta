import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTransaction } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ExpenseForm from "@/components/expense/ExpenseForm";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { formatCurrency } from "@/lib/utils";

export default function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState("transactions");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions/1'],
  });
  
  const createTransactionMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budgets/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/1'] });
      toast({
        title: "Transaktion hinzugefügt",
        description: "Die Transaktion wurde erfolgreich gespeichert.",
      });
      setActiveTab("transactions");
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: `Die Transaktion konnte nicht gespeichert werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });
  
  // Calculate total income and expenses for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions?.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }) || [];
  
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()) * -1, 0);
  
  function handleAddTransaction(data: InsertTransaction) {
    createTransactionMutation.mutate(data);
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-neutral-800 mb-2">
          Ausgabentracker
        </h1>
        <p className="text-neutral-600">
          Verwalten Sie Ihre Einnahmen und Ausgaben und behalten Sie den Überblick.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Einnahmen (Dieser Monat)</CardTitle>
            <CardDescription>Alle Einnahmen im laufenden Monat</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">{formatCurrency(monthlyIncome)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ausgaben (Dieser Monat)</CardTitle>
            <CardDescription>Alle Ausgaben im laufenden Monat</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-danger">{formatCurrency(monthlyExpenses)}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="transactions">Transaktionen</TabsTrigger>
          <TabsTrigger value="add">Neue Transaktion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-6">
          <ExpenseChart />
          <RecentTransactions showAddButton={true} onAddClick={() => setActiveTab("add")} />
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Neue Transaktion hinzufügen</CardTitle>
              <CardDescription>
                Fügen Sie eine neue Einnahme oder Ausgabe hinzu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm onSubmit={handleAddTransaction} isSubmitting={createTransactionMutation.isPending} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
