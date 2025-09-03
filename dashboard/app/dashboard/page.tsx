"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, FileQuestion, FolderOpen, Users } from "lucide-react";
import { useEffect, useState } from "react";

// We define the type Statistics, this is the format/type of the data we get when we call "http://localhost:3000/statistics"
type Statistics = {
  questionsCount: number;
  topicsCount: number;
  completionPercentage: number;
  usersCount: number;
};

export default function DashboardPage() {
  // We use useState when we want to make a variable inside React component
  // statistics is the variable we define
  // We use setStatistics to update the value of the statistics variable
  // Whatever we pass inside useState("here") is the initial value of statistics for example
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // We use useEffect if we want to get data from the server, we should always pass [] at the end so it only run once
  useEffect(() => {
    fetch("http://localhost:3000/statistics")
      .then((res) => res.json())
      .then((stats) => setStatistics(stats));
  }, []);

  if (!statistics) {
    return <p>Loading...</p>;
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
              Welcome to your admin dashboard
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Questions
                </CardTitle>
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.questionsCount}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Topics</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.topicsCount}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.usersCount}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.completionPercentage}%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
