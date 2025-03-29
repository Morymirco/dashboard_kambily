"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import type { TopProduct } from "@/services/dashboard-service"

// Données pour le graphique des ventes (conservées pour le moment)
const salesData = [
  { name: "Jan", total: 1200 },
  { name: "Fév", total: 1900 },
  { name: "Mar", total: 2400 },
  { name: "Avr", total: 1800 },
  { name: "Mai", total: 2800 },
  { name: "Juin", total: 3200 },
  { name: "Juil", total: 2600 },
]

// Couleurs pour le graphique en camembert
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface DashboardChartsProps {
  isPieChart?: boolean
  topProducts?: TopProduct[]
}

export default function DashboardCharts({ isPieChart = false, topProducts = [] }: DashboardChartsProps) {
  if (isPieChart) {
    // Préparer les données pour le graphique en camembert
    const pieData =
      topProducts.length > 0
        ? topProducts.map((product) => ({
            name: product.product__name,
            value: product.total_quantity,
          }))
        : [
            { name: "Bracelets", value: 35 },
            { name: "Colliers", value: 25 },
            { name: "Bagues", value: 20 },
            { name: "Montres", value: 10 },
            { name: "Boucles d'oreilles", value: 10 },
          ]

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip
            formatter={(value) => [`${value}`, "Quantité"]}
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={salesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value.toLocaleString("fr-GN")} GNF`, "Ventes"]}
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
          }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Bar dataKey="total" fill="#14b8a6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

