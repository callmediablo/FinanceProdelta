import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertSavingsGoal } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SavingsGoalForm from "@/components/savings/SavingsGoalForm";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Coins, Calendar, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function SavingsGoals() {
  const [showForm, setShowForm] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: savingsGoals } = useQuery({
    queryKey: ['/api/savings-goals/1'],
  });
  
  const createSavingsGoalMutation = useMutation({
    mutationFn: async (data: InsertSavingsGoal) => {
      const res = await apiRequest("POST", "/api/savings-goals", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings-goals/1'] });
      toast({
        title: "Sparziel erstellt",
        description: "Das Sparziel wurde erfolgreich erstellt.",
      });
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: `Das Sparziel konnte nicht erstellt werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });
  
  const contributeMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: number, amount: number }) => {
      const res = await apiRequest("PATCH", `/api/savings-goals/${id}`, { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings-goals/1'] });
      toast({
        title: "Betrag hinzugefügt",
        description: "Der Betrag wurde erfolgreich zum Sparziel hinzugefügt.",
      });
      setSelectedGoalId(null);
      setContributionAmount("");
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: `Der Betrag konnte nicht hinzugefügt werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });
  
  function handleAddSavingsGoal(data: InsertSavingsGoal) {
    createSavingsGoalMutation.mutate(data);
  }
  
  function handleContribute() {
    if (selectedGoalId && contributionAmount) {
      const amount = parseFloat(contributionAmount);
      if (!isNaN(amount) && amount > 0) {
        contributeMutation.mutate({ id: selectedGoalId, amount });
      } else {
        toast({
          title: "Fehler",
          description: "Bitte geben Sie einen gültigen Betrag ein.",
          variant: "destructive",
        });
      }
    }
  }
  
  function calculateProgress(current: number, target: number) {
    return Math.min(Math.round((current / target) * 100), 100);
  }
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-neutral-800 mb-2">
          Sparziele
        </h1>
        <p className="text-neutral-600">
          Definieren und verfolgen Sie Ihre finanziellen Ziele.
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-xl">Ihre Sparziele</h2>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Neues Sparziel
        </Button>
      </div>
      
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Neues Sparziel erstellen</CardTitle>
            <CardDescription>
              Definieren Sie ein neues finanzielles Ziel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SavingsGoalForm 
              onSubmit={handleAddSavingsGoal} 
              onCancel={() => setShowForm(false)}
              isSubmitting={createSavingsGoalMutation.isPending} 
            />
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {savingsGoals?.map(goal => {
          const progress = calculateProgress(
            parseFloat(goal.currentAmount.toString()), 
            parseFloat(goal.targetAmount.toString())
          );
          
          return (
            <Card key={goal.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-accent to-primary-light pb-6">
                <CardTitle className="text-white">{goal.name}</CardTitle>
                <CardDescription className="text-white opacity-80">
                  {goal.deadline && `Fällig am: ${formatDate(goal.deadline)}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-neutral-600">
                      <Target className="h-4 w-4 mr-1" />
                      <span>Ziel:</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(goal.targetAmount.toString()))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-neutral-600">
                      <Coins className="h-4 w-4 mr-1" />
                      <span>Gespart:</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(goal.currentAmount.toString()))}
                    </span>
                  </div>
                  
                  {goal.deadline && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-neutral-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Fällig:</span>
                      </div>
                      <span className="font-medium">
                        {formatDate(goal.deadline)}
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Fortschritt: {progress}%</span>
                      <span className="text-neutral-600">
                        {formatCurrency(parseFloat(goal.currentAmount.toString()))} / {formatCurrency(parseFloat(goal.targetAmount.toString()))}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 pb-4">
                <Dialog 
                  open={selectedGoalId === goal.id} 
                  onOpenChange={(open) => {
                    if (!open) {
                      setSelectedGoalId(null);
                      setContributionAmount("");
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => setSelectedGoalId(goal.id)}
                    >
                      Betrag hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Betrag zum Sparziel hinzufügen</DialogTitle>
                      <DialogDescription>
                        Fügen Sie einen Betrag zu Ihrem Sparziel "{goal.name}" hinzu.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="amount" className="text-sm font-medium">
                          Betrag (€)
                        </label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Betrag eingeben"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedGoalId(null);
                            setContributionAmount("");
                          }}
                        >
                          Abbrechen
                        </Button>
                        <Button 
                          onClick={handleContribute}
                          disabled={
                            !contributionAmount || 
                            parseFloat(contributionAmount) <= 0 ||
                            contributeMutation.isPending
                          }
                        >
                          Hinzufügen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          );
        })}
        
        {savingsGoals?.length === 0 && (
          <Card className="col-span-full p-8 text-center">
            <CardContent>
              <p className="text-neutral-600 mb-4">Sie haben noch keine Sparziele angelegt.</p>
              <Button onClick={() => setShowForm(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Erstes Sparziel erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
