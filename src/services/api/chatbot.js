class ChatbotService {
  constructor() {
    this.tableName = 'chatbot_response_c';
    this.apperClient = null;
    this.initializeApperClient();
  }

initializeApperClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      try {
        const { ApperClient } = window.ApperSDK;
        this.apperClient = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
        return true;
      } catch (error) {
        console.error("Failed to initialize ApperClient:", error);
        return false;
      }
    }
    return false;
  }

  async getResponse(profileId, section, question) {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      const params = {
        fields: [
          { field: { Name: "response_c" } }
        ],
        where: [
          {
            FieldName: "profile_id_c",
            Operator: "EqualTo",
            Values: [profileId.toString()]
          },
          {
            FieldName: "section_c",
            Operator: "EqualTo",
            Values: [section]
          },
          {
            FieldName: "question_c",
            Operator: "EqualTo",
            Values: [question]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success || response.data.length === 0) {
        return "I don't have a specific answer for this question. Please configure more responses.";
      }

      return response.data[0].response_c;
    } catch (error) {
      console.error("Error fetching chatbot response:", error.message);
      return "I'm having trouble accessing my knowledge base right now. Please try again later.";
    }
  }

  async updateResponse(profileId, section, question, responseText) {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      // Check if response already exists
      const existingParams = {
        fields: [{ field: { Name: "Id" } }],
        where: [
          {
            FieldName: "profile_id_c",
            Operator: "EqualTo",
            Values: [profileId.toString()]
          },
          {
            FieldName: "section_c",
            Operator: "EqualTo",
            Values: [section]
          },
          {
            FieldName: "question_c",
            Operator: "EqualTo",
            Values: [question]
          }
        ]
      };

      const existingResponse = await this.apperClient.fetchRecords(this.tableName, existingParams);

      if (existingResponse.success && existingResponse.data.length > 0) {
        // Update existing response
        const updateParams = {
          records: [
            {
              Id: existingResponse.data[0].Id,
              response_c: responseText
            }
          ]
        };

        const updateResult = await this.apperClient.updateRecord(this.tableName, updateParams);
        return updateResult.success;
      } else {
        // Create new response
        const createParams = {
          records: [
            {
              Name: `${section} - ${question.substring(0, 50)}`,
              profile_id_c: parseInt(profileId),
              section_c: section,
              question_c: question,
              response_c: responseText
            }
          ]
        };

        const createResult = await this.apperClient.createRecord(this.tableName, createParams);
        
        if (!createResult.success) {
          console.error(createResult.message);
          return false;
        }

        if (createResult.results) {
          const failedRecords = createResult.results.filter(result => !result.success);
          
          if (failedRecords.length > 0) {
            console.error(`Failed to create chatbot responses ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
            return false;
          }
        }

        return true;
      }
    } catch (error) {
      console.error("Error updating chatbot response:", error.message);
      return false;
    }
  }

  async getAllResponses() {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      const params = {
        fields: [
          { field: { Name: "profile_id_c" } },
          { field: { Name: "section_c" } },
          { field: { Name: "question_c" } },
          { field: { Name: "response_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return { responses: {} };
      }

      // Structure responses in the expected format
      const structuredResponses = {};

      response.data.forEach(item => {
        const profileId = item.profile_id_c?.toString() || item.profile_id_c;
        const section = item.section_c;
        const question = item.question_c;
        const responseText = item.response_c;

        if (!structuredResponses[profileId]) {
          structuredResponses[profileId] = {};
        }

        if (!structuredResponses[profileId][section]) {
          structuredResponses[profileId][section] = {};
        }

        structuredResponses[profileId][section][question] = responseText;
      });

      return { responses: structuredResponses };
    } catch (error) {
      console.error("Error fetching all chatbot responses:", error.message);
      return { responses: {} };
    }
  }
}

export const chatbotService = new ChatbotService();