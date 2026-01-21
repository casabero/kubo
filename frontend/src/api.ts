const API_URL = import.meta.env.VITE_API_URL || 'https://api-kubo.casabero.com';

export const apiClient = {
    getHeaders: () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    },

    get: async (endpoint: string) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: apiClient.getHeaders()
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    },
    post: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: apiClient.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    },

    // Exam Methods
    startExam: async (assessmentId: string) => {
        return apiClient.post('/exams/start', { assessmentId });
    },
    submitAnswer: async (payload: { sessionId: string, questionId: string, chosenOption: string, timeSpent: number }) => {
        return apiClient.post('/exams/answer', payload);
    }
};
