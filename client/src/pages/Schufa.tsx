import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import SchufaScore from "@/components/dashboard/SchufaScore";
import { InfoIcon, CheckCircle, AlertTriangle, XCircle, BookOpen, HelpCircle } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

export default function Schufa() {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/user/1'],
  });
  
  const schufaScore = user?.schufaScore || 92;
  
  const getScoreCategory = (score: number) => {
    if (score >= 97) return { label: "Hervorragend", color: "text-secondary" };
    if (score >= 90) return { label: "Sehr gut", color: "text-primary" };
    if (score >= 80) return { label: "Gut", color: "text-primary-light" };
    if (score >= 67) return { label: "Befriedigend", color: "text-accent" };
    if (score >= 55) return { label: "Ausreichend", color: "text-warning" };
    if (score >= 40) return { label: "Kritisch", color: "text-warning" };
    return { label: "Ungenügend", color: "text-danger" };
  };
  
  const scoreCategory = getScoreCategory(schufaScore);
  
  const getCreditOptions = (score: number) => {
    if (score >= 90) {
      return {
        mortgageRate: "1,2% - 1,5%",
        consumerCreditRate: "3,5% - 4,5%",
        creditCardLimit: "Hohe Limite verfügbar",
        leasing: "Beste Konditionen",
        status: "positive",
      };
    }
    if (score >= 80) {
      return {
        mortgageRate: "1,5% - 1,8%",
        consumerCreditRate: "4,5% - 5,5%",
        creditCardLimit: "Gute Limite verfügbar",
        leasing: "Gute Konditionen",
        status: "positive",
      };
    }
    if (score >= 67) {
      return {
        mortgageRate: "1,8% - 2,2%",
        consumerCreditRate: "5,5% - 7,0%",
        creditCardLimit: "Durchschnittliche Limite",
        leasing: "Standard-Konditionen",
        status: "neutral",
      };
    }
    if (score >= 55) {
      return {
        mortgageRate: "2,2% - 3,0%",
        consumerCreditRate: "7,0% - 9,0%",
        creditCardLimit: "Eingeschränkte Limite",
        leasing: "Erhöhte Raten",
        status: "warning",
      };
    }
    return {
      mortgageRate: "Schwer erhältlich",
      consumerCreditRate: "> 9,0% wenn überhaupt",
      creditCardLimit: "Nur Prepaid oder stark limitiert",
      leasing: "Kaum verfügbar oder hohe Sicherheiten",
      status: "negative",
    };
  };
  
  const creditOptions = getCreditOptions(schufaScore);
  
  const getScoreIcon = (status: string) => {
    switch (status) {
      case "positive":
        return <CheckCircle className="h-5 w-5 text-secondary" />;
      case "neutral":
        return <InfoIcon className="h-5 w-5 text-accent" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "negative":
        return <XCircle className="h-5 w-5 text-danger" />;
      default:
        return <HelpCircle className="h-5 w-5 text-neutral-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-neutral-800 mb-2">
          SCHUFA-Score
        </h1>
        <p className="text-neutral-600">
          Ihr aktueller Bonitätsstatus und Finanzierungsoptionen.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ihr aktueller Score</CardTitle>
              <CardDescription>
                Stand: {new Date().toLocaleDateString('de-DE')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-4 pb-8">
              <SchufaScore />
            </CardContent>
            <CardFooter className="flex flex-col items-center border-t pt-4">
              <p className="text-center mb-4">
                Ihr Score liegt im Bereich <span className={`font-bold ${scoreCategory.color}`}>{scoreCategory.label}</span>
              </p>
              <Button>Vollständigen Bericht ansehen</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ihre Finanzierungsoptionen</CardTitle>
              <CardDescription>
                Basierend auf Ihrem aktuellen SCHUFA-Score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(creditOptions.status)}
                    <h3 className="font-medium">Immobilienfinanzierung</h3>
                  </div>
                  <p className="font-bold">{creditOptions.mortgageRate}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(creditOptions.status)}
                    <h3 className="font-medium">Verbraucherkredit</h3>
                  </div>
                  <p className="font-bold">{creditOptions.consumerCreditRate}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(creditOptions.status)}
                    <h3 className="font-medium">Kreditkarte</h3>
                  </div>
                  <p className="font-bold">{creditOptions.creditCardLimit}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(creditOptions.status)}
                    <h3 className="font-medium">Leasing</h3>
                  </div>
                  <p className="font-bold">{creditOptions.leasing}</p>
                </div>
              </div>
              
              <div className="bg-primary-light/10 p-4 rounded-lg">
                <h3 className="font-medium text-primary mb-2 flex items-center">
                  <InfoIcon className="h-5 w-5 mr-2" />
                  Ihre Empfehlung
                </h3>
                <p className="text-neutral-700">
                  Mit Ihrem aktuellen Score haben Sie Zugang zu den besten Kreditkonditionen und Zinssätzen.
                  Jetzt ist ein guter Zeitpunkt für eine Immobilienfinanzierung oder Umschuldung.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Score verbessern</CardTitle>
              <CardDescription>
                Tipps zur Verbesserung Ihrer Bonität
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Zahlungsverpflichtungen pünktlich erfüllen</AccordionTrigger>
                  <AccordionContent>
                    Zahlen Sie Ihre Rechnungen, Kredite und sonstigen Verpflichtungen immer pünktlich. 
                    Verspätete Zahlungen werden negativ im Score berücksichtigt.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Zu viele Kreditanfragen vermeiden</AccordionTrigger>
                  <AccordionContent>
                    Jede Kreditanfrage kann Ihren Score vorübergehend senken. Stellen Sie daher nicht zu viele 
                    Kreditanträge in kurzer Zeit.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Kreditkartenlimits nicht ausreizen</AccordionTrigger>
                  <AccordionContent>
                    Nutzen Sie nicht mehr als 30% Ihres verfügbaren Kreditrahmens. Eine hohe Auslastung 
                    kann als Risikofaktor gewertet werden.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Regelmäßig SCHUFA-Auskunft prüfen</AccordionTrigger>
                  <AccordionContent>
                    Überprüfen Sie regelmäßig Ihre SCHUFA-Auskunft auf Richtigkeit. Falsche Einträge 
                    können Ihren Score negativ beeinflussen.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button variant="outline" className="w-full" leftIcon={<BookOpen className="mr-2 h-4 w-4" />}>
                <BookOpen className="mr-2 h-4 w-4" />
                Ratgeber zur Bonität lesen
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
