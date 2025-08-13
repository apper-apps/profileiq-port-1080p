import questionnaireData from "@/services/mockData/questionnaires.json";

class QuestionnairesService {
  constructor() {
    this.data = [...questionnaireData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const item = this.data.find(item => item.Id === parseInt(id));
    if (!item) {
      throw new Error("Questionnaire not found");
    }
    return { ...item };
  }

  async create(questionnaire) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(0, ...this.data.map(item => item.Id)) + 1;
    const newQuestionnaire = {
      ...questionnaire,
      Id: newId,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    this.data.push(newQuestionnaire);
    return { ...newQuestionnaire };
  }

  async update(id, questionnaire) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Questionnaire not found");
    }
    this.data[index] = { ...this.data[index], ...questionnaire, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Questionnaire not found");
    }
    this.data.splice(index, 1);
    return true;
  }
}

export const questionnairesService = new QuestionnairesService();