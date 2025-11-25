import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { newsApiKey, geminiApiKey } from '/src/config/apiKeys.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileText, Calendar, Zap } from 'lucide-react';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- Helper function to analyze a single article with Gemini ---
const analyzeArticleWithGemini = async (article) => {
    const prompt = `Analyze the sentiment of this financial news headline for an investor. Also, provide a one-sentence summary of its potential financial impact. 
    Headline: "${article.title}"
    
    Return your response as a JSON object with two keys: "sentiment" (can be "Positive", "Neutral", or "Negative") and "summary".`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean the text and parse the JSON
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(jsonString);

        return { ...article, ...analysis }; // Combine original article with AI analysis
    } catch (error) {
        console.error("Error analyzing with Gemini:", error);
        return { ...article, sentiment: "Neutral", summary: "AI analysis could not be performed for this article." };
    }
};

// --- FinancialNewsScreen Component ---
const FinancialNewsScreen = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndAnalyzeNews = async () => {
            setIsLoading(true);
            try {
                // Step 1: Fetch news from the News API
                const newsUrl = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${newsApiKey}`;
                const newsResponse = await axios.get(newsUrl);
                const fetchedArticles = newsResponse.data.articles.slice(0, 10); // Get top 10 articles

                // Step 2: Analyze each article with Gemini
                const analyzedArticlesPromises = fetchedArticles.map(analyzeArticleWithGemini);
                const settledArticles = await Promise.all(analyzedArticlesPromises);
                
                setArticles(settledArticles);
            } catch (error) {
                console.error("Error fetching or analyzing news:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndAnalyzeNews();
    }, []);

    // Helper to get styling for sentiment tags
    const getSentimentStyle = (sentiment) => {
        switch (sentiment) {
            case 'Positive':
                return { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', emoji: '🤩' };
            case 'Negative':
                return { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', emoji: '😭' };
            default:
                return { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', emoji: '😐' };
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">AI-Powered Financial News</h2>
            {isLoading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Fetching and analyzing news...</p>
            ) : (
                <div className="space-y-6">
                    {articles.map((article, index) => {
                        const { bg, text, emoji } = getSentimentStyle(article.sentiment);
                        return (
                            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${bg} ${text}`}>
                                        {emoji} <span className="ml-2">{article.sentiment || 'Neutral'}</span>
                                    </span>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(article.publishedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {article.title}
                                </a>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />{article.source.name}
                                </p>
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="font-bold text-gray-800 dark:text-white flex items-center"><Zap className="w-4 h-4 mr-2 text-yellow-500"/>AI Summary</p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{article.summary || 'Summary not available.'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FinancialNewsScreen;


