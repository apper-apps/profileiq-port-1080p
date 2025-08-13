import clientsData from "@/services/mockData/clients.json";

class ClientsService {
  constructor() {
    this.data = [...clientsData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const item = this.data.find(item => item.Id === parseInt(id));
    if (!item) {
      throw new Error("Client not found");
    }
    return { ...item };
  }

  async create(client) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(0, ...this.data.map(item => item.Id)) + 1;
    const newClient = {
      ...client,
      Id: newId,
      createdAt: new Date().toISOString(),
      apiKey: this.generateApiKey()
    };
    this.data.push(newClient);
    return { ...newClient };
  }

  async update(id, client) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Client not found");
    }
    this.data[index] = { ...this.data[index], ...client, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Client not found");
    }
    this.data.splice(index, 1);
    return true;
  }

  async addCredits(id, credits, reason) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Client not found");
    }
    
    this.data[index].credits += credits;
    this.data[index].usage.push({
      Id: Math.max(0, ...this.data[index].usage.map(u => u.Id)) + 1,
      type: "credit_added",
      amount: credits,
      reason: reason,
      timestamp: new Date().toISOString(),
      balance: this.data[index].credits
    });
    
    return { ...this.data[index] };
  }

  generateApiKey() {
    return "profileiq_" + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
  }
}

export const clientsService = new ClientsService();