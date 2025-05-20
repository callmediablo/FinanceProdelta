import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTransactionSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Extend the schema for form validation
const formSchema = insertTransactionSchema.extend({
  amount: z.string().min(1, "Betrag ist erforderlich").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Betrag muss eine positive Zahl sein"
  ),
});

// Transaction categories
const categories = [
  "Lebensmittel",
  "Wohnen",
  "Transport",
  "Freizeit",
  "Shopping",
  "Gesundheit",
  "Bildung",
  "Reisen",
  "Unterhaltung",
  "Einkommen",
  "Sonstiges"
];

interface ExpenseFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function ExpenseForm({ onSubmit, isSubmitting }: ExpenseFormProps) {
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: 1,
      amount: "",
      description: "",
      category: "",
      type: "expense",
      date: new Date().toISOString(),
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Process the form data
    const finalAmount = transactionType === "expense" 
      ? parseFloat(data.amount) * -1 
      : parseFloat(data.amount);
    
    onSubmit({
      ...data,
      amount: finalAmount,
      type: transactionType,
    });
  };

  const handleTypeChange = (value: "income" | "expense") => {
    setTransactionType(value);
    form.setValue("type", value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Transaktionstyp</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => handleTypeChange(value as "income" | "expense")}
                    defaultValue="expense"
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="expense" id="expense" />
                      <label htmlFor="expense" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Ausgabe
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income" id="income" />
                      <label htmlFor="income" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Einnahme
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Betrag (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschreibung</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Einkauf bei REWE" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategorie</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
