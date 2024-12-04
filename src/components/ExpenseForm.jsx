import React, { useState } from 'react';
import { Plus, DollarSign, Receipt, User2 } from 'lucide-react';
import { CURRENCIES, EXPENSE_CATEGORIES } from '../constants';

const ExpenseForm = ({ people, onAddExpense, isPending = false }) => {
  const [newExpense, setNewExpense] = useState({
    paidBy: '',
    amount: '',
    description: '',
    currency: 'USD',
    category: '',
  });

  const handleSubmit = () => {
    if (!newExpense.paidBy || !newExpense.amount || !newExpense.description) {
      return;
    }
    onAddExpense(newExpense);
    setNewExpense({
      paidBy: '',
      amount: '',
      description: '',
      currency: 'USD',
      category: '',
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-lg p-4 shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
          <Plus className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-medium text-gray-900">Add Expense</h2>
      </div>

      {/* Main Form */}
      <div className="space-y-4">
        {/* Description Field */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Receipt className="h-4 w-4 text-gray-400" />
            </div>
            <input
              placeholder="What's this for?"
              className="w-full pl-8 pr-3 py-2 rounded-md border border-gray-200 
                focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 
                outline-none transition-all"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
          </div>
        </div>

        {/* Amount and Person Row */}
        <div className="flex gap-2">
          {/* Amount + Currency */}
          <div className="flex gap-1 flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                placeholder="0.00"
                className="w-full pl-8 pr-2 py-2 rounded-md border border-gray-200 
                  focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 
                  outline-none transition-all"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            <select
              className="w-16 px-1 py-2 rounded-md border border-gray-200 
                focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 
                outline-none transition-all bg-white text-gray-600"
              value={newExpense.currency}
              onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
            >
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          {/* Paid By */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <User2 className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="w-full pl-8 pr-2 py-2 rounded-md border border-gray-200 
                focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 
                outline-none transition-all appearance-none bg-white"
              value={newExpense.paidBy}
              onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
            >
              <option value="">Paid by</option>
              {people.map((person) =>
                person.name ? (
                  <option key={person.id} value={person.name}>{person.name}</option>
                ) : null
              )}
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        <div>
          <label className="block text-m font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {EXPENSE_CATEGORIES.map((category) => (
              <button
                key={category.name}
                onClick={() => setNewExpense(prev => ({ ...prev, category: category.name }))}
                className={`flex flex-col items-center p-2 rounded-lg transition-all
                  ${newExpense.category === category.name 
                    ? `${category.color}` 
                    : `hover:${category.color}`}`}
              >
                <span className="text-xl mb-1">{category.emoji}</span>
                <span className="text-xs text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!newExpense.paidBy || !newExpense.amount || !newExpense.description || isPending}
          className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white font-medium
            hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default ExpenseForm;