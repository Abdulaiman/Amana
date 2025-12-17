import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Check, ChevronRight, ChevronLeft, CreditCard, ShieldCheck, UploadCloud, FileText } from 'lucide-react';
import './PsychometricTest.css';

const PsychometricTest = () => {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [nin, setNin] = useState('');
  const [bankStatement, setBankStatement] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Futuristic Questions Data
  const questions = [
    { id: 1, text: "How often do you check your finances?", options: ["Daily", "Weekly", "Rarely", "Never"], emoji: "📱" },
    { id: 2, text: "Savings Habit", options: ["I save first", "I save what's left", "I don't save"], emoji: "💰" },
    { id: 3, text: "Loan History", options: ["Never Missed", "Missed Once", "Multiple Misses"], emoji: "📅" },
    { id: 4, text: "Budgeting Style", options: ["Strict Plan", "Mental Note", "No Plan"], emoji: "📝" },
    { id: 5, text: "Income Stability", options: ["Steady", "Variable", "Unpredictable"], emoji: "💼" },
  ];

  const totalSteps = questions.length + 2;
  const progress = (step / totalSteps) * 100;

  const handleOptionSelect = (qId, optionIndex) => {
    setAnswers({ ...answers, [qId]: optionIndex });
    setTimeout(() => setStep(prev => prev + 1), 400); 
  };

  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) setBankStatement(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock Logic
    let score = 50; 
    Object.values(answers).forEach(val => score += (val * 5));

    try {
      await api.post('/retailer/onboarding', {
        testScore: score,
        hasBankStatement: !!bankStatement,
        nin
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Submission failed');
      setLoading(false);
    }
  };

  return (
    <div className="quiz-root">
        {/* Animated Background */}
        <div className="quiz-bg-layer">
             <div className="quiz-bg-solid"></div>
             <div className="quiz-blob purple-blob"></div>
             <div className="quiz-blob teal-blob"></div>
        </div>

        {/* Header / Progress */}
        <div className="quiz-header">
            <div className="header-content">
                {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="back-btn">
                        <ChevronLeft size={24} />
                    </button>
                )}
                {step > 0 && (
                    <div className="progress-track">
                        <div 
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}
            </div>
        </div>

        {/* Content Area */}
        <div className="quiz-content">
            
            {/* STEP 0: INTRO */}
            {step === 0 && (
                <div className="step-intro animate-fade-in-up">
                    <div className="intro-icon-box">
                        <ShieldCheck size={48} className="intro-icon" />
                    </div>
                    <h1 className="intro-title">
                        Trust Check
                    </h1>
                    <p className="intro-text">
                        Unlock up to <span className="highlight">₦30,000</span> in classic credit. <br/>
                        No paperwork. Just a few questions.
                    </p>
                    <button onClick={() => setStep(1)} className="start-btn group">
                        <span className="btn-content">Start Assessment <ChevronRight size={20}/></span>
                        <div className="btn-glow"></div>
                    </button>
                </div>
            )}

            {/* STEPS 1-N: QUESTIONS */}
            {step > 0 && step <= questions.length && (
                <div className="step-question animate-slide-in-right">
                    <div className={`question-emoji-box gradient-${questions[step-1].id}`}>
                        {questions[step-1].emoji}
                    </div>
                    <h2 className="question-text">{questions[step-1].text}</h2>
                    
                    <div className="options-grid">
                        {questions[step-1].options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(questions[step-1].id, idx)}
                                className={`option-card group ${
                                    answers[questions[step-1].id] === idx ? 'selected' : ''
                                }`}
                            >
                                <span className="option-label">{opt}</span>
                                {answers[questions[step-1].id] === idx && <Check size={20} className="check-icon" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* FINAL STEP: VERIFICATION */}
            {step === questions.length + 1 && (
                <div className="step-final glass-card animate-fade-in-up">
                    <h2 className="final-title">Final Step</h2>
                    <p className="final-subtitle">Secure your account & boost your limit.</p>

                    <div className="final-form">
                        {/* NIN Input */}
                        <div className="form-group">
                            <label className="form-label">NIN Verification</label>
                            <div className="input-wrapper">
                                <input 
                                    type="text" 
                                    className="custom-input nin-input"
                                    placeholder="000 000 000 00"
                                    value={nin}
                                    onChange={(e) => setNin(e.target.value)}
                                />
                                <div className="input-icon-right">
                                    {nin.length > 5 && <Check size={20} />}
                                </div>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="form-group">
                             <label className="form-label">Bank Statement <span className="highlight-teal">(Optional)</span></label>
                             <div className="upload-zone group">
                                <input type="file" className="file-input-hidden" onChange={handleFileUpload} />
                                {bankStatement ? (
                                    <div className="file-success">
                                        <FileText size={40} />
                                        <span className="file-name">{bankStatement.name}</span>
                                        <span className="file-hint">Tap to change</span>
                                    </div>
                                ) : (
                                    <div className="file-placeholder">
                                        <UploadCloud size={40} />
                                        <p className="file-msg">Tap to upload PDF/Image</p>
                                        <p className="file-sub">Boosts limit to ₦20,000</p>
                                    </div>
                                )}
                             </div>
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            disabled={!nin || loading}
                            className="submit-btn"
                        >
                            {loading ? 'Verifying...' : 'Complete Profile'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default PsychometricTest;
