import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Send,
  Bot,
  User,
  FileText,
  Code,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function YourGPTPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${user?.name || 'Student'}! 👋 I am Your GPT, your personal AI academic assistant. Ask me anything about your enrolled courses, lecture notes, code examples, or exam preparations!`,
      time: 'Just now',
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const promptSuggestions = [
    { label: 'Generate a 7-day study schedule for my midterms', icon: Sparkles },
    { label: 'What are the best study techniques for exams?', icon: Lightbulb }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const isDisabled = false;

  const handleSendMessage = (textToSend) => {
    if (isDisabled) return;

    const text = textToSend || inputPrompt;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    setTimeout(() => {
      let aiResponseText = `I have analyzed your request regarding: "${text}". Here is a helpful structured summary:\n\n1. **Core Concept**: Break down the topic into digestible milestones.\n2. **Action Item**: Review your course materials in the Courses tab.\n3. **Recommendation**: Practice key exercises and test your understanding with sample questions.`;

      if (text.toLowerCase().includes('recursion')) {
        aiResponseText = `**Recursion Explanation**:\nRecursion occurs when a function calls itself until it reaches a base condition.\n\n\`\`\`javascript\nfunction factorial(n) {\n  if (n <= 1) return 1; // Base Case\n  return n * factorial(n - 1); // Recursive Step\n}\nconsole.log(factorial(5)); // Output: 120\n\`\`\``;
      } else if (text.toLowerCase().includes('gpa')) {
        aiResponseText = `**Target GPA Strategy**:\nTo boost your GPA next semester:\n- Focus on 4-credit core courses first.\n- Maintain grade points above 3.5 in all enrolled subjects.\n- Use our built-in **GPA Calculator** tab to estimate required course grades!`;
      } else if (text.toLowerCase().includes('study schedule') || text.toLowerCase().includes('7-day')) {
        aiResponseText = `**7-Day Midterm Study Schedule**:\n\n**Day 1-2**: Review all lecture notes and identify key topics.\n**Day 3-4**: Practice problems and past exam questions.\n**Day 5**: Group study session with classmates.\n**Day 6**: Take a full practice test under timed conditions.\n**Day 7**: Light review of weak areas and get good rest! 📚`;
      } else if (text.toLowerCase().includes('study techniques')) {
        aiResponseText = `**Best Study Techniques for Exams**:\n\n1. **Pomodoro Technique**: Study for 25 minutes, take 5-minute breaks.\n2. **Active Recall**: Test yourself instead of just re-reading notes.\n3. **Spaced Repetition**: Review material at increasing intervals.\n4. **Teach Others**: Explain concepts to someone else to solidify understanding.\n5. **Mind Maps**: Create visual connections between topics. 🎯`;
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleSuggestionClick = (label) => {
    if (isDisabled) return;
    handleSendMessage(label);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled) return;
    handleSendMessage();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Chat Container */}
      <div className="attmark-card flex-1 flex flex-col min-h-0">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-blue-600'
                  }`}
              >
                {msg.sender === 'user' ? (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
              >
                <div className="font-semibold text-[10px] opacity-75 mb-1 flex items-center justify-between gap-4">
                  <span>{msg.sender === 'user' ? user?.name || 'You' : 'Your GPT AI'}</span>
                  <span>{msg.time}</span>
                </div>
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Your GPT is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions - DISABLED (Original styling preserved) */}
        {messages.length <= 1 && (
          <div className="px-6 pb-3">
            <div className='flex justify-between'>
              <p className="text-xs font-semibold text-slate-400 mb-2">Try asking about:</p>
              <p className="text-xs font-semibold text-slate-400 mb-2">⚠️ AI chat is currently disabled</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {promptSuggestions.map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-xs font-medium">{suggestion.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar - DISABLED */}
        <div className="p-4 pt-3 border-t border-slate-100 flex items-center space-x-3">
          <input
            type="text"
            placeholder="AI chat is currently disabled"
            value=""
            disabled={true}
            className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 placeholder-slate-400 cursor-not-allowed"
          />
          <button
            type="button"
            disabled={true}
            className="px-5 py-3 bg-slate-300 text-slate-500 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-not-allowed"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}