'use client'
import React, { useState } from 'react';
import "./findbookstyl.css"
import Navbar from '../navbar/page';
import ReactMarkdown from "react-markdown"
import Image from 'next/image';

export default function Findbook() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const classifyMessage = async (userInput) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",       
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free", 
        messages: [
          {
            role: "system",
            content: "You're a classifier. Your job is to answer ONLY 'yes' or 'no'. If the user message is a request related to books, reading, learning topics, or self-help, say 'yes'. Otherwise, say 'no'."
          },
          {
            role: "user",
            content: userInput
          }
        ]
      })
    });
  
    const data = await response.json();
    const classification = data.choices[0]?.message?.content.trim().toLowerCase();
    return classification.includes("yes");
  };

  const getBookRecommendation = async (userInput) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content: "You are a smart book recommender. Based on the user's topic, suggest one or more books (real or imaginary) with title, author, and a short description."
          },
          {
            role: "user",
            content: userInput
          }
        ]
      })
    });
  
    const data = await response.json();
    return data.choices[0]?.message?.content || "No suggestions available.";
  };

  async function sendMess() {
    setIsLoading(true);
    setError('');
    setResponse('');
  
    try {
      const isBookRelated = await classifyMessage(input);
  
      if (!isBookRelated) {
        setResponse("Sorry, I can only help with book recommendations or related topics.");
        return;
      }
  
      const suggestion = await getBookRecommendation(input);
      setResponse(suggestion);
    } catch (error) {
      setError("Something went wrong: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }
  
return (
    <div className="chat-container">
      <header className="navbar-container">
        <Navbar />
      </header>
  
      <main className="main-content">
        <div className="search-header">
          <h2 className="h2search">Discover Your Next Read</h2>
          <p className="search-subtitle">Explore books by genre, author, or topic</p>
          
          <div className="input-group">
            <div className="input-wrapper">
              <input 
                className="inputbook"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Try 'WWII historical fiction' or 'AI technology books'..."
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && sendMess()}
                aria-label="Book search input"
              />
              {input && (
                <button 
                  className="clear-button"
                  onClick={() => setInput('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            
            <button 
              className="inputbutton"
              onClick={sendMess}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner-dot"></div>
                  <div className="spinner-dot"></div>
                  <div className="spinner-dot"></div>
                </div>
              ) : (
                <>
                  Search
                  <span className="button-icon">🔍</span>
                </>
              )}
            </button>
          </div>
  
          <div className="quick-suggestions">
            <span className='try'>Try:</span>
            <button onClick={() => setInput("Modern philosophy books")}>Modern philosophy</button>
            <button onClick={() => setInput("Climate change novels")}>Climate novels</button>
            <button onClick={() => setInput("AI ethics books")}>AI ethics</button>
          </div>
        </div>
  
        {error && (
          <div className="error-message" role="alert">
            ⚠️ {error}
          </div>
        )}
  
        {response ? (
          <div className="response-container animate-slideUp">
            <div className="response-header">
              <h3>Recommended Reads</h3>
            </div>
            
            <ReactMarkdown
              components={{
                ol: ({ node, ...props }) => (
                  <ol className="book-list">{props.children}</ol>
                ),
                li: ({ node, ...props }) => (
                  <li className="book-item">
                    <div className="book-marker">📖</div>
                    <div className="book-content">{props.children}</div>
                  </li>
                )
              }}
            >
              {response}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="empty-state">
            <Image src="/mainlogo.png" alt="Empty state" width={60} height={150} />
            <p>Your book recommendations will appear here</p>
          </div>
        )}
      </main>
  
      <footer className="app-footer">
        <p>Powered by Booksmith AI • Recommendations updated daily</p>
      </footer>
    </div>
  );
}