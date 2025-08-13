import chatbotData from "@/services/mockData/chatbot.json";

class ChatbotService {
  constructor() {
    this.data = { ...chatbotData };
  }

  async getResponse(profileId, section, question) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const profile = this.data.responses[profileId];
    if (!profile) {
      return "I don't have information about this profile yet. Please configure the chatbot responses first.";
    }

    const sectionData = profile[section];
    if (!sectionData) {
      return "This section hasn't been configured yet. Please add responses for this section.";
    }

    // Find matching question or return a default response
    const response = sectionData[question] || sectionData.default || 
      "I don't have a specific answer for this question. Please configure more responses.";
    
    return response;
  }

  async updateResponse(profileId, section, question, response) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!this.data.responses[profileId]) {
      this.data.responses[profileId] = {};
    }
    
    if (!this.data.responses[profileId][section]) {
      this.data.responses[profileId][section] = {};
    }
    
    this.data.responses[profileId][section][question] = response;
    return true;
  }

  async getAllResponses() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...this.data };
  }
}

export const chatbotService = new ChatbotService();