import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { twelveDataApiKey } from '../config/apiKeys.js';
import { TrendingUp, TrendingDown, Minus, ArrowRight, BrainCircuit } from 'lucide-react';

// --- UPDATED: A larger list of popular stock symbols to choose from ---
const POPULAR_SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM', 'V', 'JNJ', 'WMT', 'PG', 'MA'
];

// --- Helper function to fetch stock data from Twelve Data ---
const fetchStockData = async (symbol) => {
    const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${twelveDataApiKey}`;
    try {
        const response = await axios.get(url);
        const data = response.data;
        if (data.code === 404 || !data.close) {
             console.warn(`No data for ${symbol} from Twelve Data.`);
             return { symbol, price: 'N/A', change: 'N/A', changePercent: 'N/A' };
        }
        return {
            symbol: data.symbol,
            price: parseFloat(data.close).toFixed(2),
            change: parseFloat(data.change).toFixed(2),
            changePercent: parseFloat(data.percent_change).toFixed(2),
        };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return { symbol, price: 'Error', change: 'Error', changePercent: 'Error' };
    }
};

// --- DashboardScreen Component ---
const DashboardScreen = ({ holdings }) => {
    const [marketData, setMarketData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            
            // --- UPDATED: Logic to select 3 random, unique symbols ---
            const shuffled = [...POPULAR_SYMBOLS].sort(() => 0.5 - Math.random());
            const selectedSymbols = shuffled.slice(0, 3);
            
            const dataPromises = selectedSymbols.map(fetchStockData);
            const allData = await Promise.all(dataPromises);
            setMarketData(allData);
            setIsLoading(false);
        };
        fetchAllData();
    }, []);

    const portfolioValue = holdings.reduce((total, holding) => {
        return total + (holding.shares * holding.purchasePrice);
    }, 0).toFixed(2);

    const PortfolioSummaryCard = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Portfolio Summary</h3>
            <div className="flex justify-between items-baseline">
                <div>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">${portfolioValue}</p>
                    <p className="text-gray-500 dark:text-gray-400">Total Value (at purchase)</p>
                </div>
                <div className="text-right">
                    {/* This is placeholder data for now */}
                    <p className="text-lg font-semibold text-green-500">+0.00% ($0.00)</p>
                    <p className="text-gray-500 dark:text-gray-400">Today's Change</p>
                </div>
            </div>
        </div>
    );

    const MarketSnapshotCard = () => {
        const getChangeStyle = (change) => {
            if (change > 0) return { color: 'text-green-500', icon: <TrendingUp className="w-4 h-4 mr-1" /> };
            if (change < 0) return { color: 'text-red-500', icon: <TrendingDown className="w-4 h-4 mr-1" /> };
            return { color: 'text-gray-500 dark:text-gray-400', icon: <Minus className="w-4 h-4 mr-1" /> };
        };

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Market Snapshot</h3>
                {isLoading ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">Loading Market Data...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {marketData.map((stock) => {
                            const { color, icon } = getChangeStyle(stock.changePercent);
                            return (
                                <div key={stock.symbol} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="font-bold text-lg text-gray-800 dark:text-white">{stock.symbol}</p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">${stock.price}</p>
                                    <p className={`flex items-center text-sm font-medium ${color}`}>
                                        {icon} {stock.changePercent}%
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };
    
    const ActionsCard = () => (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-full border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Actions</h3>
                <button className="w-full text-left bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-between mb-3">
                    Add Transaction <ArrowRight className="w-5 h-5" />
                </button>
                <button className="w-full text-left bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-between">
                    Ask AI a Question <BrainCircuit className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="font-bold text-gray-800 dark:text-white">Top AI Recommendation</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Your bond exposure is low. Consider increasing by 5% to diversify.</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
            <div className="md:col-span-2 flex flex-col gap-8">
                <PortfolioSummaryCard />
                <MarketSnapshotCard />
            </div>
            <div className="md:col-span-1">
                <ActionsCard />
            </div>
        </div>
    );
};

export default DashboardScreen;

