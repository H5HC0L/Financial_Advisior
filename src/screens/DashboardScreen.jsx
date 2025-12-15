import React, { useState, useEffect } from 'react';
import { fetchStockPrice } from '../utils/stockService';
import { TrendingUp, TrendingDown, Minus, ArrowRight, BrainCircuit } from 'lucide-react';

const POPULAR_SYMBOLS = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM', 'V', 'JNJ'
];

// --- DashboardScreen Component ---
const DashboardScreen = ({ holdings, setActiveScreen }) => {
    const [marketData, setMarketData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMarketData = async () => {
            setIsLoading(true);

            // Get 3 random symbols
            const shuffled = [...POPULAR_SYMBOLS].sort(() => 0.5 - Math.random());
            const selectedSymbols = shuffled.slice(0, 3);

            // Use our mock service for consistent data
            const dataPromises = selectedSymbols.map(async (symbol) => {
                try {
                    const price = await fetchStockPrice(symbol);
                    // Simulate a random daily change for the snapshot
                    const changePercent = ((Math.random() - 0.5) * 5).toFixed(2);
                    return {
                        symbol,
                        price: price.toFixed(2),
                        changePercent
                    };
                } catch (e) {
                    return { symbol, price: '---', changePercent: '0.00' };
                }
            });

            const allData = await Promise.all(dataPromises);
            setMarketData(allData);
            setIsLoading(false);
        };
        fetchMarketData();
    }, []);

    // Calculate Portfolio Values
    const totalPurchaseValue = holdings.reduce((total, h) => total + (h.shares * h.purchasePrice), 0);
    const totalCurrentValue = holdings.reduce((total, h) => {
        const price = h.currentPrice || h.purchasePrice; // Fallback if current price not yet loaded
        return total + (h.shares * price);
    }, 0);

    const totalChange = totalCurrentValue - totalPurchaseValue;
    const totalChangePercent = totalPurchaseValue > 0 ? ((totalChange / totalPurchaseValue) * 100).toFixed(2) : "0.00";
    const changeColor = totalChange >= 0 ? 'text-green-500' : 'text-red-500';
    const changeSign = totalChange >= 0 ? '+' : '';

    const PortfolioSummaryCard = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Portfolio Summary</h3>
            <div className="flex justify-between items-baseline">
                <div>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">${totalCurrentValue.toFixed(2)}</p>
                    <p className="text-gray-500 dark:text-gray-400">Total Value</p>
                </div>
                <div className="text-right">
                    <p className={`text-lg font-semibold ${changeColor}`}>
                        {changeSign}{totalChangePercent}% ({changeSign}${totalChange.toFixed(2)})
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Total Gain/Loss</p>
                </div>
            </div>
        </div>
    );

    const MarketSnapshotCard = () => {
        const getChangeStyle = (change) => {
            const val = parseFloat(change);
            if (val > 0) return { color: 'text-green-500', icon: <TrendingUp className="w-4 h-4 mr-1" /> };
            if (val < 0) return { color: 'text-red-500', icon: <TrendingDown className="w-4 h-4 mr-1" /> };
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

    const ActionsCard = () => {
        // Simple AI Logic for Dashboard Summary
        let aiSummary = "Start building your portfolio to get personalized insights.";
        let nextMove = "Add your first transaction.";

        if (holdings.length > 0) {
            const sortedHoldings = [...holdings].sort((a, b) => (b.shares * b.currentPrice) - (a.shares * a.currentPrice));
            const topHolding = sortedHoldings[0];
            const topHoldingValue = (topHolding.shares * (topHolding.currentPrice || topHolding.purchasePrice)).toFixed(2);

            aiSummary = `You have ${holdings.length} active positions. Your top asset is ${topHolding.symbol} valued at $${topHoldingValue}.`;

            if (holdings.length < 3) {
                nextMove = "Consider diversifying with more sectors.";
            } else if (totalChange >= 0) {
                nextMove = "Portfolio is green! Review check your goals.";
            } else {
                nextMove = "Market is down. Look for buying opportunities.";
            }
        }

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-full border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Actions</h3>
                    <button
                        onClick={() => setActiveScreen('Portfolio')}
                        className="w-full text-left bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-between mb-3"
                    >
                        Add Transaction <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setActiveScreen('AI Insights')}
                        className="w-full text-left bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-between"
                    >
                        Ask AI a Question <BrainCircuit className="w-5 h-5" />
                    </button>
                </div>
                <div
                    onClick={() => setActiveScreen('AI Insights')}
                    className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="View more AI insights"
                >
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-gray-800 dark:text-white">Portfolio Snapshot</p>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{aiSummary}</p>
                    <p className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wide">💡 Tip: {nextMove}</p>
                </div>
            </div>
        );
    };

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

