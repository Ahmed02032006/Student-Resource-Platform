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
  Sparkles,
  Trash2
} from 'lucide-react';
import { sendMessageToAI, sendStreamMessageToAI } from '../api/ai';
import toast from 'react-hot-toast';

const CHAT_STORAGE_KEY = 'your_gpt_chat_history';

export default function YourGPTPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState([]);
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

  // Load chat from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (parsed && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (error) {
        console.error('Failed to parse saved chat:', error);
      }
    }
    
    // Default welcome message if no saved chat
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: `Hello ${user?.name || 'Student'}! 👋 I am Your GPT, your personal AI academic assistant. Ask me anything about your enrolled courses, lecture notes, code examples, or exam preparations!`,
        time: 'Just now',
      },
    ]);
  }, [user?.name]);

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save chat:', error);
      }
    }
  }, [messages]);

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

  const handleClearChat = () => {
    if (messages.length <= 1 && messages[0]?.sender === 'ai' && messages[0]?.text.includes('Hello')) {
      toast('Chat is already empty');
      return;
    }

    // Show confirmation dialog
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      // Clear localStorage
      localStorage.removeItem(CHAT_STORAGE_KEY);
      
      // Reset to welcome message
      setMessages([
        {
          id: '1',
          sender: 'ai',
          text: `Hello ${user?.name || 'Student'}! 👋 I am Your GPT, your personal AI academic assistant. Ask me anything about your enrolled courses, lecture notes, code examples, or exam preparations!`,
          time: 'Just now',
        },
      ]);
      
      toast.success('Chat cleared successfully');
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

  // Custom function to format AI response text
  const formatAIText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const formattedLines = [];
    let inTable = false;
    let tableRows = [];
    let inCodeBlock = false;
    let codeContent = [];
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (line.trim().startsWith('```') && !inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '').trim();
        codeContent = [];
        continue;
      }

      if (line.trim() === '```' && inCodeBlock) {
        inCodeBlock = false;
        formattedLines.push(
          <div key={`code-${i}`} className="bg-slate-900 rounded-lg p-3 my-2 overflow-x-auto">
            <div className="text-[10px] text-slate-400 font-mono mb-1">{codeLanguage || 'code'}</div>
            <pre className="text-xs font-mono text-slate-100 whitespace-pre-wrap">
              {codeContent.join('\n')}
            </pre>
          </div>
        );
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      if (line.includes('|') && !inTable) {
        inTable = true;
        tableRows = [line];
        continue;
      }

      if (inTable) {
        if (line.includes('|')) {
          tableRows.push(line);
        } else {
          inTable = false;
          formattedLines.push(renderTable(tableRows));
          tableRows = [];
          if (line.trim()) {
            formattedLines.push(renderTextLine(line, i));
          }
          continue;
        }
        continue;
      }

      if (line.trim()) {
        formattedLines.push(renderTextLine(line, i));
      } else {
        formattedLines.push(<div key={`empty-${i}`} className="h-1.5" />);
      }
    }

    if (inTable && tableRows.length > 0) {
      formattedLines.push(renderTable(tableRows));
    }

    return formattedLines;
  };

  const renderTable = (rows) => {
    if (rows.length === 0) return null;

    const parsedRows = rows.map(row => {
      return row.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
    });

    const isSeparatorRow = (cells) => {
      return cells.every(cell => /^[-:]+$/.test(cell));
    };

    const headerRow = parsedRows.find(row => !isSeparatorRow(row));
    const dataRows = parsedRows.filter(row => !isSeparatorRow(row) && row !== headerRow);

    if (!headerRow) return null;

    return (
      <div key={`table-${Date.now()}`} className="overflow-x-auto my-2">
        <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg text-xs">
          <thead className="bg-slate-50">
            <tr>
              {headerRow.map((cell, idx) => (
                <th key={idx} className="px-3 py-2 text-left text-xs font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  {formatInlineText(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataRows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2 text-xs text-slate-600 border-r border-slate-200 last:border-r-0">
                    {formatInlineText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const formatInlineText = (text) => {
    if (!text) return text;

    let parts = [];
    let currentText = text;
    let boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(currentText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(currentText.substring(lastIndex, match.index));
      }
      parts.push(<strong key={`bold-${match.index}`} className="font-bold text-slate-900">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }

    if (parts.length === 0) {
      let italicParts = [];
      let italicText = text;
      let italicRegex = /\*(.*?)\*/g;
      let italicMatch;
      let italicLastIndex = 0;

      while ((italicMatch = italicRegex.exec(italicText)) !== null) {
        if (italicMatch.index > italicLastIndex) {
          italicParts.push(italicText.substring(italicLastIndex, italicMatch.index));
        }
        italicParts.push(<em key={`italic-${italicMatch.index}`} className="italic text-slate-700">{italicMatch[1]}</em>);
        italicLastIndex = italicMatch.index + italicMatch[0].length;
      }
      if (italicLastIndex < italicText.length) {
        italicParts.push(italicText.substring(italicLastIndex));
      }

      if (italicParts.length === 0) {
        let codeParts = [];
        let codeText = text;
        let codeRegex = /`(.*?)`/g;
        let codeMatch;
        let codeLastIndex = 0;

        while ((codeMatch = codeRegex.exec(codeText)) !== null) {
          if (codeMatch.index > codeLastIndex) {
            codeParts.push(codeText.substring(codeLastIndex, codeMatch.index));
          }
          codeParts.push(<code key={`code-${codeMatch.index}`} className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-blue-600">{codeMatch[1]}</code>);
          codeLastIndex = codeMatch.index + codeMatch[0].length;
        }
        if (codeLastIndex < codeText.length) {
          codeParts.push(codeText.substring(codeLastIndex));
        }

        if (codeParts.length === 0) {
          return text;
        }
        return codeParts;
      }
      return italicParts;
    }
    return parts;
  };

  const renderTextLine = (line, index) => {
    if (line.startsWith('### ')) {
      return <h3 key={`h3-${index}`} className="text-sm font-bold text-slate-800 mt-3 mb-1.5">{line.replace('### ', '')}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={`h2-${index}`} className="text-base font-bold text-slate-900 mt-3 mb-2">{line.replace('## ', '')}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={`h1-${index}`} className="text-lg font-bold text-slate-900 mt-3 mb-2">{line.replace('# ', '')}</h1>;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <div key={`li-${index}`} className="flex items-start gap-1.5 my-0.5">
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-xs text-slate-700">{formatInlineText(line.substring(2))}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s/);
      const number = match ? match[1] : '';
      const content = line.replace(/^\d+\.\s/, '');
      return (
        <div key={`li-${index}`} className="flex items-start gap-1.5 my-0.5">
          <span className="text-slate-400 text-xs font-medium">{number}.</span>
          <span className="text-xs text-slate-700">{formatInlineText(content)}</span>
        </div>
      );
    }

    if (line.startsWith('> ')) {
      return (
        <blockquote key={`quote-${index}`} className="border-l-4 border-blue-400 pl-3 my-2 py-1 bg-blue-50 rounded-r-lg">
          <p className="text-xs text-slate-700">{formatInlineText(line.substring(2))}</p>
        </blockquote>
      );
    }

    if (/^[-*_]{3,}$/.test(line.trim())) {
      return <hr key={`hr-${index}`} className="my-3 border-t border-slate-200" />;
    }

    return (
      <p key={`p-${index}`} className="text-xs text-slate-700 mb-1.5 leading-relaxed">
        {formatInlineText(line)}
      </p>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Chat Container */}
      <div className="attmark-card flex-1 flex flex-col min-h-0">
        {/* Header with Clear Button */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">Your GPT AI</span>
            {messages.length > 1 && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {messages.filter(m => m.sender === 'user').length} messages
              </span>
            )}
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
            title="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        </div>

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
                className={`max-w-4xl p-4 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user'
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
                    <div className="whitespace-pre-wrap">
                      {formatAIText(msg.text) || (msg.sender === 'ai' && isGenerating ? 'Thinking...' : '')}
                    </div>
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