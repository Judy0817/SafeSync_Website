// IncomeStatement.tsx

import React from 'react';


interface IncomeStatementProps {
  revenue: number;
  expenses: number;
}

const IncomeStatement: React.FC<IncomeStatementProps> = ({ revenue, expenses }) => {
  const netIncome = revenue - expenses;

  return (
    <div className="income-statement">
      <h2 className="box1-topic">Accident Prediction Details</h2>
      <div className="section">
        <div className="label">Revenue:</div>
        <div className="value">${revenue.toFixed(2)}</div>
      </div>
      <div className="section">
        <div className="label">Expenses:</div>
        <div className="value">${expenses.toFixed(2)}</div>
      </div>
      <div className="section">
        <div className="label">Net Income:</div>
        <div className="value">${netIncome.toFixed(2)}</div>
      </div>
      <div className="section">
        <div className="label">Revenue:</div>
        <div className="value">${revenue.toFixed(2)}</div>
      </div>
      <div className="section">
        <div className="label">Expenses:</div>
        <div className="value">${expenses.toFixed(2)}</div>
      </div>
      <div className="section">
        <div className="label">Net Income:</div>
        <div className="value">${netIncome.toFixed(2)}</div>
      </div>
      <div className="section">
        <div className="label">Revenue:</div>
        <div className="value">${revenue.toFixed(2)}</div>
      </div>
      <div className="section">
        <div className="label">Expenses:</div>
        <div className="value">${expenses.toFixed(2)}</div>
      </div>
      <div className="section">
        <div className="label">Net Income:</div>
        <div className="value">${netIncome.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default IncomeStatement;
