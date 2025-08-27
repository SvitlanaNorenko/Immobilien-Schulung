"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"

interface Question {
  question: string
  type: "multiple-choice" | "single-answer"
  category: string
  difficulty: "easy" | "medium" | "hard"
  answers?: string[]
  correctAnswer: string | number
}

interface AddQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddQuestion: (question: Question) => void
}

const categories = ["Geography", "Mathematics", "Literature", "Science", "History"]
const difficulties = ["easy", "medium", "hard"]

export function AddQuestionDialog({ open, onOpenChange, onAddQuestion }: AddQuestionDialogProps) {
  const [formData, setFormData] = useState<Question>({
    question: "",
    type: "multiple-choice",
    category: "",
    difficulty: "easy",
    answers: ["", "", "", ""],
    correctAnswer: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({
      question: "",
      type: "multiple-choice",
      category: "",
      difficulty: "easy",
      answers: ["", "", "", ""],
      correctAnswer: 0,
    })
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.question.trim()) {
      newErrors.question = "Question is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (formData.type === "multiple-choice") {
      const filledAnswers = formData.answers?.filter((answer) => answer.trim()) || []
      if (filledAnswers.length < 2) {
        newErrors.answers = "At least 2 answers are required for multiple choice"
      }
      if (typeof formData.correctAnswer === "number" && !formData.answers?.[formData.correctAnswer]?.trim()) {
        newErrors.correctAnswer = "Please select a valid correct answer"
      }
    } else {
      if (!formData.correctAnswer || (typeof formData.correctAnswer === "string" && !formData.correctAnswer.trim())) {
        newErrors.correctAnswer = "Correct answer is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const questionData: Question = {
      ...formData,
      question: formData.question.trim(),
    }

    if (formData.type === "single-answer") {
      questionData.answers = undefined
    }

    onAddQuestion(questionData)
    resetForm()
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...(formData.answers || [])]
    newAnswers[index] = value
    setFormData({ ...formData, answers: newAnswers })
  }

  const addAnswer = () => {
    const newAnswers = [...(formData.answers || []), ""]
    setFormData({ ...formData, answers: newAnswers })
  }

  const removeAnswer = (index: number) => {
    const newAnswers = formData.answers?.filter((_, i) => i !== index) || []
    let newCorrectAnswer = formData.correctAnswer

    if (typeof formData.correctAnswer === "number" && formData.correctAnswer >= index) {
      newCorrectAnswer = Math.max(0, formData.correctAnswer - 1)
    }

    setFormData({ ...formData, answers: newAnswers, correctAnswer: newCorrectAnswer })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for your database. Choose between multiple choice or single answer format.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Textarea
              id="question"
              placeholder="Enter your question here..."
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="min-h-[80px]"
            />
            {errors.question && <p className="text-sm text-destructive">{errors.question}</p>}
          </div>

          {/* Question Type */}
          <div className="space-y-3">
            <Label>Question Type *</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: "multiple-choice" | "single-answer") => {
                setFormData({
                  ...formData,
                  type: value,
                  answers: value === "multiple-choice" ? ["", "", "", ""] : undefined,
                  correctAnswer: value === "multiple-choice" ? 0 : "",
                })
              }}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple-choice" id="multiple-choice" />
                <Label htmlFor="multiple-choice">Multiple Choice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single-answer" id="single-answer" />
                <Label htmlFor="single-answer">Single Answer</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
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
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label>Difficulty *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: "easy" | "medium" | "hard") => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Answers Section */}
          {formData.type === "multiple-choice" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Answer Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.answers?.map((answer, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <RadioGroup
                      value={formData.correctAnswer.toString()}
                      onValueChange={(value) => setFormData({ ...formData, correctAnswer: Number.parseInt(value) })}
                    >
                      <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                    </RadioGroup>
                    <Input
                      placeholder={`Answer option ${index + 1}`}
                      value={answer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {formData.answers && formData.answers.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAnswer(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {formData.answers && formData.answers.length < 6 && (
                  <Button type="button" variant="outline" onClick={addAnswer} className="w-full gap-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    Add Answer Option
                  </Button>
                )}

                {errors.answers && <p className="text-sm text-destructive">{errors.answers}</p>}
                {errors.correctAnswer && <p className="text-sm text-destructive">{errors.correctAnswer}</p>}

                <p className="text-sm text-muted-foreground">Select the radio button next to the correct answer</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="single-answer">Correct Answer *</Label>
              <Input
                id="single-answer"
                placeholder="Enter the correct answer"
                value={formData.correctAnswer as string}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              />
              {errors.correctAnswer && <p className="text-sm text-destructive">{errors.correctAnswer}</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Question</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
