import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ChatbotSimulator from "@/components/organisms/ChatbotSimulator";
import ApperIcon from "@/components/ApperIcon";
import { profilesService } from "@/services/api/profiles";
import { chatbotService } from "@/services/api/chatbot";
import { toast } from "react-toastify";

const Chatbot = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [profilesData, responsesData] = await Promise.all([
        profilesService.getAll(),
        chatbotService.getAllResponses()
      ]);
      setProfiles(profilesData);
      setResponses(responsesData.responses || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { value: "overview", label: "Profile Overview" },
    { value: "strengths", label: "Strengths & Skills" },
    { value: "risks", label: "Risks & Challenges" },
    { value: "recommendations", label: "Recommendations" },
    { value: "roles", label: "Suitable Roles" }
  ];

  const predefinedQuestions = {
    overview: [
      "What defines this behavioral profile?",
      "How common is this profile type?",
      "What are the key characteristics?"
    ],
    strengths: [
      "What are the main strengths?",
      "Which skills stand out?",
      "How can these strengths be leveraged?"
    ],
    risks: [
      "What are the potential risks?",
      "Which situations to avoid?",
      "How to mitigate weaknesses?"
    ],
    recommendations: [
      "What development actions are recommended?",
      "How to improve performance?",
      "Which training programs would help?"
    ],
    roles: [
      "What roles are most suitable?",
      "Which positions to avoid?",
      "What team dynamics work best?"
    ]
  };

  const handleSaveResponse = async () => {
    if (!selectedProfile || !selectedSection || !currentQuestion.trim() || !currentAnswer.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSaving(true);
      await chatbotService.updateResponse(selectedProfile, selectedSection, currentQuestion, currentAnswer);
      
      // Update local state
      setResponses(prev => ({
        ...prev,
        [selectedProfile]: {
          ...prev[selectedProfile],
          [selectedSection]: {
            ...prev[selectedProfile]?.[selectedSection],
            [currentQuestion]: currentAnswer
          }
        }
      }));

      setCurrentQuestion("");
      setCurrentAnswer("");
      toast.success("Response saved successfully");
    } catch (error) {
      toast.error("Failed to save response");
    } finally {
      setSaving(false);
    }
  };

  const getExistingResponses = () => {
    if (!selectedProfile || !selectedSection) return {};
    return responses[selectedProfile]?.[selectedSection] || {};
  };

  const handleLoadExistingResponse = (question) => {
    const existingResponses = getExistingResponses();
    const existingAnswer = existingResponses[question];
    if (existingAnswer) {
      setCurrentQuestion(question);
      setCurrentAnswer(existingAnswer);
    } else {
      setCurrentQuestion(question);
      setCurrentAnswer("");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chatbot Configuration</h1>
        <p className="text-gray-600">Configure AI responses for each behavioral profile</p>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Management</h3>
          
          <div className="space-y-4">
            <Select
              label="Select Profile"
              value={selectedProfile}
              onChange={(e) => {
                setSelectedProfile(e.target.value);
                setSelectedSection("");
                setCurrentQuestion("");
                setCurrentAnswer("");
              }}
options={profiles.map(profile => ({
                value: profile.Id.toString(),
                label: profile.Name
              }))}
              placeholder="Choose a behavioral profile"
            />

            <Select
              label="Select Section"
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setCurrentQuestion("");
                setCurrentAnswer("");
              }}
              options={sections}
              placeholder="Choose a section"
              disabled={!selectedProfile}
            />

            {selectedSection && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Predefined Questions
                </label>
                <div className="space-y-2 mb-4">
                  {predefinedQuestions[selectedSection]?.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleLoadExistingResponse(question)}
                      className="w-full text-left p-3 text-sm border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span>{question}</span>
                        {getExistingResponses()[question] && (
                          <ApperIcon name="Check" size={16} className="text-green-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Custom Question"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Enter a custom question..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Response
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Enter the AI chatbot response for this question..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <Button
              onClick={handleSaveResponse}
              loading={saving}
              disabled={!selectedProfile || !selectedSection || !currentQuestion.trim() || !currentAnswer.trim()}
              className="w-full"
            >
              Save Response
            </Button>
          </div>
        </Card>

        {/* Existing Responses */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Responses</h3>
          
          {!selectedProfile || !selectedSection ? (
            <div className="text-center py-8">
              <ApperIcon name="MessageSquare" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Select a profile and section to view responses</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(getExistingResponses()).length === 0 ? (
                <Empty
                  title="No responses configured"
                  description="Add your first response to get started."
                  icon="MessageCircle"
                />
              ) : (
                Object.entries(getExistingResponses()).map(([question, answer]) => (
                  <div key={question} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{question}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Edit2"
                        onClick={() => handleLoadExistingResponse(question)}
                      />
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">{answer}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Chatbot Simulator */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Chatbot Simulator</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ApperIcon name="Bot" size={16} />
            <span>Test your configurations</span>
          </div>
        </div>
        
        <ChatbotSimulator />
      </Card>
    </div>
  );
};

export default Chatbot;