import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

export default function ExpenseChart() {
  const [period, setPeriod] = useState<"month" | "year">("month");
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/1'],
  });

  // Get current month and year for filtering
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filter transactions by period and type
  const filteredTransactions = transactions
    ? transactions.filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && (
          period === "month" 
            ? date.getMonth() === currentMonth && date.getFullYear() === currentYear
            : date.getFullYear() === currentYear
        );
      })
    : [];

  // Group transactions by category
  const expensesByCategory = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    const amount = Math.abs(parseFloat(transaction.amount.toString()));
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for chart
  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Chart colors
  const COLORS = [
    '#0F52BA', // primary
    '#34A853', // secondary
    '#20B2AA', // accent
    '#FFC107', // warning
    '#9C27B0', // purple
    '#ADB5BD', // neutral
  ];

  // Custom tooltip formatter
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-neutral-200 shadow-sm rounded-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-primary">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-lg">Ausgaben nach Kategorien</h2>
        <div className="flex space-x-2">
          <Button 
            variant={period === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("month")}
          >
            Monat
          </Button>
          <Button 
            variant={period === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("year")}
          >
            Jahr
          </Button>
        </div>
      </div>
      
      <div className="h-[280px] md:h-[280px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                iconSize={10}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
            <p>Keine Ausgaben im {period === "month" ? "aktuellen Monat" : "aktuellen Jahr"}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
