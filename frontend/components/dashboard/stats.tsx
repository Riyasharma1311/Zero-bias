"use client";

import { useEffect, useState } from "react";
import { Users, AlertTriangle, Activity, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats as DashboardStatsType } from "@/types";

const db = {
  getDashboardStats: async () => {
    return {
      totalPatients: 100,
      highRiskPatients: 20,
      avgReadmissionRisk: 3.5,
      currentlyMonitoring: 15,
      totalPatientsChange: 10,
      highRiskPatientsChange: 5,
      avgReadmissionRiskChange: 0.2,
      currentlyMonitoringChange: 3,
    };
  },
};

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await db.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <div>Error loading statistics</div>;
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      change: stats.totalPatientsChange,
      icon: <Users className="h-5 w-5 text-pink-600" />,
      period: "this month",
    },
    {
      title: "High Risk Patients",
      value: stats.highRiskPatients,
      change: stats.highRiskPatientsChange,
      icon: <AlertTriangle className="h-5 w-5 text-pink-600" />,
      period: "this month",
    },
    {
      title: "Avg. Readmission Risk",
      value: `${stats.avgReadmissionRisk}%`,
      change: stats.avgReadmissionRiskChange,
      icon: <Activity className="h-5 w-5 text-pink-600" />,
      period: "this month",
    },
    {
      title: "Currently Monitoring",
      value: stats.currentlyMonitoring,
      change: stats.currentlyMonitoringChange,
      icon: <Heart className="h-5 w-5 text-pink-600" />,
      period: "this month",
      allSafe: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{card.title}</span>
                {card.icon}
              </div>
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-xs text-muted-foreground">
                  {card.period}
                </div>
                {card.change !== 0 && (
                  <div
                    className={`text-xs mt-1 ${
                      card.change > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {card.change > 0 ? "+" : ""}
                    {card.change} from last month
                  </div>
                )}
                {card.allSafe && (
                  <div className="text-xs mt-1 text-green-500">
                    All are out of risk !
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
