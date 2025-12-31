// src/utils/api.js
const API_BASE_URL = 'https://govdoc-genie-279947895522.asia-south1.run.app';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async analyzeDocuments(formData) {
    try {
      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          // Note: Don't set Content-Type for FormData, browser sets it automatically
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  async getSystemStatus() {
    try {
      const response = await fetch(`${this.baseURL}/system-status`);
      return await response.json();
    } catch (error) {
      console.error('Status error:', error);
      throw error;
    }
  }

  async testPatterns(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${this.baseURL}/test-patterns`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Pattern test error:', error);
      throw error;
    }
  }

  async debugDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${this.baseURL}/debug-document`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Debug error:', error);
      throw error;
    }
  }

  async generateReport(analysisData) {
    try {
      const response = await fetch(`${this.baseURL}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }
}

export default new ApiService();