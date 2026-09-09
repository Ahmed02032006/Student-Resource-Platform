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
import { sendMessageToAI, sendStreamMessageToAI } from '../api/ai';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    { label: 'What are the best study techniques for exams?', icon: Lightbulb },
    { label: 'Explain recursion with a code example', icon: Code },
    { label: 'How do I improve my GPA this semester?', icon: HelpCircle },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Check if user is allowed to interact (authenticated and not admin)
  const canInteract = isAuthenticated && user?.role !== 'admin';

  const handleSendMessage = async (textToSend) => {
    if (!canInteract) return;

    const text = textToSend || inputPrompt;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      // Call the AI API
      const response = await sendMessageToAI(text.trim(), {
        temperature: 0.7,
        max_tokens: 2048,
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response || 'Sorry, I could not process your request. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Error:', error);
      toast.error(error.message || 'Failed to get response from AI. Please try again.');
      
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: '⚠️ Sorry, I encountered an error while processing your request. Please try again later.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Streaming version (for longer responses)
  const handleSendMessageStream = async (textToSend) => {
    if (!canInteract) return;

    const text = textToSend || inputPrompt;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    // Create a placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      await sendStreamMessageToAI(
        text.trim(),
        (chunk) => {
          // Update the AI message with streaming content
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMsgId
                ? { ...msg, text: msg.text + chunk }
                : msg
            )
          );
        },
        {
          temperature: 0.7,
          max_tokens: 2048,
        }
      );
    } catch (error) {
      console.error('Stream Error:', error);
      toast.error(error.message || 'Failed to get response from AI.');
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMsgId
            ? { ...msg, text: '⚠️ Error: Failed to get response. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (label) => {
    if (!canInteract) return;
    handleSendMessage(label);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canInteract) return;
    handleSendMessage();
  };

  // Custom markdown components for better styling
  const MarkdownComponents = {
    // Headers
    h1: ({ children }) => <h1 className="text-lg font-bold text-slate-900 mt-3 mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-bold text-slate-900 mt-3 mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-bold text-slate-800 mt-2 mb-1.5">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xs font-bold text-slate-800 mt-2 mb-1">{children}</h4>,
    
    // Paragraphs
    p: ({ children }) => <p className="text-xs text-slate-700 mb-1.5 leading-relaxed">{children}</p>,
    
    // Lists
    ul: ({ children }) => <ul className="list-disc pl-4 my-1.5 space-y-0.5">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-4 my-1.5 space-y-0.5">{children}</ol>,
    li: ({ children }) => <li className="text-xs text-slate-700 leading-relaxed">{children}</li>,
    
    // Code blocks
    code: ({ children, className }) => {
      const isInline = !className;
      if (isInline) {
        return <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-blue-600">{children}</code>;
      }
      return (
        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg my-2 overflow-x-auto">
          <code className="text-xs font-mono">{children}</code>
        </pre>
      );
    },
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-400 pl-3 my-2 py-1 bg-blue-50 rounded-r-lg">
        {children}
      </blockquote>
    ),
    
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto my-2">
        <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg text-xs">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 border-r border-slate-200">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-200">{children}</td>,
    
    // Horizontal rule
    hr: () => <hr className="my-3 border-t border-slate-200" />,
    
    // Strong/Bold
    strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
    
    // Emphasis
    em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
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
                <div className="whitespace-pre-wrap font-sans">
                  {msg.sender === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {msg.text || (msg.sender === 'ai' && isGenerating ? 'Thinking...' : '')}
                    </ReactMarkdown>
                  )}
                </div>
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

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-3">
            <div className='flex justify-between items-center mb-2'>
              <p className="text-xs font-semibold text-slate-500">Try asking about:</p>
              {!canInteract && (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  ⚠️ Login required
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {promptSuggestions.map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion.label)}
                    disabled={!canInteract}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      canInteract
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 cursor-pointer hover:border-blue-200'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${
                      canInteract ? 'text-blue-600' : 'text-slate-400'
                    }`} />
                    <span className="truncate">{suggestion.label}</span>
                  </button>
                );
              })}
            </div>
            {!canInteract && (
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Please login as a student to use the AI assistant
              </p>
            )}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-4 pt-3 border-t border-slate-100 flex items-center space-x-3"
        >
          <input
            type="text"
            placeholder={canInteract ? "Ask Your GPT any academic question..." : "Please login to use this feature"}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={!canInteract}
            className={`flex-1 px-4 py-3 border rounded-xl text-xs placeholder-slate-400 focus:outline-none transition-all ${
              canInteract
                ? 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGenerating || !canInteract}
            className={`px-5 py-3 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              canInteract && inputPrompt.trim() && !isGenerating
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}