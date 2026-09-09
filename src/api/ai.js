import { apiFetch } from './apiClient';

/**
 * Send a message to the AI
 * @param {string} message - The user's message
 * @param {Object} options - Optional parameters like temperature, max_tokens
 * @returns {Promise<string>} - The AI response
 */
export const sendMessageToAI = async (message, options = {}) => {
  try {
    const { temperature = 0.7, max_tokens = 2048 } = options;
    
    const response = await apiFetch('/ai/chat', {
      method: 'POST',
      body: {
        messages: [
          { role: 'user', content: message }
        ],
        temperature,
        max_tokens,
      },
    });

    return response.data?.message || 'No response from AI.';
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};

/**
 * Send a message to the AI with streaming response
 * @param {string} message - The user's message
 * @param {Function} onChunk - Callback for each chunk of the response
 * @param {Object} options - Optional parameters
 */
export const sendStreamMessageToAI = async (message, onChunk, options = {}) => {
  try {
    const { temperature = 0.7, max_tokens = 2048 } = options;
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: message }
        ],
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get streaming response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '' || !line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.content) {
            onChunk(parsed.content);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  } catch (error) {
    console.error('Stream Error:', error);
    throw error;
  }
};