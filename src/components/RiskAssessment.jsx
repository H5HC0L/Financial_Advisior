import React, { useState } from 'react';

const RiskAssessment = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [riskProfile, setRiskProfile] = useState(null);

    const questions = [
        {
            id: 1,
            text: "What is your main financial goal?",
            options: [
                { label: "Preserve my capital (Safety)", score: 1 },
                { label: "Grow steadily over time (Balanced)", score: 2 },
                { label: "Maximize growth aggressively (Growth)", score: 3 }
            ]
        },
        {
            id: 2,
            text: "When do you need to access your money?",
            options: [
                { label: "Less than 3 years", score: 1 },
                { label: "3 to 10 years", score: 2 },
                { label: "10+ years", score: 3 }
            ]
        },
        {
            id: 3,
            text: "How would you react if your portfolio lost 20% in a month?",
            options: [
                { label: "Sell everything immediately", score: 1 },
                { label: "Hold and wait for recovery", score: 2 },
                { label: "Buy more at lower prices", score: 3 }
            ]
        }
    ];

    const handleAnswer = (score) => {
        const newAnswers = { ...answers, [currentQuestion]: score };
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            calculateResult(newAnswers);
        }
    };

    const calculateResult = (finalAnswers) => {
        const totalScore = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
        let profile = { type: "", description: "", portfolio: "" };

        if (totalScore <= 4) {
            profile = {
                type: "Low Risk (Conservative)",
                description: "You prefer safety and stability over high returns.",
                portfolio: "80% Bonds / 20% Stocks"
            };
        } else if (totalScore <= 7) {
            profile = {
                type: "Medium Risk (Balanced)",
                description: "You want a balance between growth and safety.",
                portfolio: "50% Bonds / 50% Stocks"
            };
        } else {
            profile = {
                type: "High Risk (Aggressive)",
                description: "You are willing to accept volatility for maximum growth.",
                portfolio: "10% Bonds / 90% Stocks"
            };
        }

        setRiskProfile(profile);
        setShowResult(true);
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setAnswers({});
        setShowResult(false);
        setRiskProfile(null);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                        Financial Health Check
                    </h2>

                    {!showResult ? (
                        <div className="mt-4">
                            <div className="mb-4">
                                <div className="h-2 w-full bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-right text-xs text-gray-500 mt-1">
                                    Question {currentQuestion + 1} of {questions.length}
                                </p>
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 mb-6">
                                {questions[currentQuestion].text}
                            </h3>

                            <div className="space-y-3">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(option.score)}
                                        className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 text-gray-700 font-medium"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 text-center animate-fade-in">
                            <div className="inline-block p-3 rounded-full bg-green-100 text-green-600 mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {riskProfile.type}
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                {riskProfile.description}
                            </p>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">Recommended Portfolio</p>
                                <p className="text-lg font-bold text-blue-700">
                                    {riskProfile.portfolio}
                                </p>
                            </div>

                            <button
                                onClick={resetQuiz}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors duration-200 shadow-sm"
                            >
                                Retake Quiz
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskAssessment;
