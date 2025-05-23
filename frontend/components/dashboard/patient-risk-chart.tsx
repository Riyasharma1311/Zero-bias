"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { db } from "@/lib/db"
import type { RiskDistribution } from "@/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"


const db = {
  getRiskDistribution: async () => {
    return {
      low: 100,
      medium: 200,
      high: 300,
    }
  }
}
export function PatientRiskChart() {
  const [data, setData] = useState<RiskDistribution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const distribution = await db.getRiskDistribution()
        setData(distribution)
      } catch (error) {
        console.error("Error fetching risk distribution:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <Card className="h-96 animate-pulse bg-gray-100" />
  }

  if (!data) {
    return <div>Error loading risk distribution</div>
  }

  const chartData = [
    { name: "Low", value: data.low, fill: "#4ade80" },
    { name: "Medium", value: data.medium, fill: "#facc15" },
    { name: "High", value: data.high, fill: "#f87171" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Risk : Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} patients`, "Count"]}
                contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
