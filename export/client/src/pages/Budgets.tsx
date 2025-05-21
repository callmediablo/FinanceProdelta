import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertBudget } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BudgetForm from "@/components/budget/BudgetForm";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

export default function Budgets() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: budgets } = useQuery({
    queryKey: ['/api/budgets/1'],
  });
  
  const createBudgetMutation = useMutation({
    mutationFn: async (data: InsertBudget) => {
      const res = await apiRequest("POST", "/api/budgets", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets/1'] });
      toast({
        title: "Budget erstellt",
        description: "Das Budget wurde erfolgreich erstellt.",
      });
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: `Das Budget konnte nicht erstellt werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });
  
  // Calculate total budget and spent amounts
  const totalBudget = budgets?.reduce((sum, budget) => sum + parseFloat(budget.amount.toString()), 0) || 0;
  const totalSpent = budgets?.reduce((sum, budget) => sum + parseFloat(budget.spent.toString()), 0) || 0;
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  function handleAddBudget(data: InsertBudget) {
    createBudgetMutation.mutate(data);
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-neutral-800 mb-2">
          Budget-Planung
        </h1>
        <p className="text-neutral-600">
          Erstellen und verwalten Sie Ihre Budgets, um Ihre Finanzen im Griff zu haben.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gesamtbudget</CardTitle>
            <CardDescription>Monatlich</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ausgegeben</CardTitle>
            <CardDescription>Dieser Monat</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Verbleibend</CardTitle>
            <CardDescription>Noch verfügbar</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">{formatCurrency(totalBudget - totalSpent)}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-xl">Budget-Übersicht</h2>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Neues Budget
        </Button>
      </div>
      
      <div className="space-y-6">
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Neues Budget erstellen</CardTitle>
              <CardDescription>
                Legen Sie ein neues Budget für eine Kategorie fest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetForm 
                onSubmit={handleAddBudget} 
                onCancel={() => setShowForm(false)}
                isSubmitting={createBudgetMutation.isPending} 
              />
            </CardContent>
          </Card>
        )}
        
        <BudgetProgress showCreateButton={false} />
        
        <Card>
          <CardHeader>
            <CardTitle>Gesamtfortschritt</CardTitle>
            <CardDescription>
              {percentSpent.toFixed(0)}% Ihres Gesamtbudgets verbraucht
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <div>{formatCurrency(totalSpent)}</div>
                <div>{formatCurrency(totalBudget)}</div>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${percentSpent > 100 ? 'bg-danger' : 'bg-secondary'}`} 
                  style={{ width: `${Math.min(percentSpent, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
