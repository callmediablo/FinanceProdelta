import { useQuery } from "@tanstack/react-query";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ExpensesCard from "@/components/dashboard/ExpensesCard";
import SavingsCard from "@/components/dashboard/SavingsCard";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import SchufaScore from "@/components/dashboard/SchufaScore";
import FeatureCard from "@/components/dashboard/FeatureCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/user/1'],
  });
  
  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-neutral-800 mb-2">
          Willkommen zurück, {isUserLoading ? <Skeleton className="h-8 w-32 inline-block" /> : user?.firstName}!
        </h1>
        <p className="text-neutral-600">
          Hier ist ein Überblick über Ihre Finanzen für den Monat August.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <BalanceCard />
        <ExpensesCard />
        <SavingsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <ExpenseChart />
          <RecentTransactions />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <BudgetProgress />
          <SchufaScore />
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mt-8">
        <h2 className="font-heading font-semibold text-xl mb-5">Weitere Funktionen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <FeatureCard 
            title="Krypto-Portfolio"
            description="Verfolgen Sie Ihre Kryptowährungen und sehen Sie alles an einem Ort."
            colorFrom="from-blue-500" 
            colorTo="to-purple-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
            }
            stats={
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">BTC: </span>
                  <span className="text-secondary">+3,2%</span>
                </div>
                <div>
                  <span className="font-medium">ETH: </span>
                  <span className="text-danger">-1,8%</span>
                </div>
              </div>
            }
            buttonText="Portfolio ansehen"
            linkTo="/crypto"
          />
          
          <FeatureCard
            title="Vertragsmanager"
            description="Behalten Sie alle Verträge im Blick und finden Sie Einsparpotentiale."
            colorFrom="from-green-500" 
            colorTo="to-teal-500"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            }
            stats={
              <div className="bg-neutral-50 p-2 rounded-md text-sm">
                <div className="font-medium text-danger">1 Vertrag läuft bald ab!</div>
              </div>
            }
            buttonText="Verträge verwalten"
            linkTo="/contracts"
          />
          
          <FeatureCard
            title="Sparziele"
            description="Definieren Sie Ihre Ziele und verfolgen Sie Ihren Fortschritt."
            colorFrom="from-amber-400" 
            colorTo="to-orange-500"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
            }
            stats={
              <div className="space-y-2">
                <div className="text-sm text-neutral-600">Urlaub Italien</div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            }
            buttonText="Ziele verwalten"
            linkTo="/savings"
          />
          
          <FeatureCard
            title="Anbietervergleich"
            description="Finden Sie die besten Angebote basierend auf Ihren Bedürfnissen."
            colorFrom="from-blue-400" 
            colorTo="to-indigo-500"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            }
            stats={
              <div className="bg-neutral-50 p-2 rounded-md text-sm">
                <div className="font-medium text-secondary">Sparpotential: ~23€/Monat</div>
              </div>
            }
            buttonText="Angebote anzeigen"
            linkTo="/contracts"
          />
        </div>
      </div>
    </>
  );
}
