import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertContractSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

// Contract categories
const categories = [
  "Telekommunikation",
  "Versicherung",
  "Unterhaltung",
  "Finanzen",
  "Haushalt",
  "Sport & Fitness",
  "Mobilität",
  "Sonstiges"
];

// Billing cycles
const billingCycles = [
  { value: "monthly", label: "Monatlich" },
  { value: "quarterly", label: "Vierteljährlich" },
  { value: "yearly", label: "Jährlich" }
];

interface ContractFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: any;
}

export default function ContractForm({ onSubmit, onCancel, isSubmitting, initialData }: ContractFormProps) {
  // Convert dates for form initialization
  const startDate = initialData?.startDate ? new Date(initialData.startDate) : undefined;
  const endDate = initialData?.endDate ? new Date(initialData.endDate) : undefined;

  const form = useForm<z.infer<typeof insertContractSchema>>({
    resolver: zodResolver(insertContractSchema),
    defaultValues: initialData ? {
      ...initialData,
      startDate,
      endDate,
    } : {
      userId: 1,
      name: "",
      provider: "",
      cost: undefined,
      billingCycle: "monthly",
      startDate: new Date(),
      endDate: undefined,
      autoRenewal: false,
      category: "",
      notes: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof insertContractSchema>) => {
    onSubmit({
      ...data,
      cost: typeof data.cost === 'string' ? parseFloat(data.cost) : data.cost,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 md:col-span-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vertragsname</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Netflix Abo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anbieter</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Netflix GmbH" {...field} />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kosten (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
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
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zahlungsintervall</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Interval wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billingCycles.map(cycle => (
                          <SelectItem key={cycle.value} value={cycle.value}>
                            {cycle.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 md:col-span-1">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Startdatum</FormLabel>
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Enddatum (optional)</FormLabel>
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
                            <span>Unbefristet</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => 
                          date < (form.getValues().startDate || new Date())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Leer lassen für unbefristete Verträge
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoRenewal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Automatische Verlängerung</FormLabel>
                    <FormDescription>
                      Verlängert sich der Vertrag automatisch nach Ablauf?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notizen (optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Zusätzliche Informationen zum Vertrag"
                    className="resize-none"
                    {...field}
                  />
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
            {isSubmitting 
              ? initialData ? "Wird aktualisiert..." : "Wird erstellt..." 
              : initialData ? "Aktualisieren" : "Vertrag erstellen"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
