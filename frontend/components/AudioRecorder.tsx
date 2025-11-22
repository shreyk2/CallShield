"use client";

import React, { useState } from 'react';

export const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement WebRTC capture logic here
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-zinc-900">
      <h2 className="text-lg font-semibold mb-4">Audio Capture</h2>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleRecording}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRecording ? 'Stop Call' : 'Start Call'}
        </button>
        <div className="text-sm text-gray-500">
          {isRecording ? 'Recording active...' : 'Ready to start'}
        </div>
      </div>
    </div>
  );
};
