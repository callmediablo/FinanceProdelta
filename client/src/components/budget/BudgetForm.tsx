import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBudgetSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Extend the schema for form validation
const formSchema = insertBudgetSchema.extend({
  amount: z.string().min(1, "Betrag ist erforderlich").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Betrag muss eine positive Zahl sein"
  ),
});

// Budget categories
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
  "Sonstiges"
];

interface BudgetFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function BudgetForm({ onSubmit, onCancel, isSubmitting }: BudgetFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: 1,
      category: "",
      amount: "",
      period: "monthly",
      spent: 0,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({
      ...data,
      amount: parseFloat(data.amount),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
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

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget-Betrag (€)</FormLabel>
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
            name="period"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Zeitraum</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <label htmlFor="monthly" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Monatlich
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <label htmlFor="yearly" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Jährlich
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Abbrechen
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Wird erstellt..." : "Budget erstellen"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
