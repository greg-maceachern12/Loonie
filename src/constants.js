// constants.js
export const COLOR_SCHEMES = {
  'indigo-purple': {
    name: 'Indigo Purple',
    from: 'from-indigo-50',
    via: 'via-purple-50',
    to: 'to-blue-50',
    gradient: 'bg-gradient-to-br from-indigo-400 via-purple-400 to-blue-400'
  },
  'ruby-red': {  // New red color scheme
    name: 'Ruby Red',
    from: 'from-red-50',
    via: 'via-rose-50',
    to: 'to-pink-50',
    gradient: 'bg-gradient-to-br from-red-400 via-rose-400 to-pink-400'
  },
  'emerald-teal': {
    name: 'Emerald Teal',
    from: 'from-emerald-50',
    via: 'via-teal-50',
    to: 'to-cyan-50',
    gradient: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400'
  },
  'amber-orange': {
    name: 'Amber Orange',
    from: 'from-amber-50',
    via: 'via-orange-50',
    to: 'to-yellow-50',
    gradient: 'bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400'
  },
  'blue-cyan': {
    name: 'Ocean Blue',
    from: 'from-blue-50',
    via: 'via-sky-50',
    to: 'to-cyan-50',
    gradient: 'bg-gradient-to-br from-blue-400 via-sky-400 to-cyan-400'
  }
};

export const CURRENCIES = {
  USD: { symbol: "$", name: "USD", rate: 1 },
  CAD: { symbol: "C$", name: "CAD", rate: 1.35 },
  EUR: { symbol: "€", name: "EUR", rate: 0.91 },
  GBP: { symbol: "£", name: "GBP", rate: 0.79 },
};
export const EXPENSE_CATEGORIES = [
  { emoji: "🍽️", name: "Food & Drinks", color: "bg-orange-100" },
  { emoji: "🏠", name: "Rent/Housing", color: "bg-blue-100" },
  { emoji: "🚗", name: "Transport", color: "bg-green-100" },
  { emoji: "🎭", name: "Entertainment", color: "bg-purple-100" },
  { emoji: "🛒", name: "Shopping", color: "bg-yellow-100" },
  { emoji: "✨", name: "Other", color: "bg-gray-100" },
];
export const AVATAR_COLORS = [
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-green-100', text: 'text-green-600' },
  { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-red-100', text: 'text-red-600' },
  { bg: 'bg-teal-100', text: 'text-teal-600' },
];
