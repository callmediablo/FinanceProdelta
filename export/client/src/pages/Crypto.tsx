import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertCryptoHolding } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Trash2, 
  Coins, 
  Info, 
  AlertTriangle, 
  BarChart4, 
  Globe, 
  ArrowRight
} from "lucide-react";
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from "recharts";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

// Aktuelle Marktanalyse (Simuliert für 20. Mai 2025)
const MARKET_ANALYSIS = {
  globalTrends: [
    {
      id: 1,
      title: "Finanzpolitische Maßnahmen der EZB",
      impact: "hoch",
      description: "Die jüngste Senkung der Leitzinsen durch die EZB hat zu verstärktem Interesse an risikoreichen Anlagen geführt.",
      recommendation: "Positive Aussichten für Bitcoin und Ethereum als Inflationsschutz.",
      severity: "positive"
    },
    {
      id: 2,
      title: "Regulations-Update der EU",
      impact: "mittel",
      description: "Neue MiCA-Regulierungen der EU definieren klarere Regeln für Krypto-Assets.",
      recommendation: "Stablecoins und regulierte Plattformen könnten profitieren.",
      severity: "neutral"
    },
    {
      id: 3,
      title: "Weltweite Energiekrise",
      impact: "hoch",
      description: "Steigende Energiekosten beeinflussen Proof-of-Work Netzwerke negativ.",
      recommendation: "Proof-of-Stake Netzwerke wie Ethereum und Cardano könnten attraktiver werden.",
      severity: "warning"
    }
  ],
  cryptoRecommendations: [
    {
      currency: "BTC",
      sentiment: "bullish",
      priceTarget: "89,500€",
      rationale: "Institutionelle Akzeptanz steigt weiter, Halving-Effekt wirkt sich positiv aus",
      riskLevel: "mittel"
    },
    {
      currency: "ETH",
      sentiment: "bullish",
      priceTarget: "8,200€",
      rationale: "Staking-Renditen und DeFi-Wachstum treiben Nachfrage",
      riskLevel: "mittel"
    },
    {
      currency: "SOL",
      sentiment: "neutral",
      priceTarget: "280€",
      rationale: "Technische Verbesserungen, aber wachsende Konkurrenz durch andere L1-Blockchains",
      riskLevel: "hoch"
    },
    {
      currency: "XRP",
      sentiment: "bullish",
      priceTarget: "2,40€",
      rationale: "Regulatorische Klarheit und verstärkte Partnerschaften im Bankensektor",
      riskLevel: "mittel"
    }
  ]
};

