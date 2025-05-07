'use client'

import "./creat.css"
import React, { useState } from 'react';
import Navbar  from "../navbar/page"
import ReactMarkdown from "react-markdown"

export default function Creatbook ()
{
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
    const [title, setTitle] = useState('')
    const [genre, setGenre] = useState('')

    const [theme, setTheme] = useState('')
    const [protagonist, setProtagonist] = useState('')
    const [antagonist, setAntagonist] = useState('')
    const [audience, setAudience] = useState('')
    const [timePeriod, setTimePeriod] = useState('')
    const [locations, setLocations] = useState('')
    const [plot, setPlot] = useState('')
    const [response,setResponse] = useState('')
    const [isComplete, setIsComplete] = useState(false);
    const [continuationToken, setContinuationToken] = useState(null);
    const [userContinuation, setUserContinuation] = useState('');

    const classifyMessage = async (bookData) => {
      // Check for empty inputs first
      const isEmpty = !bookData.genre && !bookData.plot && !bookData.audience;
      if (isEmpty) return false;
    
      const combinedInput = `Genre: ${bookData.genre}, Plot: ${bookData.plot}, Audience: ${bookData.audience}`;
    
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json",
          "X-Title": "AI Book Generator"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "system",
              content: `You're a book creation classifier. Strictly answer 'yes' or 'no'.
              
              Rules:
              1. Say 'yes' ONLY if ALL are true:
                 - Contains book genre
                 - Has plot details (more than 5 words)
                 - Specifies target audience
                 - Clearly relates to book creation
                 
              2. Say 'no' if:
                 - Any field is empty
                 - Generic writing advice requests
                 - Unrelated topics (e.g., cooking, tech support)
                 - Vague ideas without structure
                 
              Examples:
              Good: "Genre: Fantasy, Plot: A hobbit's journey to destroy a magic ring, Audience: Adults"
              Bad: "Genre: , Plot: good vs evil, Audience: everyone"
              Bad: "How to write dialogue?"`
            },
            {
              role: "user",
              content: combinedInput
            }
          ]
        })
      });
    
      const data = await response.json();
      const answer = data.choices[0]?.message?.content.trim().toLowerCase();
      
      // Fallback check for empty responses
      return answer === 'yes' && 
             bookData.genre.length > 2 && 
             bookData.plot.length > 10 && 
             bookData.audience.length > 3;
    };


    const generateBookContent = async (bookData, previousContent = '') => {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json",
            "X-Title": "AI Book Generator"
            
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1:free",
            temperature: 0.7,
            max_tokens: 4000,
            messages: [
              {
                role: "system",
                content: `You are a professional novel architect. Generate COMPLETE BOOK CONTENT using this strict workflow:
                  
                  # PHASE 1: BOOK BLUEPRINT
                  ## Metadata
                  - Title: ${bookData.title}
                  - Genre: ${bookData.genre}
                  - Audience: ${bookData.audience}
                  - Chapters: 8 -12 or more
                  - Core Theme: ${bookData.theme}
                  
                  ## Structural Requirements
                  1. ACT STRUCTURE:
                     Setup (Ch1-5): ${bookData.plot.split('→')[0]}
                     Confrontation (Ch6-18): ${bookData.plot.split('→')[1]} 
                     Resolution (Ch19+): ${bookData.plot.split('→')[2]}
                  
                  2. CHAPTER RULES:
                     - 6000-8000 words per chapter or more 
                     - 5-7 scenes per chapter
                     - End with cliffhanger/plot hook
                     - Include character development beats
                  
                  # PHASE 2: CHAPTER GENERATION
                  ## Output Format
                  --- 
                  # ${bookData.title}
                  
                  ## Chapter 1: [Title]
                  [Full narrative content with:
                   - Opening hook
                   - Character introductions
                   - 3+ dialogue exchanges
                   - Sensory descriptions
                   - Foreshadowing elements]
                  
                  ## Chapter 2: [Title]
                  [Continuation with:
                   - Subplot introduction
                   - Character interactions
                   - Rising tension
                   - Scene transitions]
                  
                  ... [CONTINUE FOR ALL CHAPTERS WITHOUT ASKING] ...
                  
                  ## Final Chapter: [Title] 
                  [Resolution containing:
                   - Plot thread payoffs
                   - Character arc completions
                   - Thematic closure
                   - Optional epilogue tease]
                  ---
                  REQUIREMENTS:
                1. GENERATE CONTINUOUS CONTENT
                2. USE [CONTINUE] PLACEHOLDER IF INCOMPLETE
                3. MAINTAIN ${bookData.genre} FORMAT
                4. PRESERVE EXISTING STRUCTURE
                5. ${previousContent ? 'CONTINUE FROM: ' + previousContent.slice(-500) : ''}`
              },
              {
                role: "user",
                content: `Create ${bookData.genre} content:
                Title: ${bookData.title}
                Theme: ${bookData.theme}
                Plot: ${bookData.plot}
                Characters: ${bookData.protagonist} vs ${bookData.antagonist}`
              }
            ]
          })
        });
  
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
  
        const data = await response.json();
        const newContent = data.choices[0]?.message?.content;
  
        if (newContent.includes('[CONTINUE]')) {
          return {
            content: newContent.replace('[CONTINUE]', ''),
            isComplete: false
          };
        }
  
        return {
          content: newContent,
          isComplete: true
        };
      } catch (error) {
        throw error;
      }
    };
  
  


    async function handleGenerate(isContinuation = false) {
        
      try {
        setIsLoading(true);
        setError('');
      if (!isContinuation) {
        setResponse('');
        setIsComplete(false);
      }

        const bookData = {
          title,
          genre,
          audience,
          theme,
          protagonist,
          antagonist,
          timePeriod,
          locations,
          plot
        };
  
        if (!isContinuation && !(await classifyMessage(bookData))) {
          setResponse("Please provide complete book details.");
          return;
        }
  
        const generated = await generateBookContent(
          bookData,
          isContinuation ? response + '\n' + userContinuation : ''
        );
  
        setResponse(prev => prev + generated.content);
        setIsComplete(generated.isComplete);
        setUserContinuation('');
  
        if (!generated.isComplete) {
          setError('');
        }
      } catch (error) {
        setError("Error: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }

    
return (
  <div className="container">
    <Navbar />
    
    <section className="hero">
      <header className="hero-header">
        <h1>📖 Craft Books with AI Magic</h1>
        <p className="hero-subtitle">Transform your ideas into polished novels - Start your journey below</p>
      </header>

      <div className="form-card">
        <h2 className="section-title">
          <span className="icon">🖋️</span> Book Foundations
        </h2>
        
        <div className="grid-2col">
          <div className="input-group">
            <label className="input-label">Working Title</label>
            <input
              placeholder="e.g., 'The Crystal of Eternal Dawn'"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Genre</label>
            <select
              className="input-field"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">Select Genre</option>
              <option value="fantasy">Fantasy</option>
              <option value="historical">Historical</option>
              <option value="sci-fi">Science Fiction</option>
            </select>
          </div>
          <div className="form-section">
        <h2 className="input-label">Target Audience</h2>
        <select 
          className="input-field"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          aria-label="Select target audience"
        >
          <option value="">Choose Target Audience</option>
          <option value="children">Children </option>
          <option value="YA">Young Adult </option>
          <option value="adult">Adult </option>
          <option value="all-ages">All Ages</option>
        </select>
      </div>
        </div>
      </div>

      {/* World Building Section */}
      <div className="form-card world-building">
        <h2 className="section-title">
          <span className="icon">🌍</span> World Construction
        </h2>
        
        <div className="grid-2col">
          <div className="input-group">
            <label className="input-label">Time Period</label>
            <select
              className="input-field"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option value="">Choose Era</option>
              <option value="futuristic">futuristic</option>
              <option value="medieval">Medieval</option>
              <option value="renaissance">Renaissance</option>
              <option value="ancient">Ancient</option>
            </select>
          </div>



          <div className="input-group">
            <label className="input-label">Key Locations</label>
            <textarea
              placeholder="Example: 
- Floating city plagued by storms 
- Underground crystal caves 
- Deserted mage towers"
              className="input-field locations-input"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              rows="3"
            />
          </div>

          
        </div>

      {/* Protagonist Input */}
      <div className="form-section">
        <h2>Main Character (Optional if it is nor a story)</h2>
        <textarea
          placeholder="Describe your protagonist:
          Example: 'Alex Mercer, a 25-year-old rogue AI programmer with trust issues and photographic memory'"
          className="input-field large"
          value={protagonist}
          onChange={(e) => setProtagonist(e.target.value)}
          aria-label="Protagonist details"
          rows="3"
        />
      </div>

      {/* Antagonist Input */}
      <div className="sectformion">
        <h2 className="section-title">Antagonist/Villain (Optional)</h2>
        <input
          placeholder="Example: 'The Consortium - shadow organization manipulating global tech markets'"
          className="input-field"
          value={antagonist}
          onChange={(e) => setAntagonist(e.target.value)}
          aria-label="Antagonist details"
        />
      </div>

      </div>


      <div className="form-card plot-card">
      <div className="form-section">
  <h2 className="section-title">Core Theme</h2>
  <textarea
    placeholder="Main Theme (1-2 sentences) 
    Example: 'The struggle between technology and humanity in a cyberpunk world'"
    className="input-field large"
    value={theme}
    onChange={(e) => setTheme(e.target.value)}
    aria-label="Main theme"
  />
</div>
        <h2 className="section-title">
          <span className="icon">📜</span> Story Arc
        </h2>
        
        <div className="input-group">
          <label className="input-label">Plot Milestones</label>
          <textarea
            placeholder="Example timeline:
1. Discovers ancient crystal → 
2. Reveals royal heritage → 
3. Trains with rebel mages → 
4. Final battle at Eclipse Festival"
            className="input-field plot-input"
            value={plot}
            onChange={(e) => setPlot(e.target.value)}
            rows="4"
          />
        </div>
      </div>

      {/* Generation Section */}
      <div className="action-section">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {isLoading ? (
          <div className="generation-status">
            <div className="spinner"></div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p className="loading-text">
              Weaving your epic book ... (20%)
            </p>
          </div>
        ) : (
          <button className="generate-button" onClick={handleGenerate}>
            <span className="button-icon">✨</span>
            Forge My Masterpiece
          </button>
        )}
      </div>
    </section>

    {response && (
      <div className="preview-section">
        <h3 className="preview-title">Your Generated Epic</h3>
        <div className="markdown-preview">
  <ReactMarkdown>
    {response}
  </ReactMarkdown>
</div>
      </div>
    )}

{!isComplete && response && (
  <div className="continuation-prompt">
    <h4>Continue the Story</h4>
    <textarea
      placeholder="Add your own continuation or describe what happens next..."
      value={userContinuation}
      onChange={(e) => setUserContinuation(e.target.value)}
      rows={4}
    />
    
    {isLoading ? (
      <div className="generation-status ">
        <div className="spinner"></div>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        <p className="loading-text">
          Weaving your continuation... (20%)
        </p>
      </div>
    ) : (
      <button 
        className="continue-btn"
        onClick={() => handleGenerate(true)}
      >
        Merge and Continue
      </button>
    )}
  </div>
)}
  </div>
)
}