import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import QuestionCard from "@/components/molecules/QuestionCard";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { questionnairesService } from "@/services/api/questionnaires";

const QuestionnaireBuilder = ({ questionnaireId, onSave }) => {
  const [questionnaire, setQuestionnaire] = useState({
    title: "",
    description: "",
    questions: []
  });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    text: "",
    type: "",
    weight: 1,
    competencies: [],
    answers: []
  });

  useEffect(() => {
    if (questionnaireId) {
      loadQuestionnaire();
    }
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      const data = await questionnairesService.getById(questionnaireId);
      setQuestionnaire(data);
    } catch (error) {
      console.error("Error loading questionnaire:", error);
    }
  };

  const handleSaveQuestionnaire = async () => {
    try {
      if (questionnaireId) {
        await questionnairesService.update(questionnaireId, questionnaire);
      } else {
        await questionnairesService.create(questionnaire);
      }
      onSave?.();
    } catch (error) {
      console.error("Error saving questionnaire:", error);
    }
  };

  const handleAddQuestion = () => {
    setQuestionForm({
      text: "",
      type: "",
      weight: 1,
      competencies: [],
      answers: []
    });
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (questionId) => {
    const question = questionnaire.questions.find(q => q.Id === questionId);
    if (question) {
      setQuestionForm(question);
      setEditingQuestion(questionId);
      setShowQuestionForm(true);
    }
  };

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      setQuestionnaire(prev => ({
        ...prev,
        questions: prev.questions.map(q =>
          q.Id === editingQuestion ? { ...questionForm, Id: editingQuestion } : q
        )
      }));
    } else {
      const newId = Math.max(0, ...questionnaire.questions.map(q => q.Id)) + 1;
      setQuestionnaire(prev => ({
        ...prev,
        questions: [...prev.questions, { ...questionForm, Id: newId }]
      }));
    }
    setShowQuestionForm(false);
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.Id !== questionId)
    }));
  };

  const handleDuplicateQuestion = (questionId) => {
    const question = questionnaire.questions.find(q => q.Id === questionId);
    if (question) {
      const newId = Math.max(0, ...questionnaire.questions.map(q => q.Id)) + 1;
      const duplicated = { ...question, Id: newId, text: `${question.text} (Copy)` };
      setQuestionnaire(prev => ({
        ...prev,
        questions: [...prev.questions, duplicated]
      }));
    }
  };

  const questionTypes = [
    { value: "boolean", label: "Yes/No/Maybe" },
    { value: "likert", label: "Likert Scale (1-5)" },
    { value: "multiple", label: "Multiple Choice" }
  ];

  const competencyOptions = [
    "Leadership", "Communication", "Problem Solving", "Teamwork", 
    "Organization", "Adaptability", "Decision Making", "Innovation"
  ];

  return (
    <div className="space-y-6">
      {/* Questionnaire Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Questionnaire Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            value={questionnaire.title}
            onChange={(e) => setQuestionnaire(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter questionnaire title"
            required
          />
          <Input
            label="Description"
            value={questionnaire.description}
            onChange={(e) => setQuestionnaire(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description"
          />
        </div>
      </Card>

      {/* Questions Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
          <Button onClick={handleAddQuestion} icon="Plus">
            Add Question
          </Button>
        </div>

        {questionnaire.questions.length === 0 ? (
          <Empty
            title="No questions added"
            description="Start building your questionnaire by adding your first question."
            action={handleAddQuestion}
            actionText="Add First Question"
            icon="FileQuestion"
          />
        ) : (
          <div className="space-y-4">
            {questionnaire.questions.map((question) => (
              <QuestionCard
                key={question.Id}
                question={question}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
                onDuplicate={handleDuplicateQuestion}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingQuestion ? "Edit Question" : "Add New Question"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={() => setShowQuestionForm(false)}
                />
              </div>

              <div className="space-y-4">
                <Input
                  label="Question Text"
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter your question"
                  required
                />

                <Select
                  label="Question Type"
                  value={questionForm.type}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, type: e.target.value }))}
                  options={questionTypes}
                  required
                />

                <Input
                  label="Weight Multiplier"
                  type="number"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={questionForm.weight}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Competencies
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {competencyOptions.map((comp) => (
                      <label key={comp} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={questionForm.competencies.includes(comp)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQuestionForm(prev => ({
                                ...prev,
                                competencies: [...prev.competencies, comp]
                              }));
                            } else {
                              setQuestionForm(prev => ({
                                ...prev,
                                competencies: prev.competencies.filter(c => c !== comp)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{comp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setShowQuestionForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveQuestion}>
                  {editingQuestion ? "Update Question" : "Add Question"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveQuestionnaire} size="lg">
          Save Questionnaire
        </Button>
      </div>
    </div>
  );
};

export default QuestionnaireBuilder;