import resultsData from "@/services/mockData/results.json";

class ResultsService {
  constructor() {
    this.data = [...resultsData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const item = this.data.find(item => item.Id === parseInt(id));
    if (!item) {
      throw new Error("Result not found");
    }
    return { ...item };
  }

  async getByClientId(clientId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.data.filter(item => item.clientId === parseInt(clientId));
  }

  async create(result) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(0, ...this.data.map(item => item.Id)) + 1;
    const newResult = {
      ...result,
      Id: newId,
      timestamp: new Date().toISOString()
    };
    this.data.push(newResult);
    return { ...newResult };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Result not found");
    }
    this.data.splice(index, 1);
    return true;
  }
}

export const resultsService = new ResultsService();