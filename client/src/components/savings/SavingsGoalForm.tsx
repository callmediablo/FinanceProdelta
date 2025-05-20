import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSavingsGoalSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Extend the schema for form validation
const formSchema = insertSavingsGoalSchema.extend({
  name: z.string().min(1, "Name des Sparziels ist erforderlich"),
  targetAmount: z.string().min(1, "Zielbetrag ist erforderlich").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Zielbetrag muss eine positive Zahl sein"
  ),
  currentAmount: z.string().refine(
    (val) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
    "Aktueller Betrag muss eine positive Zahl sein oder leer"
  ).optional(),
  deadline: z.date().optional(),
});

interface SavingsGoalFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function SavingsGoalForm({ onSubmit, onCancel, isSubmitting }: SavingsGoalFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: 1,
      name: "",
      targetAmount: "",
      currentAmount: "0",
      deadline: undefined,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({
      ...data,
      targetAmount: parseFloat(data.targetAmount),
      currentAmount: data.currentAmount ? parseFloat(data.currentAmount) : 0,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name des Sparziels</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Urlaub in Italien" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zielbetrag (€)</FormLabel>
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
            name="currentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bereits gespart (€) (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Zieldatum (optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: de })
                        ) : (
                          <span>Datum auswählen</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
            {isSubmitting ? "Wird erstellt..." : "Sparziel erstellen"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
