"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users, TrendingUp, Award, Activity } from "lucide-react"

interface UserStats {
  id: string
  name: string
  email: string
  avatar?: string
  questionsAnswered: number
  correctAnswers: number
  accuracyPercentage: number
  lastActive: string
  joinDate: string
  favoriteCategory: string
  streak: number
}

// Mock data
const mockUsers: UserStats[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    questionsAnswered: 245,
    correctAnswers: 198,
    accuracyPercentage: 80.8,
    lastActive: "2024-01-20",
    joinDate: "2023-12-01",
    favoriteCategory: "Science",
    streak: 12,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    questionsAnswered: 189,
    correctAnswers: 167,
    accuracyPercentage: 88.4,
    lastActive: "2024-01-19",
    joinDate: "2023-11-15",
    favoriteCategory: "Mathematics",
    streak: 8,
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@example.com",
    questionsAnswered: 312,
    correctAnswers: 234,
    accuracyPercentage: 75.0,
    lastActive: "2024-01-20",
    joinDate: "2023-10-20",
    favoriteCategory: "History",
    streak: 15,
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david@example.com",
    questionsAnswered: 156,
    correctAnswers: 143,
    accuracyPercentage: 91.7,
    lastActive: "2024-01-18",
    joinDate: "2024-01-05",
    favoriteCategory: "Literature",
    streak: 5,
  },
  {
    id: "5",
    name: "Emma Brown",
    email: "emma@example.com",
    questionsAnswered: 278,
    correctAnswers: 222,
    accuracyPercentage: 79.9,
    lastActive: "2024-01-20",
    joinDate: "2023-09-10",
    favoriteCategory: "Geography",
    streak: 20,
  },
]

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "questionsAnswered", label: "Questions Answered" },
  { value: "accuracyPercentage", label: "Accuracy %" },
  { value: "lastActive", label: "Last Active" },
  { value: "streak", label: "Streak" },
]

export function UserAnalytics() {
  const [users, setUsers] = useState<UserStats[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.favoriteCategory.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "questionsAnswered":
          return b.questionsAnswered - a.questionsAnswered
        case "accuracyPercentage":
          return b.accuracyPercentage - a.accuracyPercentage
        case "lastActive":
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        case "streak":
          return b.streak - a.streak
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const totalUsers = users.length
  const totalQuestionsAnswered = users.reduce((sum, user) => sum + user.questionsAnswered, 0)
  const averageAccuracy = users.reduce((sum, user) => sum + user.accuracyPercentage, 0) / users.length
  const activeUsers = users.filter((user) => {
    const lastActive = new Date(user.lastActive)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return lastActive >= weekAgo
  }).length

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600"
    if (accuracy >= 80) return "text-blue-600"
    if (accuracy >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getAccuracyBadgeColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-green-100 text-green-800 hover:bg-green-100"
    if (accuracy >= 80) return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    if (accuracy >= 70) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    return "bg-red-100 text-red-800 hover:bg-red-100"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">User Analytics</h1>
        <p className="text-muted-foreground">Track user performance and engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Active in last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestionsAnswered.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAccuracy.toFixed(1)}%</div>
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
                  <TableHead>Favorite Category</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.questionsAnswered}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.correctAnswers}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={getAccuracyBadgeColor(user.accuracyPercentage)}>
                            {user.accuracyPercentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress value={user.accuracyPercentage} className="h-1 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.favoriteCategory}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                          {user.streak}
                        </Badge>
                        <span className="text-xs text-muted-foreground">days</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.lastActive}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
