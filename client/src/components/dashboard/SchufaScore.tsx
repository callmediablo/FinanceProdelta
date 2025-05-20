import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function SchufaScore() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/1'],
  });

  const score = user?.schufaScore || 0;
  
  // Classification based on SCHUFA score
  const getClassification = (score: number) => {
    if (score >= 97) return "Ausgezeichnet";
    if (score >= 90) return "Sehr gut";
    if (score >= 80) return "Gut";
    if (score >= 67) return "Befriedigend";
    if (score >= 55) return "Ausreichend";
    if (score >= 40) return "Kritisch";
    return "Ungenügend";
  };

  // Preparing data for the doughnut chart
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score }
  ];

  return (
    <div className="relative w-48 h-48 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        {isLoading ? (
          <Skeleton className="h-12 w-20 mb-1" />
        ) : (
          <>
            <div className="text-4xl font-bold font-heading text-primary">{score}%</div>
            <div className="text-sm text-neutral-500">{getClassification(score)}</div>
          </>
        )}
      </div>
      
      {!isLoading && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={"70%"}
              outerRadius={"100%"}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#0F52BA" /> {/* Primary color for the score */}
              <Cell fill="#E9ECEF" /> {/* Light gray for the remaining */}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
