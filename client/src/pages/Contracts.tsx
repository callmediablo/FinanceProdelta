import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertContract } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Calendar, FileText, DollarSign, RefreshCcw, Trash2, AlertCircle } from "lucide-react";
import ContractForm from "@/components/contracts/ContractForm";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Contracts() {
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<number | null>(null);
  const [deletingContract, setDeletingContract] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: contracts } = useQuery({
    queryKey: ['/api/contracts/1'],
  });
  
  const createContractMutation = useMutation({
    mutationFn: async (data: InsertContract) => {
      const res = await apiRequest("POST", "/api/contracts", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts/1'] });
      toast({
        title: "Vertrag erstellt",
        description: "Der Vertrag wurde erfolgreich gespeichert.",
      });
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: `Der Vertrag konnte nicht gespeichert werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });
  
  const updateContractMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertContract> }) => {
      const res = await apiRequest("PATCH", `/api/contracts/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts/1'] });
      toast({
        title: "Vertrag aktualisiert",
        description: "Der Vertrag wurde erfolgreich aktualisiert.",
      });
      setEditingContract(null);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: `Der Vertrag konnte nicht aktualisiert werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteContractMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contracts/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts/1'] });
      toast({
        title: "Vertrag gelöscht",
        description: "Der Vertrag wurde erfolgreich gelöscht.",
      });
      setDeletingContract(null);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: `Der Vertrag konnte nicht gelöscht werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });
  
  function handleAddContract(data: InsertContract) {
    createContractMutation.mutate(data);
  }
  
  function handleUpdateContract(data: InsertContract) {
    if (editingContract) {
      updateContractMutation.mutate({ id: editingContract, data });
    }
  }
  
  function handleDeleteContract() {
    if (deletingContract) {
      deleteContractMutation.mutate(deletingContract);
    }
  }
  
  function formatDate(dateString?: string) {
    if (!dateString) return 'Unbefristet';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  function getRenewalStatus(contract: any) {
    if (!contract.endDate) return null;
    
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) {
      return {
        type: 'warning',
        label: `Läuft in ${diffDays} Tagen ab`
      };
    }
    
    return null;
  }
  
  // Calculate monthly and yearly costs
  const monthlyCost = contracts?.reduce((sum, contract) => {
    const cost = parseFloat(contract.cost.toString());
    return sum + (contract.billingCycle === 'monthly' ? cost : cost / 12);
  }, 0) || 0;
  
  const yearlyCost = contracts?.reduce((sum, contract) => {
    const cost = parseFloat(contract.cost.toString());
    return sum + (contract.billingCycle === 'yearly' ? cost : cost * 12);
  }, 0) || 0;
  
  // Filter contracts by category
  const telecomContracts = contracts?.filter(c => c.category === 'Telekommunikation') || [];
  const insuranceContracts = contracts?.filter(c => c.category === 'Versicherung') || [];
  const entertainmentContracts = contracts?.filter(c => c.category === 'Unterhaltung') || [];
  const otherContracts = contracts?.filter(c => 
    c.category !== 'Telekommunikation' && 
    c.category !== 'Versicherung' && 
    c.category !== 'Unterhaltung'
  ) || [];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-neutral-800 mb-2">
          Vertragsmanager
        </h1>
        <p className="text-neutral-600">
          Behalten Sie den Überblick über Ihre laufenden Verträge und Abonnements.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monatliche Kosten</CardTitle>
            <CardDescription>Alle laufenden Verträge</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(monthlyCost)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Jährliche Kosten</CardTitle>
            <CardDescription>Hochgerechnet auf ein Jahr</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{formatCurrency(yearlyCost)}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-xl">Ihre Verträge</h2>
        <Button onClick={() => {
          setShowForm(true);
          setEditingContract(null);
        }} disabled={showForm || editingContract !== null}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Neuer Vertrag
        </Button>
      </div>
      
      {(showForm || editingContract !== null) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingContract !== null ? 'Vertrag bearbeiten' : 'Neuen Vertrag anlegen'}</CardTitle>
            <CardDescription>
              {editingContract !== null 
                ? 'Aktualisieren Sie die Details Ihres Vertrags' 
                : 'Geben Sie die Details Ihres neuen Vertrags ein'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContractForm 
              onSubmit={editingContract !== null ? handleUpdateContract : handleAddContract}
              onCancel={() => {
                setShowForm(false);
                setEditingContract(null);
              }}
              isSubmitting={createContractMutation.isPending || updateContractMutation.isPending}
              initialData={editingContract !== null 
                ? contracts?.find(c => c.id === editingContract) 
                : undefined}
            />
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="telecom">Telekommunikation</TabsTrigger>
          <TabsTrigger value="insurance">Versicherungen</TabsTrigger>
          <TabsTrigger value="entertainment">Unterhaltung</TabsTrigger>
          <TabsTrigger value="other">Sonstige</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {contracts?.map(contract => renderContractCard(contract))}
            {contracts?.length === 0 && renderEmptyState()}
          </div>
        </TabsContent>
        
        <TabsContent value="telecom">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {telecomContracts.map(contract => renderContractCard(contract))}
            {telecomContracts.length === 0 && renderEmptyState('Telekommunikation')}
          </div>
        </TabsContent>
        
        <TabsContent value="insurance">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {insuranceContracts.map(contract => renderContractCard(contract))}
            {insuranceContracts.length === 0 && renderEmptyState('Versicherungen')}
          </div>
        </TabsContent>
        
        <TabsContent value="entertainment">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {entertainmentContracts.map(contract => renderContractCard(contract))}
            {entertainmentContracts.length === 0 && renderEmptyState('Unterhaltung')}
          </div>
        </TabsContent>
        
        <TabsContent value="other">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {otherContracts.map(contract => renderContractCard(contract))}
            {otherContracts.length === 0 && renderEmptyState('Sonstige')}
          </div>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={deletingContract !== null} onOpenChange={(open) => !open && setDeletingContract(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vertrag löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Vertrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContract} className="bg-danger hover:bg-danger/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
  
  function renderContractCard(contract: any) {
    const renewalStatus = getRenewalStatus(contract);
    
    return (
      <Card key={contract.id} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{contract.name}</CardTitle>
              <CardDescription>{contract.provider}</CardDescription>
            </div>
            <Badge variant={contract.category === 'Versicherung' ? 'default' : 'outline'}>
              {contract.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-neutral-600">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>Kosten:</span>
              </div>
              <span className="font-medium">
                {formatCurrency(parseFloat(contract.cost.toString()))} / {contract.billingCycle === 'monthly' ? 'Monat' : 'Jahr'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-neutral-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Start:</span>
              </div>
              <span className="font-medium">
                {formatDate(contract.startDate)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-neutral-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Ende:</span>
              </div>
              <span className="font-medium">
                {formatDate(contract.endDate)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-neutral-600">
                <RefreshCcw className="h-4 w-4 mr-1" />
                <span>Verlängerung:</span>
              </div>
              <span className="font-medium">
                {contract.autoRenewal ? 'Automatisch' : 'Manuell'}
              </span>
            </div>
            
            {renewalStatus && (
              <div className="bg-warning/10 p-2 rounded-md flex items-center text-sm text-warning-foreground">
                <AlertCircle className="h-4 w-4 mr-2 text-warning" />
                {renewalStatus.label}
              </div>
            )}
            
            {contract.notes && (
              <div className="flex items-start gap-2 text-sm text-neutral-600">
                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{contract.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 pt-4 pb-4">
          <Button
            variant="outline" 
            className="flex-1"
            onClick={() => setEditingContract(contract.id)}
          >
            Bearbeiten
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setDeletingContract(contract.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  function renderEmptyState(category = '') {
    return (
      <Card className="col-span-full p-8 text-center">
        <CardContent>
          <p className="text-neutral-600 mb-4">
            {category 
              ? `Sie haben noch keine Verträge in der Kategorie "${category}" angelegt.`
              : 'Sie haben noch keine Verträge angelegt.'}
          </p>
          <Button onClick={() => {
            setShowForm(true);
            setEditingContract(null);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {category 
              ? `${category}vertrag anlegen`
              : 'Ersten Vertrag anlegen'}
          </Button>
        </CardContent>
      </Card>
    );
  }
}
