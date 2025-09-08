"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { AddQuestionDialog } from "@/components/add-question-dialog";
import { API_URL } from "@/lib/constants";

export interface QuestionResponse {
  id: number;
  created_at: string;
  text: string;
  hasOptions: boolean;
  answer: string;
  topics: { id: number; name: string };
  options: { text: string; isCorrect: boolean }[];
}

export type QuestionRequest = Omit<
  QuestionResponse,
  "topics" | "id" | "created_at"
> & {
  topic_id: number;
};

type Topics = { id: number; name: string }[];
//useState is for
export function QuestionManagement() {
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [topics, setTopics] = useState<Topics>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [defaultFormValue, setDefaultFormValue] =
    useState<QuestionRequest | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/topics")
      .then((res) => res.json())
      .then((tpcs) => setTopics(tpcs));

    fetch("http://localhost:3000/questions")
      .then((res) => res.json())
      .then((qts) => setQuestions(qts));
  }, []);

  if (!topics.length || !questions.length) {
    return <div>Loading...</div>;
  }

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      question.topics.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteQuestion = (id: number) => {
    fetch(API_URL + "/questions/" + id, { method: "DELETE" });
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleAddQuestion = async (newQuestion: QuestionRequest) => {
    setIsAddDialogOpen(false);

    const response = await fetch(API_URL + "/questions", {
      method: "POST",
      body: JSON.stringify(newQuestion),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const addedQuestion = await response.json();
      setQuestions([...questions, addedQuestion]);
    }
  };

  // Homework
  const handleEditQuestion = async (
    question: QuestionRequest & { id: number }
  ) => {
    setIsAddDialogOpen(false);

    const response = await fetch(API_URL + "/questions/" + question.id, {
      method: "PATCH",
      body: JSON.stringify(question),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const updatedQuestion = data.question;

      const newQuestions = questions.map((q) => {
        if (q.id === question.id) {
          return updatedQuestion;
        }

        return q;
      });

      setQuestions(newQuestions);
    }
  };

  const getTypeColor = (hasOptions: boolean) => {
    return hasOptions
      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
      : "bg-purple-100 text-purple-800 hover:bg-purple-100";
  };

  const safeFirstTopicId = topics?.[0]?.id ?? undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">
            Questions Management
          </h1>
          <p className="text-muted-foreground">Manage your question database</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setIsAddDialogOpen(true);
            setIsEdit(false);
            setDefaultFormValue({
              text: "",
              hasOptions: true,
              topic_id: safeFirstTopicId,
              options: [],
              answer: "",
            });
          }}
        >
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
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
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
                  <TableHead>Correct Answer</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={question.text}>
                        {question.text}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getTypeColor(question.hasOptions)}
                      >
                        {question.hasOptions
                          ? "Multiple Choice"
                          : "Single Answer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.topics.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {question.hasOptions
                        ? question.options.find((option) => option.isCorrect)
                            ?.text
                        : question.answer}
                    </TableCell>
                    <TableCell>{question.created_at}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setDefaultFormValue({
                                ...question,
                                topic_id: question.topics.id,
                              });

                              setIsAddDialogOpen(true);
                              setIsEdit(true);
                            }}
                          >
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
      {defaultFormValue && (
        <AddQuestionDialog
          open={isAddDialogOpen}
          onOpenChange={(isOpen) => {
            setIsAddDialogOpen(isOpen);
            setDefaultFormValue(null);
          }}
          onAddQuestion={handleAddQuestion}
          onEditQuestion={handleEditQuestion}
          topics={topics}
          defaultFormValue={defaultFormValue}
          isEdit={isEdit}
        />
      )}
    </div>
  );
}
