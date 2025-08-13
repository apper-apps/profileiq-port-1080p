class QuestionnairesService {
  constructor() {
    this.tableName = 'questionnaire_c';
    this.questionsTableName = 'question_c';
    this.answersTableName = 'answer_c';
    this.competenciesTableName = 'competency_c';
    this.apperClient = null;
    this.initializeApperClient();
  }

async initializeApperClient() {
    if (typeof window !== 'undefined') {
      // Wait a bit for SDK to load if it's not immediately available
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts && !window.ApperSDK) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (window.ApperSDK) {
        const { ApperClient } = window.ApperSDK;
        this.apperClient = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
      }
    }
  }

async getAll() {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          console.warn('Apper SDK not available, falling back to mock data');
          return [];
        }
      }
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "is_active_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Get questions for each questionnaire
      const questionnairesWithQuestions = await Promise.all(response.data.map(async (questionnaire) => {
        const questions = await this.getQuestionsByQuestionnaire(questionnaire.Id);
        return {
          ...questionnaire,
          title: questionnaire.title_c || questionnaire.Name,
          description: questionnaire.description_c,
          createdAt: questionnaire.created_at_c || questionnaire.CreatedOn,
          isActive: questionnaire.is_active_c,
          questions: questions
        };
      }));

      return questionnairesWithQuestions;
    } catch (error) {
      console.error("Error fetching questionnaires:", error.message);
      throw error;
    }
  }

async getQuestionsByQuestionnaire(questionnaireId) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "text_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "weight_c" } }
        ],
        where: [
          {
            FieldName: "questionnaire_id_c",
            Operator: "EqualTo",
            Values: [questionnaireId.toString()]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.questionsTableName, params);

      if (!response.success) {
        return [];
      }

      // Get answers and competencies for each question
      const questionsWithDetails = await Promise.all(response.data.map(async (question) => {
        const [answers, competencies] = await Promise.all([
          this.getAnswersByQuestion(question.Id),
          this.getCompetenciesByQuestion(question.Id)
        ]);
        
        return {
          ...question,
          text: question.text_c,
          type: question.type_c,
          weight: question.weight_c,
          answers: answers,
          competencies: competencies
        };
      }));
return questionsWithDetails;
    } catch (error) {
      console.error("Error fetching questions:", error.message);
      
      // Throw network and API errors to allow proper error handling in UI
      if (error.message.includes('Network Error') || error.message.includes('ApperSDK not available')) {
        throw error;
      }
      
      // Return empty array for other processing errors
      return [];
    }
  }

async getAnswersByQuestion(questionId) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }

      const params = {
        fields: [
          { field: { Name: "value_c" } },
          { field: { Name: "points_c" } }
        ],
        where: [
          {
            FieldName: "question_id_c",
            Operator: "EqualTo",
            Values: [questionId.toString()]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.answersTableName, params);

      if (!response.success) {
        return [];
      }

      return response.data.map(answer => ({
        value: answer.value_c,
        points: answer.points_c
}));
    } catch (error) {
      console.error("Error fetching answers:", error.message);
      
      // Throw network and API errors to allow proper error handling in UI
      if (error.message.includes('Network Error') || error.message.includes('ApperSDK not available')) {
        throw error;
      }
      
      // Return empty array for other processing errors
      return [];
    }
  }

async getCompetenciesByQuestion(questionId) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      const params = {
        fields: [
          { field: { Name: "Name" } }
        ],
        where: [
          {
            FieldName: "question_id_c",
            Operator: "EqualTo",
            Values: [questionId.toString()]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.competenciesTableName, params);

      if (!response.success) {
        return [];
      }

return response.data.map(comp => comp.Name);
    } catch (error) {
      console.error("Error fetching competencies:", error.message);
      
      // Throw network and API errors to allow proper error handling in UI
      if (error.message.includes('Network Error') || error.message.includes('ApperSDK not available')) {
        throw error;
      }
      
      // Return empty array for other processing errors
      return [];
    }
  }

async getById(id) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "is_active_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const questions = await this.getQuestionsByQuestionnaire(id);

      return {
        ...response.data,
        title: response.data.title_c || response.data.Name,
        description: response.data.description_c,
        createdAt: response.data.created_at_c,
        isActive: response.data.is_active_c,
        questions: questions
      };
    } catch (error) {
      console.error(`Error fetching questionnaire with ID ${id}:`, error.message);
      throw error;
    }
  }

async create(questionnaire) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }

      const params = {
        records: [
          {
            Name: questionnaire.title,
            title_c: questionnaire.title,
            description_c: questionnaire.description,
            created_at_c: new Date().toISOString(),
            is_active_c: true
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create questionnaires ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }

        if (successfulRecords.length > 0) {
          const createdQuestionnaire = successfulRecords[0].data;
          const questionnaireId = createdQuestionnaire.Id;

          // Create questions if provided
          if (questionnaire.questions && questionnaire.questions.length > 0) {
            await this.createQuestions(questionnaireId, questionnaire.questions);
          }

          return {
            ...createdQuestionnaire,
            title: createdQuestionnaire.title_c || createdQuestionnaire.Name,
            description: createdQuestionnaire.description_c,
            createdAt: createdQuestionnaire.created_at_c,
            isActive: createdQuestionnaire.is_active_c,
            questions: questionnaire.questions || []
          };
        }
      }

      throw new Error("Failed to create questionnaire");
    } catch (error) {
      console.error("Error creating questionnaire:", error.message);
      throw error;
    }
  }