export default function Crypto() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deletingHolding, setDeletingHolding] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    currency: "",
    amount: "",
    purchasePrice: "",
    currentPrice: "",
  });
  const [activeTab, setActiveTab] = useState("portfolio");
  
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
  
  // Prepare data for the 3D pie chart
  const chartData = useMemo(() => {
    return holdings?.map(holding => {
      const value = parseFloat(holding.amount.toString()) * parseFloat(holding.currentPrice.toString());
      return {
        id: holding.currency,
        label: holding.currency,
        value,
        color: CRYPTO_COLORS[Math.floor(Math.random() * CRYPTO_COLORS.length)]
      };
    }) || [];
  }, [holdings]);

  // Helper function to render severity icon
  const renderSeverityIcon = (severity: string) => {
    switch (severity) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-secondary" />;
      case "neutral":
        return <Info className="h-5 w-5 text-primary" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  // Helper function to render sentiment icon
  const renderSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="h-5 w-5 text-secondary" />;
      case "bearish":
        return <TrendingDown className="h-5 w-5 text-danger" />;
      case "neutral":
        return <ArrowRight className="h-5 w-5 text-neutral-500" />;
      default:
        return <ArrowRight className="h-5 w-5 text-neutral-500" />;
    }
  };

  // Helper function to get risk level style
  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case "niedrig":
        return "bg-secondary/20 text-secondary";
      case "mittel":
        return "bg-warning/20 text-warning";
      case "hoch":
        return "bg-danger/20 text-danger";
      default:
        return "bg-neutral-200 text-neutral-700";
    }
  };
  
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
      
      <Tabs defaultValue="portfolio" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full border-b">
          <TabsTrigger value="portfolio" className="text-base">Portfolio</TabsTrigger>
          <TabsTrigger value="marketAnalysis" className="text-base">Marktanalyse</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-base">Empfehlungen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio" className="space-y-6">
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
                          
                          // Find recommendation if exists
                          const recommendation = MARKET_ANALYSIS.cryptoRecommendations.find(
                            rec => rec.currency === holding.currency
                          );
                          
                          return (
                            <TableRow key={holding.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  {holding.currency}
                                  {recommendation && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="ml-2">
                                            {renderSentimentIcon(recommendation.sentiment)}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="font-medium">Prognose: {recommendation.priceTarget}</p>
                                          <p className="text-xs">{recommendation.rationale}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </TableCell>
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
                  <CardDescription>Aufschlüsselung nach Wert (3D-Visualisierung)</CardDescription>
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
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          labelLine={false}
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={CRYPTO_COLORS[index % CRYPTO_COLORS.length]} 
                              style={{
                                filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))',
                                opacity: 0.9
                              }}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)} 
                          labelFormatter={(name) => `${name}`}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            border: 'none',
                            padding: '12px'
                          }}
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
        </TabsContent>
        
        <TabsContent value="marketAnalysis" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>Globale Markttrends</CardTitle>
              </div>
              <CardDescription>Aktuelle weltwirtschaftliche Faktoren mit Auswirkungen auf Kryptowährungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {MARKET_ANALYSIS.globalTrends.map(trend => (
                  <div key={trend.id} className="p-4 rounded-lg border bg-card shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        {renderSeverityIcon(trend.severity)}
                        <h3 className="font-medium text-lg ml-2">{trend.title}</h3>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${trend.impact === 'hoch' ? 'bg-danger/10 text-danger' : 
                          trend.impact === 'mittel' ? 'bg-warning/10 text-warning' : 
                          'bg-secondary/10 text-secondary'}`}
                      >
                        Auswirkung: {trend.impact}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{trend.description}</p>
                    <div className="bg-neutral-50 p-2 rounded-md">
                      <p className="text-sm font-medium">{trend.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  <CardTitle>Marktvolumen-Entwicklung</CardTitle>
                </div>
                <CardDescription>Krypto-Markttrends der letzten 30 Tage</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
                  <div className="h-[240px] flex flex-col justify-end">
                    <div className="grid grid-cols-7 gap-1 h-[200px]">
                      {Array(7).fill(0).map((_, i) => {
                        const randomHeight = 30 + Math.random() * 70;
                        return (
                          <div key={i} className="flex flex-col items-center justify-end">
                            <div 
                              className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary-light"
                              style={{
                                height: `${randomHeight}%`,
                                filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))',
                                opacity: 0.9
                              }}
                            ></div>
                            <div className="text-xs text-neutral-500 mt-1">{`W${i+1}`}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-neutral-500">
                    Markttrend: +12.4% im letzten Monat
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <CardTitle>Marktsentiment</CardTitle>
                </div>
                <CardDescription>Aktuelles Anlegersentiment am Kryptomarkt</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  <div className="rounded-lg overflow-hidden bg-neutral-50 p-4">
                    <div className="text-center mb-4">
                      <div className="text-lg font-medium text-primary">Sentiment-Index</div>
                      <div className="text-3xl font-bold">67 / 100</div>
                      <div className="text-sm text-neutral-500 mt-1">Leicht bullish</div>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-secondary to-primary h-3 rounded-full"
                        style={{ 
                          width: '67%',
                          filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.2))'
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 mt-1">
                      <span>Bearish</span>
                      <span>Neutral</span>
                      <span>Bullish</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-neutral-600">
                    <p>
                      Das Marktsentiment ist derzeit leicht bullish mit einer positiven Tendenz für die kommenden Wochen.
                      Institutionelles Interesse nimmt zu, während regulatorische Unsicherheiten in wichtigen Märkten abnehmen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MARKET_ANALYSIS.cryptoRecommendations.map((rec, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className={`bg-gradient-to-r from-primary/10 to-secondary/10 pb-4`}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{rec.currency}</CardTitle>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1
                      ${rec.sentiment === 'bullish' ? 'bg-secondary text-white' : 
                        rec.sentiment === 'bearish' ? 'bg-danger text-white' : 
                        'bg-neutral-500 text-white'}`}
                    >
                      {renderSentimentIcon(rec.sentiment)}
                      <span>{rec.sentiment.charAt(0).toUpperCase() + rec.sentiment.slice(1)}</span>
                    </div>
                  </div>
                  <CardDescription>
                    Preisziel: <span className="font-medium">{rec.priceTarget}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">Begründung:</div>
                      <p className="text-sm">{rec.rationale}</p>
                    </div>
                    
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">Risikostufe:</div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelStyle(rec.riskLevel)}`}>
                        {rec.riskLevel}
                      </div>
                    </div>
                    
                    <div className="bg-neutral-50 p-3 rounded-md">
                      <div className="text-sm font-medium mb-1">Handlungsempfehlung:</div>
                      <p className="text-sm">
                        {rec.sentiment === 'bullish' 
                          ? 'Kauf oder Aufstockung bei Rücksetzern erwägen.' 
                          : rec.sentiment === 'bearish'
                          ? 'Positionen reduzieren oder vor weiteren Investitionen abwarten.'
                          : 'Bestehende Positionen halten, keine neuen Käufe tätigen.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" className="w-full">
                    Detailanalyse ansehen
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Personalisierte Empfehlungen</CardTitle>
              <CardDescription>Basierend auf Ihrem aktuellen Portfolio und Markttrends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings && holdings.length > 0 ? (
                  <>
                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <h3 className="font-medium text-primary mb-2">Portfolio-Diversifikation</h3>
                      <p className="text-sm text-neutral-700 mb-2">
                        Ihr Portfolio ist {holdings.length < 3 ? 'zu wenig diversifiziert' : 'ausreichend diversifiziert'}.
                        {holdings.length < 3 ? ' Wir empfehlen, weitere Kryptowährungen hinzuzufügen, um das Risiko zu streuen.' : ''}
                      </p>
                      {holdings.length < 3 && (
                        <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
                          <PlusCircle className="mr-2 h-3 w-3" />
                          Neue Währung hinzufügen
                        </Button>
                      )}
                    </div>
                    
                    <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5">
                      <h3 className="font-medium text-secondary mb-2">Marktchancen</h3>
                      <p className="text-sm text-neutral-700 mb-3">
                        Basierend auf Ihrem Portfolio und aktuellen Marktbedingungen könnten diese Kryptowährungen interessant sein:
                      </p>
                      <div className="space-y-2">
                        {!holdings.some(h => h.currency === "SOL") && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold mr-2">SOL</div>
                              <div>
                                <div className="font-medium">Solana (SOL)</div>
                                <div className="text-xs text-neutral-500">Smart Contracts Plattform mit hoher Skalierbarkeit</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              setFormData({...formData, currency: "SOL"});
                              setAddDialogOpen(true);
                            }}>
                              Hinzufügen
                            </Button>
                          </div>
                        )}
                        {!holdings.some(h => h.currency === "DOT") && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold mr-2">DOT</div>
                              <div>
                                <div className="font-medium">Polkadot (DOT)</div>
                                <div className="text-xs text-neutral-500">Multi-Chain Interoperabilität und Parachain-Ökosystem</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              setFormData({...formData, currency: "DOT"});
                              setAddDialogOpen(true);
                            }}>
                              Hinzufügen
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-neutral-600 mb-4">
                      Fügen Sie Kryptowährungen zu Ihrem Portfolio hinzu, um personalisierte Empfehlungen zu erhalten.
                    </p>
                    <Button onClick={() => setAddDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Portfolio erstellen
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
