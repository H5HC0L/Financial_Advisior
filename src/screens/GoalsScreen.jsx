import React, { useState } from 'react';
import { Target, PlusCircle, DollarSign, CheckCircle, Trash2 } from 'lucide-react';

const GoalsScreen = ({ goals, addGoal, addContribution }) => {
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [contributionAmounts, setContributionAmounts] = useState({});

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!newGoalName.trim() || !newGoalTarget) return;
        addGoal({ name: newGoalName, target: parseFloat(newGoalTarget) });
        setNewGoalName('');
        setNewGoalTarget('');
    };

    const handleContributionChange = (goalId, amount) => {
        setContributionAmounts({
            ...contributionAmounts,
            [goalId]: amount,
        });
    };

    const handleAddContribution = (goalId) => {
        const amount = parseFloat(contributionAmounts[goalId] || 0);
        if (amount > 0) {
            addContribution(goalId, amount);
            handleContributionChange(goalId, ''); // Reset input
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Financial Goals</h2>

            {/* Add New Goal Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <PlusCircle className="w-6 h-6 mr-2 text-blue-500" />
                    Create a New Goal
                </h3>
                <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="goal-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Name</label>
                        <input
                            type="text"
                            id="goal-name"
                            value={newGoalName}
                            onChange={(e) => setNewGoalName(e.target.value)}
                            placeholder="e.g., European Vacation"
                            className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label htmlFor="goal-target" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount ($)</label>
                        <input
                            type="number"
                            id="goal-target"
                            value={newGoalTarget}
                            onChange={(e) => setNewGoalTarget(e.target.value)}
                            placeholder="e.g., 5000"
                            className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                        />
                    </div>
                    <button type="submit" className="md:col-start-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-200">
                        Add Goal
                    </button>
                </form>
            </div>

            {/* Display Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => {
                    const progress = (goal.current / goal.target) * 100;
                    const isComplete = progress >= 100;
                    return (
                        <div key={goal.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{goal.name}</h3>
                                {isComplete ? 
                                    <CheckCircle className="w-6 h-6 text-green-500" /> : 
                                    <Target className="w-6 h-6 text-red-500" />
                                }
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                ${goal.current.toLocaleString()} / <span className="font-semibold">${goal.target.toLocaleString()}</span>
                            </p>
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 my-3">
                                <div
                                    className={`h-4 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-600'}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-sm font-semibold text-gray-600 dark:text-gray-300">{progress.toFixed(1)}% Complete</p>

                            {/* Add Contribution */}
                            {!isComplete && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={contributionAmounts[goal.id] || ''}
                                            onChange={(e) => handleContributionChange(goal.id, e.target.value)}
                                            placeholder="Amount"
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                                        />
                                        <button 
                                            onClick={() => handleAddContribution(goal.id)}
                                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg transition-colors"
                                        >
                                            <PlusCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GoalsScreen;

