
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div 
      className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}
      role="article"
      aria-label={`${isModel ? 'Molasse Mentor' : 'Your'} message`}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
        isModel 
          ? 'bg-white border border-slate-200 text-slate-800' 
          : 'bg-emerald-600 text-white'
      }`}>
        <div className="flex items-center mb-1">
          <span 
            className={`text-xs font-bold uppercase tracking-wider ${isModel ? 'text-emerald-700' : 'text-emerald-100'}`}
            aria-hidden="true"
          >
            {isModel ? 'Molasse Mentor' : 'Geologist'}
          </span>
        </div>
        <div className="space-y-3 leading-relaxed">
          {message.parts.map((part, idx) => (
            <div key={idx} className="whitespace-pre-wrap">
              {part.text && (
                <p className="text-sm md:text-base">
                  {part.text}
                </p>
              )}
              {part.inlineData && (
                <div className="mt-2 rounded-lg overflow-hidden border border-emerald-100/50">
                  <img 
                    src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                    alt="Uploaded rock sample or thin section image" 
                    className="max-h-60 w-auto object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
