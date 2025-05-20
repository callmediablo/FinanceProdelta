import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertCryptoHolding } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, TrendingUp, TrendingDown, RefreshCw, Trash2, Coins } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const CRYPTO_COLORS = [
  "#0F52BA", // primary
  "#34A853", // secondary
  "#20B2AA", // accent
  "#FFC107", // warning
  "#9C27B0", // purple
  "#ADB5BD", // neutral
];

const CRYPTO_CURRENCIES = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "ADA", label: "Cardano (ADA)" },
  { value: "XRP", label: "Ripple (XRP)" },
  { value: "SOL", label: "Solana (SOL)" },
  { value: "DOT", label: "Polkadot (DOT)" },
  { value: "AVAX", label: "Avalanche (AVAX)" },
  { value: "MATIC", label: "Polygon (MATIC)" },
];

export default function Crypto() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deletingHolding, setDeletingHolding] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    currency: "",
    amount: "",
    purchasePrice: "",
    currentPrice: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: holdings } = useQuery({
    queryKey: ['/api/crypto-holdings/1'],
  });
  
  const createHoldingMutation = useMutation({
    mutationFn: async (data: InsertCryptoHolding) => {
      const res = await apiRequest("POST", "/api/crypto-holdings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crypto-holdings/1'] });
      toast({
        title: "Kryptowährung hinzugefügt",
        description: "Die Kryptowährung wurde erfolgreich zu Ihrem Portfolio hinzugefügt.",
      });
      setAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: `Die Kryptowährung konnte nicht hinzugefügt werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteHoldingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/crypto-holdings/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crypto-holdings/1'] });
      toast({
        title: "Kryptowährung entfernt",
        description: "Die Kryptowährung wurde erfolgreich aus Ihrem Portfolio entfernt.",
      });
      setDeletingHolding(null);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: `Die Kryptowährung konnte nicht entfernt werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });
  
  function handleSubmit() {
    const amount = parseFloat(formData.amount);
    const purchasePrice = parseFloat(formData.purchasePrice);
    const currentPrice = parseFloat(formData.currentPrice);
    
    if (!formData.currency || isNaN(amount) || isNaN(purchasePrice) || isNaN(currentPrice)) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder korrekt aus.",
        variant: "destructive",
      });
      return;
    }
    
    createHoldingMutation.mutate({
      userId: 1,
      currency: formData.currency,
      amount,
      purchasePrice,
      currentPrice,
    });
  }
  
  function resetForm() {
    setFormData({
      currency: "",
      amount: "",
      purchasePrice: "",
      currentPrice: "",
    });
  }
  
  function handleDelete() {
    if (deletingHolding !== null) {
      deleteHoldingMutation.mutate(deletingHolding);
    }
  }
  
  // Calculate total portfolio value and profit/loss
  const totalValue = holdings?.reduce((sum, holding) => {
    return sum + parseFloat(holding.amount.toString()) * parseFloat(holding.currentPrice.toString());
  }, 0) || 0;
  
  const totalInvested = holdings?.reduce((sum, holding) => {
    return sum + parseFloat(holding.amount.toString()) * parseFloat(holding.purchasePrice.toString());
  }, 0) || 0;
  
  const totalProfitLoss = totalValue - totalInvested;
  const profitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
  
  // Prepare data for the pie chart
  const chartData = holdings?.map(holding => {
    const value = parseFloat(holding.amount.toString()) * parseFloat(holding.currentPrice.toString());
    return {
      name: holding.currency,
      value,
    };
  }) || [];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-neutral-800 mb-2">
          Krypto-Portfolio
        </h1>
        <p className="text-neutral-600">
          Überwachen Sie Ihre Kryptowährungen und verfolgen Sie Ihre Rendite.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Portfolio-Wert</CardTitle>
            <CardDescription>Aktueller Wert Ihrer Kryptowährungen</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Investiert</CardTitle>
            <CardDescription>Ursprünglich investierter Betrag</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-neutral-700">{formatCurrency(totalInvested)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gewinn/Verlust</CardTitle>
            <CardDescription>Gesamte Performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-secondary' : 'text-danger'}`}>
              {formatCurrency(totalProfitLoss)} ({profitLossPercentage.toFixed(2)}%)
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Ihre Bestände</CardTitle>
                <CardDescription>Alle Kryptowährungen in Ihrem Portfolio</CardDescription>
              </div>
              <Button onClick={() => setAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Hinzufügen
              </Button>
            </CardHeader>
            <CardContent>
              {holdings && holdings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Währung</TableHead>
                      <TableHead>Menge</TableHead>
                      <TableHead>Kaufpreis</TableHead>
                      <TableHead>Aktueller Preis</TableHead>
                      <TableHead>Wert</TableHead>
                      <TableHead>Gewinn/Verlust</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map(holding => {
                      const amount = parseFloat(holding.amount.toString());
                      const purchasePrice = parseFloat(holding.purchasePrice.toString());
                      const currentPrice = parseFloat(holding.currentPrice.toString());
                      const value = amount * currentPrice;
                      const invested = amount * purchasePrice;
                      const profitLoss = value - invested;
                      const profitLossPercentage = (profitLoss / invested) * 100;
                      
                      return (
                        <TableRow key={holding.id}>
                          <TableCell className="font-medium">{holding.currency}</TableCell>
                          <TableCell>{amount.toFixed(4)}</TableCell>
                          <TableCell>{formatCurrency(purchasePrice)}</TableCell>
                          <TableCell>{formatCurrency(currentPrice)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(value)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {profitLoss >= 0 ? (
                                <TrendingUp className="h-4 w-4 mr-1 text-secondary" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1 text-danger" />
                              )}
                              <span className={profitLoss >= 0 ? 'text-secondary' : 'text-danger'}>
                                {formatCurrency(profitLoss)} ({profitLossPercentage.toFixed(2)}%)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setDeletingHolding(holding.id)}
                            >
                              <Trash2 className="h-4 w-4 text-neutral-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-neutral-700 mb-1">Kein Krypto-Portfolio</h3>
                  <p className="text-neutral-500 mb-4">
                    Sie haben noch keine Kryptowährungen zu Ihrem Portfolio hinzugefügt.
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Erste Kryptowährung hinzufügen
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-center">
              <Button variant="outline" className="w-full max-w-xs">
                <RefreshCw className="mr-2 h-4 w-4" />
                Kurse aktualisieren
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Portfolio-Verteilung</CardTitle>
              <CardDescription>Aufschlüsselung nach Wert</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex justify-center items-center">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CRYPTO_COLORS[index % CRYPTO_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)} 
                      labelFormatter={(label) => `${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] w-full flex flex-col items-center justify-center text-neutral-400">
                  <Coins className="h-16 w-16 mb-4 opacity-20" />
                  <p>Fügen Sie Kryptowährungen hinzu,<br />um die Verteilung zu sehen</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kryptowährung hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie eine neue Kryptowährung zu Ihrem Portfolio hinzu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="currency">Kryptowährung</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Währung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_CURRENCIES.map(currency => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Menge</Label>
              <Input
                id="amount"
                type="number"
                step="0.0001"
                min="0.0001"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="z.B. 0.05"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="purchasePrice">Kaufpreis (€)</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="z.B. 45000"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="currentPrice">Aktueller Preis (€)</Label>
              <Input
                id="currentPrice"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                placeholder="z.B. 46500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddDialogOpen(false);
                resetForm();
              }}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createHoldingMutation.isPending}
            >
              {createHoldingMutation.isPending ? "Wird hinzugefügt..." : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deletingHolding !== null} onOpenChange={(open) => !open && setDeletingHolding(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kryptowährung entfernen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diese Kryptowährung aus Ihrem Portfolio entfernen möchten?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-danger hover:bg-danger/90">
              {deleteHoldingMutation.isPending ? "Wird entfernt..." : "Entfernen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
