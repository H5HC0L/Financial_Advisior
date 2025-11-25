import React, { useState } from 'react';
import { PlusCircle, Trash2, X } from 'lucide-react';

const PortfolioScreen = ({ holdings, addHolding, removeHolding }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newHolding, setNewHolding] = useState({ symbol: '', shares: '', purchasePrice: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewHolding({ ...newHolding, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const shares = parseFloat(newHolding.shares);
        const purchasePrice = parseFloat(newHolding.purchasePrice);

        if (newHolding.symbol && shares > 0 && purchasePrice > 0) {
            addHolding({ ...newHolding, shares, purchasePrice });
            setNewHolding({ symbol: '', shares: '', purchasePrice: '' }); // Reset form
            setIsModalOpen(false); // Close modal
        } else {
            alert("Please fill in all fields with valid numbers.");
        }
    };

    const calculateTotalValue = () => {
        return holdings.reduce((total, holding) => total + (holding.shares * holding.purchasePrice), 0).toFixed(2);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Your Portfolio</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
                >
                    <PlusCircle size={20} />
                    Add Transaction
                </button>
            </div>

            {/* Portfolio Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Total Value</h3>
                <p className="text-4xl font-bold text-green-500 mt-2">${calculateTotalValue()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Based on purchase price.</p>
            </div>

            {/* Holdings Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Holdings</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="p-3">Symbol</th>
                                <th className="p-3">Shares</th>
                                <th className="p-3">Purchase Price</th>
                                <th className="p-3">Total Value</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map((holding) => (
                                <tr key={holding.symbol} className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="p-3 font-bold">{holding.symbol}</td>
                                    <td className="p-3">{holding.shares}</td>
                                    <td className="p-3">${holding.purchasePrice.toFixed(2)}</td>
                                    <td className="p-3">${(holding.shares * holding.purchasePrice).toFixed(2)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => removeHolding(holding.symbol)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold mb-6 text-center">New Transaction</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-lg font-medium mb-1">Stock Symbol</label>
                                <input type="text" name="symbol" value={newHolding.symbol} onChange={handleInputChange} placeholder="e.g., AAPL" className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-1">Number of Shares</label>
                                <input type="number" name="shares" value={newHolding.shares} onChange={handleInputChange} placeholder="e.g., 10" className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-1">Purchase Price ($)</label>
                                <input type="number" name="purchasePrice" value={newHolding.purchasePrice} onChange={handleInputChange} placeholder="e.g., 150.75" className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors">Add to Portfolio</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioScreen;

