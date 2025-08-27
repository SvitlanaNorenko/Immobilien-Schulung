"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import { AddQuestionDialog } from "@/components/add-question-dialog"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "single-answer"
  category: string
  difficulty: "easy" | "medium" | "hard"
  answers?: string[]
  correctAnswer: string | number
  createdAt: string
}

// Mock data
const mockQuestions: Question[] = [
  {
    id: "1",
    question: "What is the capital of France?",
    type: "multiple-choice",
    category: "Geography",
    difficulty: "easy",
    answers: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    question: "What is 2 + 2?",
    type: "single-answer",
    category: "Mathematics",
    difficulty: "easy",
    correctAnswer: "4",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    question: "Who wrote Romeo and Juliet?",
    type: "multiple-choice",
    category: "Literature",
    difficulty: "medium",
    answers: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1,
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    question: "What is the chemical symbol for gold?",
    type: "single-answer",
    category: "Science",
    difficulty: "medium",
    correctAnswer: "Au",
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    question: "Which planet is closest to the Sun?",
    type: "multiple-choice",
    category: "Science",
    difficulty: "easy",
    answers: ["Venus", "Mercury", "Earth", "Mars"],
    correctAnswer: 1,
    createdAt: "2024-01-11",
  },
]

const categories = ["All Categories", "Geography", "Mathematics", "Literature", "Science", "History"]
const difficulties = ["All Difficulties", "easy", "medium", "hard"]

export function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulties")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || question.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All Difficulties" || question.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleAddQuestion = (newQuestion: Omit<Question, "id" | "createdAt">) => {
    const question: Question = {
      ...newQuestion,
      id: (questions.length + 1).toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setQuestions([question, ...questions])
    setIsAddDialogOpen(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "hard":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "multiple-choice"
      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
      : "bg-purple-100 text-purple-800 hover:bg-purple-100"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Questions Management</h1>
          <p className="text-muted-foreground">Manage your question database</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={question.question}>
                        {question.question}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getTypeColor(question.type)}>
                        {question.type === "multiple-choice" ? "Multiple Choice" : "Single Answer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {question.type === "multiple-choice" && question.answers
                        ? question.answers[question.correctAnswer as number]
                        : question.correctAnswer}
                    </TableCell>
                    <TableCell>{question.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Question Dialog */}
      <AddQuestionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAddQuestion={handleAddQuestion} />
    </div>
  )
}
