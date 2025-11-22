"use client";

import React from 'react';

export const RiskDashboard = () => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-zinc-900 mt-4">
      <h2 className="text-lg font-semibold mb-4">Live Risk Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Score</h3>
          <p className="text-2xl font-bold text-green-600">LOW</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Voice Match</h3>
          <p className="text-2xl font-bold">--%</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Deepfake Prob</h3>
          <p className="text-2xl font-bold">--%</p>
        </div>
      </div>
    </div>
  );
};
