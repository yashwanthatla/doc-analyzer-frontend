import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = {
  async sendMessage(message: string) {
    const response = await axios.post(`${API_URL}/analyze`, {
      message,
      type: 'text'
    });
    return response.data
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};