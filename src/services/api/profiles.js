import profilesData from "@/services/mockData/profiles.json";

class ProfilesService {
  constructor() {
    this.data = [...profilesData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const item = this.data.find(item => item.Id === parseInt(id));
    if (!item) {
      throw new Error("Profile not found");
    }
    return { ...item };
  }

  async create(profile) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(0, ...this.data.map(item => item.Id)) + 1;
    const newProfile = {
      ...profile,
      Id: newId,
      createdAt: new Date().toISOString()
    };
    this.data.push(newProfile);
    return { ...newProfile };
  }

  async update(id, profile) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Profile not found");
    }
    this.data[index] = { ...this.data[index], ...profile, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Profile not found");
    }
    this.data.splice(index, 1);
    return true;
  }
}

export const profilesService = new ProfilesService();