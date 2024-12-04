import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Plus, Trash2, RefreshCcw, Share, Loader } from "lucide-react";
import { COLOR_SCHEMES, CURRENCIES, EXPENSE_CATEGORIES } from "../constants";
import PersonInput from "./PersonInput";
import ExpenseForm from "./ExpenseForm";

const ExpenseSplitter = () => {
  const { groupId } = useParams();

  // Core state
  const [people, setPeople] = useState([]); // people contains { id, name, group_id }
  const [expenses, setExpenses] = useState([]);
  const [pendingOperations, setPendingOperations] = useState(new Set());
  const [groupDetails, setGroupDetails] = useState({
    name: "",
    color_scheme: "indigo-purple",
    emoji: "🍔",
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;

      try {
        setLoading(true);
        const [groupResponse, membersResponse, expensesResponse] =
          await Promise.all([
            supabase.from("groups").select("*").eq("id", groupId).single(),
            supabase
              .from("group_members")
              .select("*")
              .eq("group_id", groupId)
              .order("created_at"),
            supabase
              .from("expenses")
              .select("*")
              .eq("group_id", groupId)
              .order("created_at", { ascending: false }),
          ]);

        // Handle any errors
        [groupResponse, membersResponse, expensesResponse].forEach(
          (response) => {
            if (response.error) throw response.error;
          }
        );

        // Set group details
        setGroupDetails({
          name: groupResponse.data.name,
          currency_default: groupResponse.data.currency_default,
          color_scheme: groupResponse.data.color_scheme || "indigo-purple",
          emoji: groupResponse.data.emoji || "🍔",
        });

        // Set members and expenses
        setPeople(membersResponse.data);
        setExpenses(expensesResponse.data);

      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Share link copied to clipboard!");
    } catch (err) {
      console.error("Error copying share link:", err);
      alert("Failed to copy share link");
    }
  };

  // Core operations with optimistic updates
  const addPerson = async () => {
    const tempId = `temp_${Date.now()}`;
    const newPerson = { id: tempId, name: "", group_id: groupId };

    // Optimistic update
    setPeople((current) => [...current, newPerson]);
    setPendingOperations((current) => new Set([...current, tempId]));

    try {
      const { data, error } = await supabase
        .from("group_members")
        .insert([{ name: "", group_id: groupId }])
        .select()
        .single();

      if (error) throw error;

      // Update with real data
      setPeople((current) => current.map((p) => (p.id === tempId ? data : p)));
    } catch (err) {
      // Rollback on error
      setPeople((current) => current.filter((p) => p.id !== tempId));
      console.error("Error adding person:", err);
    } finally {
      setPendingOperations((current) => {
        const updated = new Set(current);
        updated.delete(tempId);
        return updated;
      });
    }
  };

  const updatePerson = async (personId, newName) => {
    const oldPerson = people.find((p) => p.id === personId);

    // Start pending operation
    setPendingOperations((current) => new Set([...current, personId]));

    // Optimistic update
    setPeople((current) =>
      current.map((p) =>
        p.id === personId ? { ...p, name: newName.trim() } : p
      )
    );

    try {
      const { error } = await supabase
        .from("group_members")
        .update({ name: newName.trim() })
        .eq("id", personId);

      if (error) throw error;
    } catch (err) {
      // Rollback on error
      setPeople((current) =>
        current.map((p) => (p.id === personId ? oldPerson : p))
      );
      console.error("Error updating person:", err);
    } finally {
      // End pending operation
      setPendingOperations((current) => {
        const updated = new Set(current);
        updated.delete(personId);
        return updated;
      });
    }
  };

  const removePerson = async (personId) => {
    const personToRemove = people.find((p) => p.id === personId);

    // Optimistic update
    setPendingOperations((current) => new Set([...current, personId]));
    setPeople((current) => current.filter((p) => p.id !== personId));

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", personId);

      if (error) throw error;
    } catch (err) {
      // Rollback on error
      setPeople((current) => [...current, personToRemove]);
      console.error("Error removing person:", err);
    } finally {
      setPendingOperations((current) => {
        const updated = new Set(current);
        updated.delete(personId);
        return updated;
      });
    }
  };

  const addExpense = async () => {
    if (!newExpense.paidBy || !newExpense.amount || !newExpense.description) {
      return;
    }

    const tempId = `temp_${Date.now()}`;
    const expenseData = {
      id: tempId,
      group_id: groupId,
      paid_by: newExpense.paidBy,
      amount: parseFloat(newExpense.amount),
      currency: newExpense.currency,
      description: newExpense.description,
      category: newExpense.category || "Other",
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setExpenses((current) => [expenseData, ...current]);
    setPendingOperations((current) => new Set([...current, tempId]));

    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert([
          {
            group_id: groupId,
            paid_by: newExpense.paidBy,
            amount: parseFloat(newExpense.amount),
            currency: newExpense.currency,
            description: newExpense.description,
            category: newExpense.category || "Other",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update with real data
      setExpenses((current) =>
        current.map((e) => (e.id === tempId ? data : e))
      );

      // Reset form
      setNewExpense({
        paidBy: "",
        amount: "",
        description: "",
        currency: groupDetails.currency_default,
        category: "",
      });
    } catch (err) {
      // Rollback on error
      setExpenses((current) => current.filter((e) => e.id !== tempId));
      console.error("Error adding expense:", err);
    } finally {
      setPendingOperations((current) => {
        const updated = new Set(current);
        updated.delete(tempId);
        return updated;
      });
    }
  };

  const deleteExpense = async (expenseId) => {
    const expenseToDelete = expenses.find((e) => e.id === expenseId);

    // Optimistic update
    setPendingOperations((current) => new Set([...current, expenseId]));
    setExpenses((current) => current.filter((e) => e.id !== expenseId));

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;
    } catch (err) {
      // Rollback on error
      setExpenses((current) => [expenseToDelete, ...current]);
      console.error("Error deleting expense:", err);
    } finally {
      setPendingOperations((current) => {
        const updated = new Set(current);
        updated.delete(expenseId);
        return updated;
      });
    }
  };

  // Calculation utilities
  const calculateBalances = useCallback(() => {
    const balances = {};
    people.forEach((person) => {
      if (person.name) balances[person.name] = 0;
    });

    expenses.forEach((expense) => {
      const splitAmount = expense.amount / people.length;
      people.forEach((person) => {
        if (person.name) {
          if (person.name === expense.paid_by) {
            balances[person.name] += expense.amount - splitAmount;
          } else {
            balances[person.name] -= splitAmount;
          }
        }
      });
    });

    return balances;
  }, [expenses, people]);

  const getSimplifiedDebts = useCallback(() => {
    const balances = calculateBalances();
    const debts = [];

    const peopleWithBalances = Object.keys(balances).filter(
      (person) => Math.abs(balances[person]) > 0.01
    );
    const debtors = peopleWithBalances.filter((person) => balances[person] < 0);
    const creditors = peopleWithBalances.filter(
      (person) => balances[person] > 0
    );

    debtors.forEach((debtor) => {
      let remainingDebt = -balances[debtor];
      creditors.forEach((creditor) => {
        if (remainingDebt > 0 && balances[creditor] > 0) {
          const amount = Math.min(remainingDebt, balances[creditor]);
          if (amount > 0.01) {
            debts.push({
              from: debtor,
              to: creditor,
              amount,
              amounts: Object.keys(CURRENCIES).map((curr) => ({
                currency: curr,
                amount: amount * CURRENCIES[curr].rate,
              })),
            });
          }
          remainingDebt -= amount;
          balances[creditor] -= amount;
        }
      });
    });

    return debts;
  }, [calculateBalances]);

  const formatAmount = useCallback((amount, currency) => {
    return `${CURRENCIES[currency].symbol}${amount.toFixed(2)}`;
  }, []);

  // Optional: Periodic refresh for multi-user scenarios
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [membersResponse, expensesResponse] = await Promise.all([
          supabase
            .from("group_members")
            .select("*")
            .eq("group_id", groupId)
            .order("created_at"),
          supabase
            .from("expenses")
            .select("*")
            .eq("group_id", groupId)
            .order("created_at", { ascending: false }),
        ]);

        if (membersResponse.error) throw membersResponse.error;
        if (expensesResponse.error) throw expensesResponse.error;

        setPeople(membersResponse.data);
        setExpenses(expensesResponse.data);
      } catch (err) {
        console.error("Error refreshing data:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [groupId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${
        COLOR_SCHEMES[groupDetails.color_scheme].from
      } ${COLOR_SCHEMES[groupDetails.color_scheme].via} ${
        COLOR_SCHEMES[groupDetails.color_scheme].to
      } py-6 px-4 sm:py-12`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center mb-8 relative">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
            <span className="text-4xl sm:text-5xl">{groupDetails.emoji}</span>
            <span>{groupDetails.name || "Expense Splitter"}</span>
          </h1>
          <p className="text-sm sm:text-base text-indigo-800 opacity-75">
            Split expenses easily with friends
          </p>
          {groupId && (
            <button
              onClick={copyShareLink}
              className="absolute right-0 top-0 p-2 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors"
              title="Share group"
            >
              <Share className="h-5 w-5" />
            </button>
          )}
        </header>

        {/* People Management */}
        <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100">
          <h2 className="text-lg sm:text-xl font-semibold text-indigo-900 mb-3">
            People
          </h2>
          <div className="space-y-3">
            {people.map((person, index) => (
              <PersonInput
                key={person.id}
                person={person.name}
                personId={person.id}
                onUpdate={updatePerson}
                onRemove={removePerson}
                disabled={people.length <= 1}
                isPending={pendingOperations.has(person.id)}
                colorIndex={index}
              />
            ))}
            <button
              onClick={addPerson}
              className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 touch-manipulation"
            >
              <Plus className="h-5 w-5" />
              Add Person
            </button>
          </div>
        </div>

        <ExpenseForm
          people={people}
          onAddExpense={async (expenseData) => {
            const tempId = `temp_${Date.now()}`;
            const newExpense = {
              id: tempId,
              group_id: groupId,
              paid_by: expenseData.paidBy,
              amount: parseFloat(expenseData.amount),
              currency: expenseData.currency,
              description: expenseData.description,
              category: expenseData.category || "Other",
              created_at: new Date().toISOString(),
            };

            // Optimistic update
            setExpenses((current) => [newExpense, ...current]);
            setPendingOperations((current) => new Set([...current, tempId]));

            try {
              const { data, error } = await supabase
                .from("expenses")
                .insert([
                  {
                    group_id: groupId,
                    paid_by: expenseData.paidBy,
                    amount: parseFloat(expenseData.amount),
                    currency: expenseData.currency,
                    description: expenseData.description,
                    category: expenseData.category || "Other",
                  },
                ])
                .select()
                .single();

              if (error) throw error;

              // Update with real data
              setExpenses((current) =>
                current.map((e) => (e.id === tempId ? data : e))
              );
            } catch (err) {
              // Rollback on error
              setExpenses((current) => current.filter((e) => e.id !== tempId));
              console.error("Error adding expense:", err);
            } finally {
              setPendingOperations((current) => {
                const updated = new Set(current);
                updated.delete(tempId);
                return updated;
              });
            }
          }}
          isPending={false}
        />

        {/* Expenses List */}
        <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100">
          <h2 className="text-lg sm:text-xl font-semibold text-indigo-900 mb-4 flex items-center justify-between">
            Recent Expenses
            {expenses.length > 0 && (
              <span className="text-sm text-indigo-600">
                {expenses.length}{" "}
                {expenses.length === 1 ? "expense" : "expenses"}
              </span>
            )}
          </h2>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-white bg-opacity-50 border border-indigo-100"
              >
                <div
                  className={`text-2xl p-2 rounded-full ${
                    EXPENSE_CATEGORIES.find(
                      (cat) => cat.name === expense.category
                    )?.color || "bg-gray-100"
                  }`}
                >
                  {EXPENSE_CATEGORIES.find(
                    (cat) => cat.name === expense.category
                  )?.emoji || "✨"}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {expense.description}
                  </div>
                  <div className="text-sm text-gray-600">
                    Paid by {expense.paid_by} •{" "}
                    {new Date(expense.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatAmount(expense.amount, expense.currency)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {expense.currency}
                  </div>
                </div>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  disabled={pendingOperations.has(expense.id)}
                  className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 
        transition-colors ${
          pendingOperations.has(expense.id)
            ? "opacity-50 cursor-not-allowed"
            : "hover:text-red-500"
        }`}
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center text-indigo-600 opacity-75 py-4">
                No expenses yet
              </p>
            )}
          </div>
        </div>

        {/* Settlement */}
        <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100">
          <h2 className="text-lg sm:text-xl font-semibold text-indigo-900 mb-3">
            Settlement
          </h2>
          <div className="space-y-3">
            {getSimplifiedDebts().map((debt, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 rounded-lg bg-white bg-opacity-50 border border-indigo-100"
              >
                <div className="text-indigo-900 mb-2 text-sm sm:text-base">
                  <span className="font-medium text-indigo-800">
                    {debt.from}
                  </span>{" "}
                  owes{" "}
                  <span className="font-medium text-indigo-800">{debt.to}</span>
                  :
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 ml-2 sm:ml-4">
                  {debt.amounts.map(({ currency, amount }) => (
                    <div key={currency} className="text-sm">
                      <span className="font-medium text-green-600">
                        {formatAmount(amount, currency)}
                      </span>
                      <span className="text-indigo-600 ml-1">({currency})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {getSimplifiedDebts().length === 0 && (
              <p className="text-center text-indigo-600 opacity-75 py-4">
                No settlements needed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSplitter;
