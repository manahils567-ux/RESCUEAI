'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchFloodData } from '../lib/api';

export default function AIChatbot({ language = 'ur' }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gemini, setGemini] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const initGemini = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          setGemini(genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }));
        }
      } catch (err) {
        console.error('Gemini init error:', err);
      }
      
      setChat([{
        role: 'bot',
        text: language === 'ur' 
          ? '🤖 BACHAO AI Assistant یہاں ہے۔ میں آپ کی مدد کیسے کر سکتا ہوں؟'
          : '🤖 BACHAO AI Assistant here. How can I help you with flood response?'
      }]);
    };
    
    initGemini();
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = async () => {
    if (!message.trim() || !gemini) {
      // Fallback if Gemini not ready
      setChat(prev => [...prev, { 
        role: 'bot', 
        text: language === 'ur' ? 'معاف کیجیے، میں ابھی تیار نہیں ہوں۔' : 'Sorry, I am not ready yet.' 
      }]);
      return;
    }

    const userMessage = message;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setMessage('');
    setIsLoading(true);

    try {
      // Fetch fresh flood data
      const floodData = await fetchFloodData();
      const context = floodData && floodData.length > 0 ? JSON.stringify(floodData.slice(0, 7)) : 'No real-time data available';
      
      const prompt = `You are BACHAO+, a flood emergency assistant for Pakistan. 
      
Current flood risk data: ${context}

User question: ${userMessage}

IMPORTANT: 
- Answer in ${language === 'ur' ? 'URDU language only' : 'ENGLISH language only'}
- Be concise and actionable
- If user asks about road status, suggest checking official sources
- If user asks about camps, provide nearest camp information based on district
- Be helpful but don't make up false information`;

      const result = await gemini.generateContent(prompt);
      const response = await result.response.text();

      setChat(prev => [...prev, { role: 'bot', text: response }]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setChat(prev => [...prev, { 
        role: 'bot', 
        text: language === 'ur' 
          ? 'معاف کیجیے، میں اس وقت جواب نہیں دے سکتا۔ براہ کرم بعد میں کوشش کریں۔' 
          : 'Sorry, I cannot respond right now. Please try again later.' 
      }]);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ background: '#0f0f1a', borderRadius: '10px', border: '1px solid #2a2a3e', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #2a2a3e', background: '#1a1a2e', borderRadius: '10px 10px 0 0' }}>
        <h3 style={{ fontSize: '12px', fontWeight: 600, margin: 0, color: '#fff' }}>
          🤖 AI Flood Assistant <span style={{ fontSize: '10px', color: '#3b82f6' }}>● Gemini API</span>
        </h3>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {chat.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              background: msg.role === 'user' ? '#3b82f6' : '#2a2a3e',
              padding: '8px 12px',
              borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
              fontSize: '12px',
              color: '#fff',
              maxWidth: '85%',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ background: '#2a2a3e', padding: '8px 12px', borderRadius: '14px', display: 'inline-block' }}>
              <span style={{ animation: 'pulse 1s infinite' }}>●</span>
              <span style={{ animation: 'pulse 1s infinite 0.2s', marginLeft: '4px' }}>●</span>
              <span style={{ animation: 'pulse 1s infinite 0.4s', marginLeft: '4px' }}>●</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid #2a2a3e' }}>
        {[
          { textUr: '🚗 سڑک کی معلومات', textEn: '🚗 Road info', query: 'What is the road status near Nowshera?' },
          { textUr: '🏕️ قریبی کیمپ', textEn: '🏕️ Nearest camp', query: 'Where is the nearest relief camp in Rajanpur?' },
          { textUr: '🌊 سیلاب کی پیش گوئی', textEn: '🌊 Flood forecast', query: 'What is the flood forecast for next 48 hours?' }
        ].map((qr, idx) => (
          <button
            key={idx}
            onClick={() => setMessage(language === 'ur' ? qr.query : qr.query)}
            style={{ background: 'transparent', border: '1px solid #3b82f6', padding: '4px 10px', borderRadius: '16px', color: '#fff', fontSize: '10px', cursor: 'pointer' }}
          >
            {language === 'ur' ? qr.textUr : qr.textEn}
          </button>
        ))}
      </div>

      <div style={{ padding: '8px 12px 12px', display: 'flex', gap: '8px', borderTop: '1px solid #2a2a3e' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={language === 'ur' ? 'کچھ پوچھیں...' : 'Ask anything...'}
          style={{ flex: 1, background: '#2a2a3e', border: 'none', padding: '8px 12px', borderRadius: '20px', color: '#fff', fontSize: '11px', outline: 'none' }}
        />
        <button onClick={handleSend} style={{ background: '#3b82f6', border: 'none', padding: '6px 16px', borderRadius: '20px', color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Send</button>
      </div>
    </div>
  );
}