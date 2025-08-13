import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { chatbotService } from "@/services/api/chatbot";
import { profilesService } from "@/services/api/profiles";

const ChatbotSimulator = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await profilesService.getAll();
      setProfiles(data);
    } catch (error) {
      console.error("Error loading profiles:", error);
    }
  };

  const sections = [
    { value: "overview", label: "Profile Overview" },
    { value: "strengths", label: "Strengths & Skills" },
    { value: "risks", label: "Risks & Challenges" },
    { value: "recommendations", label: "Recommendations" },
    { value: "roles", label: "Suitable Roles" }
  ];

  const questions = {
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

  const handleAskQuestion = async () => {
    if (!selectedProfile || !selectedSection || !selectedQuestion) return;

    setIsTyping(true);
    setChatHistory(prev => [...prev, {
      type: "question",
      text: selectedQuestion,
      timestamp: new Date()
    }]);

    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = await chatbotService.getResponse(selectedProfile, selectedSection, selectedQuestion);
      
      // Typewriter effect
      setResponse("");
      let i = 0;
      const text = mockResponse;
      const timer = setInterval(() => {
        setResponse(text.slice(0, i + 1));
        i++;
        if (i === text.length) {
          clearInterval(timer);
          setIsTyping(false);
          setChatHistory(prev => [...prev, {
            type: "answer",
            text: text,
            timestamp: new Date()
          }]);
          setResponse("");
        }
      }, 30);

    } catch (error) {
      console.error("Error getting response:", error);
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setResponse("");
    setSelectedProfile("");
    setSelectedSection("");
    setSelectedQuestion("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chatbot Configuration</h3>
        
        <div className="space-y-4">
          <Select
            label="Select Profile"
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            options={profiles.map(profile => ({
              value: profile.Id,
              label: profile.name
            }))}
            placeholder="Choose a behavioral profile"
          />

          <Select
            label="Select Section"
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setSelectedQuestion("");
            }}
            options={sections}
            placeholder="Choose a section"
            disabled={!selectedProfile}
          />

          <Select
            label="Select Question"
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(e.target.value)}
            options={selectedSection ? questions[selectedSection]?.map(q => ({
              value: q,
              label: q
            })) || [] : []}
            placeholder="Choose a question"
            disabled={!selectedSection}
          />

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleAskQuestion}
              disabled={!selectedProfile || !selectedSection || !selectedQuestion || isTyping}
              loading={isTyping}
              className="flex-1"
            >
              Ask Question
            </Button>
            <Button
              variant="secondary"
              onClick={clearChat}
              icon="RotateCcw"
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Simulation</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
          {chatHistory.length === 0 && !response && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <ApperIcon name="MessageCircle" size={48} className="mx-auto mb-2 text-gray-400" />
                <p>Select a profile and question to start the conversation</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === "question" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === "question"
                      ? "bg-gradient-primary text-white"
                      : "bg-white border text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}

            {/* Typing Response */}
            {response && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white border text-gray-900">
                  <p className="text-sm typewriter">{response}</p>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && !response && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white border">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <ApperIcon name="Bot" size={16} className="inline mr-1" />
          AI Assistant powered by ProfileIQ
        </div>
      </Card>
    </div>
  );
};

export default ChatbotSimulator;