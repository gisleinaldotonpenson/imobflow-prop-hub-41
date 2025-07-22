import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecentSale {
  id: string
  name: string
  email: string
  amount: string
  avatar?: string
  date: string
}

interface RecentSalesProps {
  sales?: RecentSale[]
  className?: string
}

export function RecentSales({ sales = [], className }: RecentSalesProps) {
  // Default sales data if none provided
  const defaultSales: RecentSale[] = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@example.com",
      amount: "R$ 1.200,00",
      date: "2023-06-01"
    },
    {
      id: "2",
      name: "Maria Oliveira",
      email: "maria@example.com",
      amount: "R$ 2.500,00",
      date: "2023-06-02"
    },
    {
      id: "3",
      name: "Carlos Santos",
      email: "carlos@example.com",
      amount: "R$ 1.800,00",
      date: "2023-06-03"
    },
    {
      id: "4",
      name: "Ana Pereira",
      email: "ana@example.com",
      amount: "R$ 3.200,00",
      date: "2023-06-04"
    },
    {
      id: "5",
      name: "Pedro Souza",
      email: "pedro@example.com",
      amount: "R$ 2.100,00",
      date: "2023-06-05"
    }
  ]

  const displaySales = sales.length > 0 ? sales : defaultSales

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Vendas Recentes</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {displaySales.map((sale) => (
          <div key={sale.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={sale.avatar} alt={sale.name} />
              <AvatarFallback>
                {sale.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{sale.name}</p>
              <p className="text-sm text-muted-foreground">{sale.email}</p>
            </div>
            <div className="ml-auto font-medium">{sale.amount}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
