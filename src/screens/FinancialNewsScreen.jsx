import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { newsApiKey, geminiApiKey2 } from '../config/apiKeys.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileText, Calendar, Zap, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';

// Using geminiApiKey2 for Financial News
const genAI = new GoogleGenerativeAI(geminiApiKey2);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const FinancialNewsScreen = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSummaryId, setOpenSummaryId] = useState(null);

    const fetchAndAnalyzeNews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Fetch Top Headlines
            const newsUrl = `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=5&apiKey=${newsApiKey}`;
            const response = await axios.get(newsUrl);

            if (!response.data.articles || response.data.articles.length === 0) {
                throw new Error("No articles found.");
            }

            const rawArticles = response.data.articles;

            // 2. Batch Analyze with Gemini
            const titles = rawArticles.map((a, i) => `${i + 1}. ${a.title}`).join('\n');
            const prompt = `Analyze the following financial news headlines. For EACH headline, determine the sentiment (Positive, Negative, or Neutral) and provide a 1-sentence insight for investors.
            
            Headlines:
            ${titles}
            
            Return a JSON ARRAY of objects, where each object corresponds to a headline in order:
            [
                { "sentiment": "Positive", "summary": "Insight here..." },
                { "sentiment": "Negative", "summary": "Insight here..." }
            ]`;

            let analysisResults = [];
            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                analysisResults = JSON.parse(jsonString);
            } catch (aiError) {
                console.error("Gemini Batch Analysis Error:", aiError);
                // Fallback if AI fails
                analysisResults = rawArticles.map(() => ({ sentiment: "Neutral", summary: "AI Analysis unavailable." }));
            }

            // 3. Merge Data
            const mergedArticles = rawArticles.map((article, index) => {
                const analysis = analysisResults[index] || { sentiment: "Neutral", summary: "Analysis unavailable." };
                return { ...article, ...analysis };
            });

            setArticles(mergedArticles);

        } catch (err) {
            console.error("News Page Error:", err);
            setError("Failed to load news. Please check your internet connection or API keys.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAndAnalyzeNews();
    }, []);

    const toggleSummary = (index) => {
        setOpenSummaryId(openSummaryId === index ? null : index);
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'Positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200';
            case 'Negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200';
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-gray-800 dark:text-white text-lg font-semibold mb-2">{error}</p>
                <button onClick={fetchAndAnalyzeNews} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <div className="bg-blue-500 w-2 h-8 mr-3 rounded-full"></div>
                AI Financial News
            </h2>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Fetching and analyzing market news...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {articles.map((article, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSentimentColor(article.sentiment)}`}>
                                    {article.sentiment}
                                </span>
                                <div className="text-xs text-gray-400 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(article.publishedAt).toLocaleDateString()}
                                </div>
                            </div>

                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="block text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 leading-tight">
                                {article.title}
                            </a>

                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <FileText className="w-4 h-4 mr-1" />
                                {article.source.name}
                            </div>

                            <button
                                onClick={() => toggleSummary(index)}
                                className="w-full flex items-center justify-center py-2 px-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors group"
                            >
                                <Zap className={`w-4 h-4 mr-2 ${openSummaryId === index ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 group-hover:text-yellow-500'}`} />
                                {openSummaryId === index ? 'Hide AI Insight' : 'Show AI Insight'}
                                {openSummaryId === index ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                            </button>

                            {openSummaryId === index && (
                                <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Analyst Take</p>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                {article.summary}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FinancialNewsScreen;