import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { type LeadStatus } from '@/hooks/useLeadStatuses';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Cor inválida. Use o formato hexadecimal (ex: #RRGGBB).' }),
  order_num: z.coerce.number().int().positive({ message: 'A ordem deve ser um número positivo.' }),
});

type StatusFormValues = z.infer<typeof formSchema>;

interface StatusFormProps {
  status?: LeadStatus | null;
  onSubmit: (values: StatusFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function StatusForm({ status, onSubmit, onCancel, isSubmitting }: StatusFormProps) {
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: status?.name || '',
      color: status?.color || '#888888',
      order_num: status?.order_num || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Etapa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Proposta Enviada" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input type="color" className="w-12 h-10 p-1" {...field} />
                  <Input placeholder="#AABBCC" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="order_num"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem de Exibição</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
