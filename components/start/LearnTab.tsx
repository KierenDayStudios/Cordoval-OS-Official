import React from 'react';

export const LearnTab: React.FC = () => {
  return (
    <div className="flex-1 overflow-hidden relative flex flex-col h-full bg-slate-50/50">
      <iframe 
        src="https://learn.cordoval.work" 
        className="w-full h-full border-0"
        title="Cordoval Learn"
        allowFullScreen
      />
    </div>
  );
};
