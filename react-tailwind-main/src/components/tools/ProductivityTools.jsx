import React from 'react';
import PomodoroTimer from './PomodoroTimer';
import GoalsList from './GoalsList';
import FinancialDashboard from './FinancialDashboard';
import FinanceCalculator from './FinanceCalculator';
import PatrimonialGoals from './PatrimonialGoals';

const ProductivityTools = ({
  financialData = [],
  setFinancialData,
  transactions = [],
  setTransactions,
  goals = [], // Recebe goals
  setGoals, // Recebe setGoals
}) => {
  return (
    <div className="p-4 md:p-6 bg-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-1">
          <PomodoroTimer />
          <div className="mt-6">
            <GoalsList financialData={financialData} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <FinancialDashboard
            financialData={financialData}
            updateFinancialData={setFinancialData}
          />
          <div className="mt-6">
            <FinanceCalculator
              financialData={financialData}
              updateFinancialData={setFinancialData}
              transactions={transactions}
              setTransactions={setTransactions}
            />
          </div>
          <div className="mt-6">
            <PatrimonialGoals
              financialData={financialData}
              transactions={transactions}
              goals={goals} // Passa goals
              setGoals={setGoals} // Passa setGoals
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityTools;