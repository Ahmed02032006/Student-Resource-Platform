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
  Sparkles,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import { sendMessageToAI } from '../api/ai';
import toast from 'react-hot-toast';

const CHAT_STORAGE_KEY = 'your_gpt_chat_history';

export default function YourGPTPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

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

  // Check if user is allowed to interact
  const canInteract = isAuthenticated && user?.role !== 'admin';

  const handleSendMessage = async (textToSend) => {
    if (!canInteract) return;

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
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: `Hello ${user?.name || 'Student'}! 👋 I am Your GPT, your personal AI academic assistant. Ask me anything about your enrolled courses, lecture notes, code examples, or exam preparations!`,
        time: 'Just now',
      },
    ]);
    setShowClearModal(false);
    toast.success('Chat cleared successfully');
  };

  const handleDeleteMessage = (messageId) => {
    const messageToDelete = messages.find(m => m.id === messageId);
    setMessageToDelete(messageToDelete);
  };

  const confirmDeleteMessage = () => {
    if (messageToDelete) {
      const filteredMessages = messages.filter(m => m.id !== messageToDelete.id);
      
      if (filteredMessages.length === 0) {
        setMessages([
          {
            id: '1',
            sender: 'ai',
            text: `Hello ${user?.name || 'Student'}! 👋 I am Your GPT, your personal AI academic assistant. Ask me anything about your enrolled courses, lecture notes, code examples, or exam preparations!`,
            time: 'Just now',
          },
        ]);
      } else {
        setMessages(filteredMessages);
      }
      
      setMessageToDelete(null);
      toast.success('Message deleted');
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

  // ==================== FORMATTING FUNCTIONS ====================

  const renderTable = (rows) => {
    if (rows.length === 0) return null;

    const parsedRows = rows.map(row => {
      return row.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
    });

    const isSeparatorRow = (cells) => {
      return cells.every(cell => /^[-:]+$/.test(cell));
    };

    let headerRow = null;
    let dataRows = [];

    for (const row of parsedRows) {
      if (isSeparatorRow(row)) continue;
      if (!headerRow) {
        headerRow = row;
      } else {
        dataRows.push(row);
      }
    }

    if (!headerRow) return null;

    return (
      <div key={`table-${Date.now()}-${Math.random()}`} className="overflow-x-auto my-2">
        <table className="w-full divide-y divide-slate-200 border border-slate-200 rounded-lg text-xs">
          <thead className="bg-slate-50">
            <tr>
              {headerRow.map((cell, idx) => (
                <th key={`th-${idx}`} className="px-3 py-2 text-left text-xs font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  {formatInlineText(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataRows.map((row, rowIdx) => (
              <tr key={`tr-${rowIdx}`} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                {row.map((cell, cellIdx) => (
                  <td key={`td-${rowIdx}-${cellIdx}`} className="px-3 py-2 text-xs text-slate-600 border-r border-slate-200 last:border-r-0">
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

    // Process bold text
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
      // Process italic text
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
        // Process inline code
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
    // Headers
    if (line.startsWith('### ')) {
      return <h3 key={`h3-${index}`} className="text-sm font-bold text-slate-800 mt-3 mb-1.5">{line.replace('### ', '')}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={`h2-${index}`} className="text-base font-bold text-slate-900 mt-3 mb-2">{line.replace('## ', '')}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={`h1-${index}`} className="text-lg font-bold text-slate-900 mt-3 mb-2">{line.replace('# ', '')}</h1>;
    }

    // Checkboxes
    if (line.includes('[ ]') || line.includes('[x]')) {
      const isChecked = line.includes('[x]');
      const content = line.replace(/\[[ x]\]\s*/, '');
      return (
        <div key={`check-${index}`} className="flex items-start gap-2 my-0.5">
          <span className="text-sm mt-0.5">{isChecked ? '☑' : '☐'}</span>
          <span className="text-xs text-slate-700">{formatInlineText(content)}</span>
        </div>
      );
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      return (
        <blockquote key={`quote-${index}`} className="border-l-4 border-blue-400 pl-3 my-2 py-1 bg-blue-50 rounded-r-lg">
          <p className="text-xs text-slate-700">{formatInlineText(line.substring(2))}</p>
        </blockquote>
      );
    }

    // Horizontal rules
    if (/^[-*_]{3,}$/.test(line.trim())) {
      return <hr key={`hr-${index}`} className="my-3 border-t border-slate-200" />;
    }

    // Regular paragraph
    return (
      <p key={`p-${index}`} className="text-xs text-slate-700 mb-1.5 leading-relaxed">
        {formatInlineText(line)}
      </p>
    );
  };

  // Main formatting function with proper list handling
  const formatAIText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const formattedLines = [];
    let inTable = false;
    let tableRows = [];
    let inCodeBlock = false;
    let codeContent = [];
    let codeLanguage = '';
    let inList = false;
    let listItems = [];
    let listType = 'ul';
    let listIndent = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        formattedLines.push(
          <div key={`list-${Date.now()}-${Math.random()}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-${(listIndent + 1) * 4} my-1 space-y-0.5`}>
            {listItems.map((item, idx) => (
              <div key={`list-item-${idx}`} className="text-xs text-slate-700 leading-relaxed flex items-start gap-1.5">
                <span className="text-slate-400 min-w-[20px]">{listType === 'ol' ? `${idx + 1}.` : '•'}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        );
        listItems = [];
        inList = false;
      }
    };

    const isListItem = (line) => {
      return /^(\s*)(\d+\.\s|[-*]\s|•\s)/.test(line);
    };

    const getListItemContent = (line) => {
      const match = line.match(/^(\s*)(\d+\.\s|[-*]\s|•\s)/);
      if (!match) return null;
      const indent = match[1].length;
      const content = line.replace(/^(\s*)(\d+\.\s|[-*]\s|•\s)/, '');
      const type = /^\d+\.\s/.test(match[2]) ? 'ol' : 'ul';
      return { indent, content: content.trim(), type };
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Code block handling
      if (line.trim().startsWith('```') && !inCodeBlock) {
        flushList();
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

      // Table handling
      if (line.includes('|') && !inTable) {
        flushList();
        inTable = true;
        tableRows = [line];
        continue;
      }

      if (inTable) {
        if (line.includes('|')) {
          tableRows.push(line);
        } else {
          inTable = false;
          const tableHtml = renderTable(tableRows);
          if (tableHtml) {
            formattedLines.push(tableHtml);
          }
          tableRows = [];
          if (line.trim()) {
            if (isListItem(line)) {
              const info = getListItemContent(line);
              if (info) {
                if (!inList) {
                  inList = true;
                  listType = info.type;
                  listIndent = Math.floor(info.indent / 2);
                }
                listItems.push(formatInlineText(info.content));
                continue;
              }
            } else {
              flushList();
              formattedLines.push(renderTextLine(line, i));
            }
          }
          continue;
        }
        continue;
      }

      // List handling
      if (isListItem(line)) {
        const info = getListItemContent(line);
        if (info) {
          const indent = Math.floor(info.indent / 2);
          
          // If we're already in a list and the indent is the same, add to it
          if (inList && indent === listIndent) {
            listItems.push(formatInlineText(info.content));
            continue;
          }
          
          // If this is a sub-list (deeper indent), flush current and start new
          if (inList && indent > listIndent) {
            flushList();
            inList = true;
            listType = info.type;
            listIndent = indent;
            listItems.push(formatInlineText(info.content));
            continue;
          }
          
          // New list
          flushList();
          inList = true;
          listType = info.type;
          listIndent = indent;
          listItems.push(formatInlineText(info.content));
          continue;
        }
      }

      // If line is not a list item, flush any pending list
      if (inList && line.trim() !== '') {
        flushList();
        formattedLines.push(renderTextLine(line, i));
        continue;
      }

      // Empty line - flush list if needed
      if (line.trim() === '') {
        flushList();
        formattedLines.push(<div key={`empty-${i}`} className="h-1.5" />);
        continue;
      }

      // Regular line
      if (line.trim()) {
        flushList();
        formattedLines.push(renderTextLine(line, i));
      }
    }

    // Flush any remaining list
    if (inList) {
      flushList();
    }

    if (inTable && tableRows.length > 0) {
      const tableHtml = renderTable(tableRows);
      if (tableHtml) {
        formattedLines.push(tableHtml);
      }
    }

    return formattedLines;
  };

  // ==================== RENDER ====================

  return (
    <div className="h-full flex flex-col">
      <div className="attmark-card flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">Your GPT AI</span>
            {messages.filter(m => m.sender === 'user').length > 0 && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {messages.filter(m => m.sender === 'user').length} messages
              </span>
            )}
          </div>
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`group relative flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-blue-600'}`}
              >
                {msg.sender === 'user' ? (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              <div
                className={`relative max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
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

                {msg.id !== '1' && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-md border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
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
        {messages.filter(m => m.sender === 'user').length === 0 && (
          <div className="px-6 pb-3">
            <div className="flex justify-between items-center mb-2">
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
        <form onSubmit={handleSubmit} className="p-4 pt-3 border-t border-slate-100 flex items-center space-x-3">
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

      {/* Clear Chat Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Clear Chat History?</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-600">
                You have <span className="font-semibold text-slate-900">{messages.filter(m => m.sender === 'user').length}</span> messages 
                and <span className="font-semibold text-slate-900">{messages.filter(m => m.sender === 'ai').length}</span> AI responses in this chat.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Message?</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 mb-4 max-h-20 overflow-y-auto">
              <p className="text-xs text-slate-600 line-clamp-3">
                "{messageToDelete.text?.substring(0, 150)}
                {messageToDelete.text?.length > 150 ? '...' : ''}"
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMessageToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMessage}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}