import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertContract } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { 
  PlusCircle, 
  Calendar, 
  FileText, 
  DollarSign, 
  RefreshCcw, 
  Trash2, 
  AlertCircle, 
  Percent, 
  ArrowRight, 
  TrendingDown, 
  ExternalLink,
  Search,
  Sparkles
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Simulierte Marktdaten für Vertragsangebote (Stand: 20. Mai 2025)
// Diese Daten würden normalerweise von einer externen API kommen
const MARKET_OFFERS = {
  "Telekommunikation": [
    {
      provider: "Telekom",
      name: "MagentaMobil S",
      description: "5G Smartphone-Tarif mit 10GB Datenvolumen",
      cost: 19.95,
      billingCycle: "monthly",
      benefits: [
        "10GB Datenvolumen mit 5G",
        "Alle Netze Flat",
        "EU-Roaming inklusive",
        "StreamOn Music inklusive"
      ],
      url: "https://www.telekom.de"
    },
    {
      provider: "Vodafone",
      name: "Red S",
      description: "5G Smartphone-Tarif mit 12GB Datenvolumen",
      cost: 17.99,
      billingCycle: "monthly",
      benefits: [
        "12GB Datenvolumen mit 5G",
        "Alle Netze Flat",
        "EU-Roaming inklusive",
        "Vodafone Pass inklusive"
      ],
      url: "https://www.vodafone.de"
    },
    {
      provider: "o2",
      name: "o2 Mobile M",
      description: "5G Smartphone-Tarif mit 25GB Datenvolumen",
      cost: 16.99,
      billingCycle: "monthly",
      benefits: [
        "25GB Datenvolumen mit 5G",
        "Alle Netze Flat",
        "EU-Roaming inklusive",
        "Unlimited Messaging in Apps"
      ],
      url: "https://www.o2online.de"
    },
    {
      provider: "1&1",
      name: "All-Net-Flat 5G L",
      description: "5G Smartphone-Tarif mit 40GB Datenvolumen",
      cost: 19.99,
      billingCycle: "monthly",
      benefits: [
        "40GB Datenvolumen mit 5G",
        "Alle Netze Flat",
        "EU-Roaming inklusive",
        "IPTV inklusive"
      ],
      url: "https://www.1und1.de"
    },
    {
      provider: "Vodafone",
      name: "Red Internet & Phone 100 Cable",
      description: "Kabel-Internet mit bis zu 100 Mbit/s",
      cost: 29.99,
      billingCycle: "monthly",
      benefits: [
        "100 Mbit/s Download",
        "10 Mbit/s Upload",
        "Festnetz-Flat",
        "Kein Anschlusspreis bei Online-Buchung"
      ],
      url: "https://www.vodafone.de"
    },
    {
      provider: "Telekom",
      name: "MagentaZuhause M",
      description: "DSL-Internet mit bis zu 100 Mbit/s",
      cost: 34.95,
      billingCycle: "monthly",
      benefits: [
        "100 Mbit/s Download",
        "40 Mbit/s Upload",
        "Festnetz-Flat",
        "WLAN-Router inklusive"
      ],
      url: "https://www.telekom.de"
    },
    {
      provider: "o2",
      name: "o2 HomeSpot 5G",
      description: "5G-Router für zu Hause mit unbegrenztem Datenvolumen",
      cost: 24.99,
      billingCycle: "monthly",
      benefits: [
        "Unbegrenztes Datenvolumen",
        "5G Geschwindigkeit",
        "Keine Leitungsverlegung nötig",
        "Flexible Einrichtung ohne Techniker"
      ],
      url: "https://www.o2online.de"
    }
  ],
  "Unterhaltung": [
    {
      provider: "Netflix",
      name: "Standard",
      description: "Streaming-Dienst mit Full-HD Qualität",
      cost: 13.99,
      billingCycle: "monthly",
      benefits: [
        "Full-HD Streaming",
        "Auf 2 Geräten gleichzeitig",
        "Unbegrenzte Filme und Serien",
        "Werbefrei"
      ],
      url: "https://www.netflix.com"
    },
    {
      provider: "Disney+",
      name: "Standard",
      description: "Streaming-Dienst mit Full-HD Qualität",
      cost: 9.99,
      billingCycle: "monthly",
      benefits: [
        "Full-HD Streaming",
        "Auf 2 Geräten gleichzeitig",
        "Disney, Marvel, Star Wars, National Geographic",
        "Werbefrei"
      ],
      url: "https://www.disneyplus.com"
    },
    {
      provider: "Spotify",
      name: "Familie",
      description: "Musik-Streaming für bis zu 6 Familienmitglieder",
      cost: 14.99,
      billingCycle: "monthly",
      benefits: [
        "Bis zu 6 separate Konten",
        "Werbefrei",
        "Offline-Hören",
        "Zugriff auf über 80 Millionen Songs"
      ],
      url: "https://www.spotify.com"
    },
    {
      provider: "Amazon",
      name: "Prime",
      description: "Amazon Prime Mitgliedschaft mit Prime Video",
      cost: 8.99,
      billingCycle: "monthly",
      benefits: [
        "Kostenloser Premiumversand",
        "Prime Video",
        "Prime Music",
        "Prime Reading"
      ],
      url: "https://www.amazon.de"
    }
  ],
  "Versicherung": [
    {
      provider: "HUK-COBURG",
      name: "Premium Haftpflicht",
      description: "Private Haftpflichtversicherung mit umfassendem Schutz",
      cost: 52.00,
      billingCycle: "yearly",
      benefits: [
        "Deckungssumme bis 50 Mio. €",
        "Schlüsselverlust abgedeckt",
        "Mietsachschäden inklusive",
        "Forderungsausfalldeckung"
      ],
      url: "https://www.huk.de"
    },
    {
      provider: "Allianz",
      name: "Hausrat Komfort",
      description: "Hausratversicherung mit Komfortschutz",
      cost: 68.50,
      billingCycle: "yearly",
      benefits: [
        "Neuwerterstattung",
        "Überspannungsschäden inklusive",
        "Glas- und Frostschäden abgedeckt",
        "Fahrraddiebstahl bis 1.000€"
      ],
      url: "https://www.allianz.de"
    },
    {
      provider: "Generali",
      name: "KFZ-Versicherung Comfort",
      description: "Kfz-Versicherung mit Vollkasko",
      cost: 445.00,
      billingCycle: "yearly",
      benefits: [
        "Vollkasko mit Teilkasko",
        "GAP-Deckung",
        "Marderbissschäden inklusive",
        "Werkstattbindung optional"
      ],
      url: "https://www.generali.de"
    }
  ]
};

// Bestimmung des besten Angebots und des Sparpotenzials
const findBestOffers = (contract: any) => {
  // Kategoriebasierte Vertragsangebote finden
  const categoryOffers = MARKET_OFFERS[contract.category as keyof typeof MARKET_OFFERS] || [];
  
  if (categoryOffers.length === 0) return null;
  
  // Ähnliche Angebote nach Name, Provider oder Beschreibung filtern
  const similarOffers = categoryOffers.filter(offer => {
    const contractNameLower = contract.name.toLowerCase();
    const offerNameLower = offer.name.toLowerCase();
    const contractProviderLower = contract.provider.toLowerCase();
    const offerProviderLower = offer.provider.toLowerCase();
    
    return (
      contractNameLower.includes(offerNameLower) || 
      offerNameLower.includes(contractNameLower) ||
      contractProviderLower.includes(offerProviderLower) ||
      offerProviderLower.includes(contractProviderLower)
    );
  });
  
  // Wenn keine ähnlichen Angebote gefunden wurden, alle Angebote der Kategorie verwenden
  const relevantOffers = similarOffers.length > 0 ? similarOffers : categoryOffers;
  
  // Kosten normalisieren (monatlich/jährlich)
  const currentCost = parseFloat(contract.cost.toString());
  const normalizedCurrentCost = contract.billingCycle === 'yearly' ? currentCost / 12 : currentCost;
  
  // Angebote sortieren (günstigstes zuerst)
  const sortedOffers = relevantOffers
    .map(offer => ({
      ...offer,
      normalizedCost: offer.billingCycle === 'yearly' ? offer.cost / 12 : offer.cost
    }))
    .sort((a, b) => a.normalizedCost - b.normalizedCost);
  
  // Günstigstes Angebot ermitteln
  const bestOffer = sortedOffers[0];
  
  if (!bestOffer) return null;
  
  // Sparpotenzial berechnen (monatlich)
  const monthlySavings = normalizedCurrentCost - bestOffer.normalizedCost;
  const yearlySavings = monthlySavings * 12;
  const savingsPercentage = (monthlySavings / normalizedCurrentCost) * 100;
  
  // Keine Empfehlung, wenn kein Sparpotenzial
  if (monthlySavings <= 0) return null;
  
  return {
    bestOffer,
    monthlySavings,
    yearlySavings,
    savingsPercentage,
    alternativeOffers: sortedOffers.slice(1, 4) // Bis zu 3 weitere Alternativen
  };
};

export default function Contracts() {
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<number | null>(null);
  const [deletingContract, setDeletingContract] = useState<number | null>(null);
  const [comparingContract, setComparingContract] = useState<number | null>(null);
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

      {/* Vertragsvergleich-Dialog */}
      <Dialog open={comparingContract !== null} onOpenChange={(open) => !open && setComparingContract(null)}>
        <DialogContent className="max-w-4xl">
          {comparingContract !== null && contracts && (() => {
            const contract = contracts.find(c => c.id === comparingContract);
            if (!contract) return null;
            
            const savingsAnalysis = findBestOffers(contract);
            if (!savingsAnalysis) return null;
            
            const { bestOffer, monthlySavings, yearlySavings, savingsPercentage, alternativeOffers } = savingsAnalysis;
            const currentCost = parseFloat(contract.cost.toString());
            const normalizedCurrentCost = contract.billingCycle === 'yearly' ? currentCost / 12 : currentCost;
            
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <DialogTitle>Sparpotenzial für "{contract.name}"</DialogTitle>
                  </div>
                  <DialogDescription>
                    Basierend auf unserer Marktrecherche vom 20. Mai 2025 haben wir günstigere Angebote für Sie gefunden.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-secondary">Ihr Sparpotenzial</h3>
                        <p className="text-sm text-neutral-600">Bei einem Wechsel zu {bestOffer.provider} könnten Sie sparen:</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-secondary">{formatCurrency(yearlySavings)}</div>
                        <div className="text-sm text-neutral-600">pro Jahr ({formatCurrency(monthlySavings)} / Monat)</div>
                      </div>
                    </div>
                    
                    <div className="relative pt-1">
                      <div className="text-xs text-neutral-600 flex justify-between mb-1">
                        <span>Aktuelle Kosten: {formatCurrency(normalizedCurrentCost)}/Monat</span>
                        <span>Neue Kosten: {formatCurrency(bestOffer.normalizedCost)}/Monat</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full bg-neutral-200 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-secondary rounded-full h-2.5" 
                            style={{ width: `${100 - savingsPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-secondary">{savingsPercentage.toFixed(0)}% günstiger</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Bestes Angebot</h3>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>{bestOffer.name}</CardTitle>
                            <CardDescription>{bestOffer.provider}</CardDescription>
                          </div>
                          <Badge className="bg-secondary text-white">Empfohlen</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm">{bestOffer.description}</p>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">Kosten:</span>
                            <span className="font-medium">{formatCurrency(bestOffer.cost)} / {bestOffer.billingCycle === 'monthly' ? 'Monat' : 'Jahr'}</span>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-1">Vorteile:</p>
                            <ul className="text-sm space-y-1">
                              {bestOffer.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-center">
                                  <ArrowRight className="h-3 w-3 mr-2 text-secondary flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3">
                        <Button className="w-full" onClick={() => window.open(bestOffer.url, '_blank')}>
                          Zum Anbieter
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  {alternativeOffers && alternativeOffers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Alternative Angebote</h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {alternativeOffers.map((offer, i) => (
                          <Card key={i} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{offer.name}</CardTitle>
                              <CardDescription>{offer.provider}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm">
                              <p className="mb-2">{offer.description}</p>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Kosten:</span>
                                <span className="font-medium">{formatCurrency(offer.cost)} / {offer.billingCycle === 'monthly' ? 'Monat' : 'Jahr'}</span>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-3">
                              <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(offer.url, '_blank')}>
                                Details ansehen
                                <ExternalLink className="h-3 w-3 ml-2" />
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-600">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 mr-2 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="mb-2">
                          <strong>Hinweis zum Vertragswechsel:</strong> Prüfen Sie vor einem Wechsel die Kündigungsfristen Ihres aktuellen Vertrags.
                        </p>
                        <p>
                          Diese Empfehlungen basieren auf öffentlich verfügbaren Informationen der Anbieter und können vom tatsächlichen Angebot abweichen. 
                          Bitte vergleichen Sie die genauen Leistungen und Konditionen direkt beim Anbieter.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setComparingContract(null)}>
                    Schließen
                  </Button>
                  <Button onClick={() => {
                    if (bestOffer) {
                      window.open(bestOffer.url, '_blank');
                      setComparingContract(null);
                    }
                  }}>
                    Bestes Angebot ansehen
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function renderContractCard(contract: any) {
    const renewalStatus = getRenewalStatus(contract);
    const savingsAnalysis = findBestOffers(contract);
    
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
            
            {savingsAnalysis && (
              <div className="bg-secondary/10 p-2 rounded-md flex items-center justify-between text-sm text-secondary">
                <div className="flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-secondary" />
                  <span>Sparpotenzial entdeckt!</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-secondary"
                        onClick={() => setComparingContract(contract.id)}
                      >
                        Vergleichen
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bis zu {formatCurrency(savingsAnalysis.yearlySavings)} pro Jahr sparen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