async createQuestions(questionnaireId, questions) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      
      for (const question of questions) {
        // Create question
        const questionParams = {
          records: [
            {
              Name: question.text?.substring(0, 100) || "Question",
              text_c: question.text,
              type_c: question.type,
              weight_c: question.weight || 1,
              questionnaire_id_c: questionnaireId
            }
          ]
        };

        const questionResponse = await this.apperClient.createRecord(this.questionsTableName, questionParams);

        if (questionResponse.success && questionResponse.results?.[0]?.success) {
          const questionId = questionResponse.results[0].data.Id;

          // Create answers if provided
          if (question.answers && question.answers.length > 0) {
            await this.createAnswers(questionId, question.answers);
          }

          // Create competencies if provided
          if (question.competencies && question.competencies.length > 0) {
            await this.createCompetencies(questionId, question.competencies);
          }
        }
      }
    } catch (error) {
      console.error("Error creating questions:", error.message);
    }
  }

  async createAnswers(questionId, answers) {
    try {
      const answerRecords = answers.map(answer => ({
        Name: `Answer: ${answer.value}`,
        value_c: answer.value?.toString() || "",
        points_c: answer.points || 0,
        question_id_c: questionId
      }));

      const params = {
        records: answerRecords
      };

      await this.apperClient.createRecord(this.answersTableName, params);
    } catch (error) {
      console.error("Error creating answers:", error.message);
    }
  }

  async createCompetencies(questionId, competencies) {
    try {
      const competencyRecords = competencies.map(comp => ({
        Name: comp,
        question_id_c: questionId
      }));

      const params = {
        records: competencyRecords
      };

      await this.apperClient.createRecord(this.competenciesTableName, params);
    } catch (error) {
      console.error("Error creating competencies:", error.message);
    }
  }

async update(id, questionnaire) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      const params = {
        records: [
          {
            Id: id,
            Name: questionnaire.title,
            title_c: questionnaire.title,
            description_c: questionnaire.description,
            is_active_c: questionnaire.isActive
          }
        ]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Update questions if provided
      if (questionnaire.questions) {
        await this.updateQuestions(id, questionnaire.questions);
      }

      return await this.getById(id);
    } catch (error) {
      console.error("Error updating questionnaire:", error.message);
      throw error;
    }
  }

async updateQuestions(questionnaireId, questions) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      // Delete existing questions and related data
      await this.deleteQuestionsByQuestionnaire(questionnaireId);

      // Create new questions
      if (questions.length > 0) {
        await this.createQuestions(questionnaireId, questions);
      }
    } catch (error) {
      console.error("Error updating questions:", error.message);
    }
  }

async deleteQuestionsByQuestionnaire(questionnaireId) {
    try {
      if (!this.apperClient) {
await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      // Get all question IDs for this questionnaire
      const params = {
        fields: [{ field: { Name: "Id" } }],
        where: [
          {
            FieldName: "questionnaire_id_c",
            Operator: "EqualTo",
            Values: [questionnaireId.toString()]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.questionsTableName, params);

      if (response.success && response.data.length > 0) {
        const questionIds = response.data.map(q => q.Id);

        // Delete answers and competencies for each question
        for (const questionId of questionIds) {
          await this.deleteAnswersByQuestion(questionId);
          await this.deleteCompetenciesByQuestion(questionId);
        }

        // Delete questions
        const deleteParams = {
          RecordIds: questionIds
        };

        await this.apperClient.deleteRecord(this.questionsTableName, deleteParams);
      }
    } catch (error) {
      console.error("Error deleting questions:", error.message);
    }
  }

async deleteAnswersByQuestion(questionId) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      const params = {
        fields: [{ field: { Name: "Id" } }],
        where: [
          {
            FieldName: "question_id_c",
            Operator: "EqualTo",
            Values: [questionId.toString()]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.answersTableName, params);

      if (response.success && response.data.length > 0) {
        const answerIds = response.data.map(a => a.Id);
        const deleteParams = {
          RecordIds: answerIds
        };

        await this.apperClient.deleteRecord(this.answersTableName, deleteParams);
      }
    } catch (error) {
      console.error("Error deleting answers:", error.message);
    }
  }

async deleteCompetenciesByQuestion(questionId) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      const params = {
        fields: [{ field: { Name: "Id" } }],
        where: [
          {
            FieldName: "question_id_c",
            Operator: "EqualTo",
            Values: [questionId.toString()]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.competenciesTableName, params);

      if (response.success && response.data.length > 0) {
        const compIds = response.data.map(c => c.Id);
        const deleteParams = {
          RecordIds: compIds
        };

        await this.apperClient.deleteRecord(this.competenciesTableName, deleteParams);
      }
    } catch (error) {
      console.error("Error deleting competencies:", error.message);
    }
  }

async delete(id) {
    try {
if (!this.apperClient) {
        await this.initializeApperClient();
        if (!this.apperClient) {
          throw new Error('ApperSDK not available. Please ensure the SDK is loaded.');
        }
      }
      // Delete associated questions and related data first
      await this.deleteQuestionsByQuestionnaire(id);

      // Delete questionnaire
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting questionnaire:", error.message);
      throw error;
    }
  }
}
export const questionnairesService = new QuestionnairesService();