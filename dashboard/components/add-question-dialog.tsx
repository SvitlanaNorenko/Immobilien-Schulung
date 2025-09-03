"use client";

import type React from "react";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { Question } from "./question-management";

interface AddQuestionDialogProps {
  open: boolean;
  topics: { id: number; name: string }[];
  onOpenChange: (open: boolean) => void;
  onAddQuestion: (question: Partial<Question>) => void;
}

export function AddQuestionDialog({
  open,
  onOpenChange,
  onAddQuestion,
  topics,
}: AddQuestionDialogProps) {
  const defaultFormValue = {
    text: "",
    hasOptions: true,
    topics: topics[0],
    options: [],
    answer: "",
  };

  const [formData, setFormData] = useState<Partial<Question>>(defaultFormValue);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData(defaultFormValue);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.text?.trim()) {
      newErrors.text = "Question is required";
    }

    if (!formData.topics) {
      newErrors.topics = "Category is required";
    }

    if (formData.hasOptions) {
      const filledAnswers =
        formData.options?.filter((answer) => answer.text.trim()) || [];
      if (filledAnswers.length < 2) {
        newErrors.answers =
          "At least 2 answers are required for multiple choice";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const questionData: Partial<Question> = {
      ...formData,
      text: formData.text?.trim() || "",
    };

    if (!questionData.hasOptions) {
      questionData.text = undefined;
    }

    onAddQuestion(questionData);
    resetForm();
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...(formData.options || [])];
    newAnswers[index] = { text: value, isCorrect: newAnswers[index].isCorrect };
    setFormData({ ...formData, options: newAnswers });
  };

  const addAnswer = () => {
    const newAnswers = [
      ...(formData.options || []),
      { text: "", isCorrect: false },
    ];
    setFormData({ ...formData, options: newAnswers });
  };

  const removeAnswer = (index: number) => {
    const newAnswers = formData.options?.filter((_, i) => i !== index) || [];

    setFormData({
      ...formData,
      options: newAnswers,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for your database. Choose between multiple
            choice or single answer format.
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
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question}</p>
            )}
          </div>

          {/* Question Type */}
          <div className="space-y-3">
            <Label>Question Type *</Label>
            <RadioGroup
              value={formData.hasOptions ? "multiple-choice" : "single-answer"}
              onValueChange={(value: "multiple-choice" | "single-answer") => {
                setFormData({
                  ...formData,
                  hasOptions: value === "multiple-choice",
                  options: value === "multiple-choice" ? [] : undefined,
                });
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
                value={formData.topics?.name}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    topics: topics.find((t) => t.name === value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.name}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
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
                {formData.options?.map((answer, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <RadioGroup
                      value={answer.isCorrect}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                        })
                      }
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`answer-${index}`}
                      />
                    </RadioGroup>
                    <Input
                      placeholder={`Answer option ${index + 1}`}
                      value={answer.text}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      className="flex-1"
                    />
                    {formData.options && formData.options.length > 2 && (
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

                {formData.options && formData.options.length < 6 && (
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
                  Select the radio button next to the correct answer
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="single-answer">Correct Answer *</Label>
              <Input
                id="single-answer"
                placeholder="Enter the correct answer"
                value={
                  formData.options?.find((ops) => ops.isCorrect)?.text as string
                }
                onChange={(e) => setFormData({ ...formData })}
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
            <Button type="submit">Add Question</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
