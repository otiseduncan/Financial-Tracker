"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from "recharts"

interface VarianceData {
  name: string
  variance: number
}

export function VarianceBarChart({ data }: { data: VarianceData[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          interval={0}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          height={80}
        />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Variance"]}
          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
        <Legend
          payload={[
            { value: "Positive (Under Budget)", type: "rect", color: "#22d3ee" },
            { value: "Negative (Over Budget)", type: "rect", color: "#ef4444" },
          ]}
        />
        <Bar dataKey="variance" name="Variance">
          {data.map((d, i) => (
            <Cell key={i} fill={d.variance >= 0 ? "#22d3ee" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
