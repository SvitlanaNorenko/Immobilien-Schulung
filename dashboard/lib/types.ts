export interface Question {
  id: string
  question: string
  type: "multiple-choice" | "single-answer"
  category: string
  difficulty: "easy" | "medium" | "hard"
  answers?: string[]
  correctAnswer: string | number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  questionCount: number
}
