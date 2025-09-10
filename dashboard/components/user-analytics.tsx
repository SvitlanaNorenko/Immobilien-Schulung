"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, TrendingUp, Award, Activity } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { Button } from "./ui/button";

interface UserStats {
  id: string;
  name: string;
  questions_answered_count: number;
  correct_answers_count: number;
  accuracyPercentage: number;
}

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "questionsAnswered", label: "Questions Answered" },
  { value: "accuracyPercentage", label: "Accuracy %" },
];

export function UserAnalytics() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetch(API_URL + "/users")
      .then((res) => res.json())
      .then((usersData) =>
        setUsers(
          usersData.map(
            (
              user: Omit<UserStats, "accuracyPercentage"> & {
                accuracyPercentage?: number;
              }
            ) => {
              user.accuracyPercentage =
                (user.correct_answers_count / user.questions_answered_count) *
                100;
              return user;
            }
          )
        )
      );
  }, []);

  const filteredUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "questionsAnswered":
          return b.questions_answered_count - a.questions_answered_count;
        case "accuracyPercentage":
          return b.accuracyPercentage - a.accuracyPercentage;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalQuestionsAnswered = users.reduce(
    (sum, user) => sum + user.questions_answered_count,
    0
  );
  const averageAccuracy =
    users.reduce((sum, user) => sum + user.accuracyPercentage, 0) /
    users.length;

  const getAccuracyBadgeColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-green-100 text-green-800 hover:bg-green-100";
    if (accuracy >= 80) return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    if (accuracy >= 70)
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    return "bg-red-100 text-red-800 hover:bg-red-100";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">User Analytics</h1>
          <p className="text-muted-foreground">
            Track user performance and engagement
          </p>
        </div>
        <Button onClick={downloadUsersData}>Export Data</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Questions Answered
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalQuestionsAnswered.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Accuracy
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Questions Answered</TableHead>
                  <TableHead>Correct Answers</TableHead>
                  <TableHead>Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <div className="font-medium p-2">{user.name}</div>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.questions_answered_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.correct_answers_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={getAccuracyBadgeColor(
                              user.accuracyPercentage
                            )}
                          >
                            {user.accuracyPercentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress
                          value={user.accuracyPercentage}
                          className="h-1 w-16"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function downloadUsersData() {
  try {
    const response = await fetch("http://localhost:3000/exportData");

    if (!response.ok) {
      return;
    }

    // Get the zip as a blob
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create a temporary <a> to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Free memory
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Something went wrong while downloading!");
  }
}
