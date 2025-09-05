"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { QuestionResponse } from "./question-management";

interface Topic {
  id: number;
  name: string;
}
interface QuestionRequest {
  text: string;
  hasOptions: boolean;
  topic_id?: number;
  options: { text: string; isCorrect: boolean }[];
  answer: string;
}

interface AddQuestionDialogProps {
  open: boolean;
  topics: Topic[];
  onOpenChange: (open: boolean) => void;
  onAddQuestion: (question: QuestionRequest) => Promise<void>;
  onEditQuestion: (question: QuestionRequest & { id: number }) => Promise<void>;
  defaultFormValue: QuestionRequest;
  isEdit: boolean;
}

export function AddQuestionDialog({
  open,
  onOpenChange,
  onAddQuestion,
  onEditQuestion,
  topics,
  defaultFormValue,
  isEdit,
}: AddQuestionDialogProps) {
  const [formData, setFormData] = useState<QuestionRequest>(defaultFormValue);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // avoids portal/hydration glitches

  const resetForm = () => {
    setFormData(defaultFormValue);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.text?.trim()) newErrors.text = "Question is required";
    if (!formData.topic_id) newErrors.topic_id = "Category is required";

    if (formData.hasOptions) {
      const filled = formData.options?.filter((a) => a.text.trim()) ?? [];
      if (filled.length < 2) {
        newErrors.answers =
          "At least 2 answers are required for multiple choice";
      }
    } else {
      if (!formData.answer?.trim()) {
        newErrors.correctAnswer = "Correct answer is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const question = { ...formData, text: formData.text.trim() };
    if (isEdit) {
      onEditQuestion(question as QuestionRequest & { id: number });
    } else {
      onAddQuestion(question);
    }
    resetForm();
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...(formData.options ?? [])];
    const prev = newAnswers[index] ?? { text: "", isCorrect: false };
    newAnswers[index] = { ...prev, text: value };
    setFormData({ ...formData, options: newAnswers });
  };

  const addAnswer = () => {
    setFormData({
      ...formData,
      options: [...(formData.options ?? []), { text: "", isCorrect: false }],
    });
  };

  const removeAnswer = (index: number) => {
    const newAnswers = (formData.options ?? []).filter((_, i) => i !== index);
    setFormData({ ...formData, options: newAnswers });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the question"
              : "Create a new question for your database. Choose between multiple choice or single answer format."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Textarea
              id="question"
              placeholder="Enter your question here..."
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              className="min-h-[80px]"
            />
            {errors.text && (
              <p className="text-sm text-destructive">{errors.text}</p>
            )}
          </div>

          {/* Question Type */}
          <div className="space-y-3">
            <Label>Question Type *</Label>
            <RadioGroup
              value={formData.hasOptions ? "multiple-choice" : "single-answer"}
              onValueChange={(value: "multiple-choice" | "single-answer") =>
                setFormData({
                  ...formData,
                  hasOptions: value === "multiple-choice",
                  options: [],
                  answer: "",
                })
              }
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

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    topic_id: Number(e.target.value),
                  });
                  validateForm();
                }}
              >
                {topics?.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              {errors.topic_id && (
                <p className="text-sm text-destructive">{errors.topic_id}</p>
              )}
            </div>
          </div>

          {/* Answers Section */}
          {formData.hasOptions ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Answer Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(formData.options ?? []).map((answer, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Checkbox
                      style={{ border: "1px solid grey" }}
                      checked={!!answer.isCorrect}
                      onCheckedChange={(checked) => {
                        const newOptions = [...(formData.options ?? [])];
                        newOptions[index] = {
                          ...newOptions[index],
                          isCorrect: Boolean(checked),
                        };
                        setFormData({ ...formData, options: newOptions });
                      }}
                    />
                    <Input
                      placeholder={`Answer option ${index + 1}`}
                      value={answer.text}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      className="flex-1"
                    />
                    {(formData.options?.length ?? 0) > 2 && (
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

                {(formData.options?.length ?? 0) < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAnswer}
                    className="w-full gap-2 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                    Add Answer Option
                  </Button>
                )}

                {errors.answers && (
                  <p className="text-sm text-destructive">{errors.answers}</p>
                )}
                {errors.correctAnswer && (
                  <p className="text-sm text-destructive">
                    {errors.correctAnswer}
                  </p>
                )}

                <p className="text-sm text-muted-foreground">
                  Tick the checkbox next to the correct answer
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="single-answer">Correct Answer *</Label>
              <Input
                id="single-answer"
                placeholder="Enter the correct answer"
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
              />
              {errors.correctAnswer && (
                <p className="text-sm text-destructive">
                  {errors.correctAnswer}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Add"} Question</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
