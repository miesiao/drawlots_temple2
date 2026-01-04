
import React from 'react';
import { BWEI_IMAGES } from '../constants';
import { BweiResult } from '../types';

interface BweiVisualProps {
  result: BweiResult;
  isCasting: boolean;
  onClick: () => void;
}

const BweiVisual: React.FC<BweiVisualProps> = ({ result, isCasting, onClick }) => {
  return (
    <div 
      className={`relative cursor-pointer transition-transform duration-500 flex justify-center items-center ${isCasting ? 'animate-bounce' : ''}`}
      onClick={!isCasting ? onClick : undefined}
    >
      <div className="flex justify-center">
        <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[#7a0000] shadow-xl transform ${isCasting ? 'rotate-12' : ''}`}>
          <img 
            src={result ? BWEI_IMAGES[result === 'standing' ? 'sheng' : result] : BWEI_IMAGES.sheng} 
            alt="Bwei"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {!result && !isCasting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
          <span className="text-white font-bold text-lg md:text-2xl drop-shadow-md animate-pulse">點擊擲筊</span>
        </div>
      )}

      {result === 'standing' && (
        <div className="absolute -top-10 bg-yellow-400 text-red-800 px-4 py-1 rounded-full font-bold shadow-lg animate-bounce">
          神蹟立筊！
        </div>
      )}
    </div>
  );
};

export default BweiVisual;
