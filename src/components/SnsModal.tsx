import { Sparkles } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

interface SnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedSns: string[], otherSnsDetail: string) => void;
  initialSelectedSns: string[];
  initialOtherSnsDetail: string;
}

const snsOptions = [
  { 
    label: "Instagram", 
    brandColor: "from-purple-500 via-pink-500 to-orange-500", 
    hoverColor: "from-purple-500/5 via-pink-500/5 to-orange-500/5"
  },
  { 
    label: "Facebook", 
    brandColor: "from-blue-600 to-blue-700", 
    hoverColor: "from-blue-600/5 to-blue-700/5"
  },
  { 
    label: "X / Twitter", 
    brandColor: "from-slate-800 to-slate-900", 
    hoverColor: "from-slate-800/5 to-slate-900/5"
  },
  { 
    label: "TikTok", 
    brandColor: "from-rose-500 via-blue-500 to-cyan-400", 
    hoverColor: "from-rose-500/5 via-blue-500/5 to-cyan-400/5"
  },
  { 
    label: "LINE", 
    brandColor: "from-green-500 to-green-600", 
    hoverColor: "from-green-500/5 to-green-600/5"
  },
  { 
    label: "YouTube", 
    brandColor: "from-red-600 to-red-700", 
    hoverColor: "from-red-600/5 to-red-700/5"
  },
  { 
    label: "その他SNS", 
    description: "他のSNSを利用", 
    brandColor: "from-amber-500 to-amber-600", 
    hoverColor: "from-amber-500/5 to-amber-600/5",
    isOtherSns: true 
  }
];

const SnsModal: React.FC<SnsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialSelectedSns,
  initialOtherSnsDetail,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelectedSns);
  const [otherDetail, setOtherDetail] = useState<string>(initialOtherSnsDetail);
  const [isEditingOther, setIsEditingOther] = useState<boolean>(false);
  const [otherPending, setOtherPending] = useState<boolean>(false);
  const justSelected = useRef<boolean>(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const otherSnsLabel = snsOptions.find(o => o.isOtherSns)?.label || "その他SNS";

  useEffect(() => {
    if (isOpen) {
      setSelectedOptions([...initialSelectedSns]);
      setOtherPending(false);
      
      if (initialSelectedSns.includes(otherSnsLabel)) {
        setOtherDetail(initialOtherSnsDetail || "");
        if (initialOtherSnsDetail) {
          setIsEditingOther(false);
        } else {
          setIsEditingOther(true);
        }
      } else if (initialOtherSnsDetail) {
        setOtherDetail(initialOtherSnsDetail);
      } else {
        setOtherDetail("");
        setIsEditingOther(false);
      }
    }
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [isOpen, initialSelectedSns, initialOtherSnsDetail, otherSnsLabel]);

  const handleToggleSelection = (label: string, isOther: boolean | undefined) => {
    const isSelected = selectedOptions.includes(label);
    let newSelectedOptions;

    if (isOther) {
      if (isSelected) {
        setIsEditingOther(false);
        newSelectedOptions = selectedOptions.filter(item => item !== label);
        setOtherDetail("");
        justSelected.current = false;
        setOtherPending(false);
      } else {
        setOtherPending(true);
        setIsEditingOther(true);
        justSelected.current = true;
        
        setTimeout(() => {
          const inputElement = document.querySelector('input[placeholder="具体的なSNS名を入力"]') as HTMLInputElement;
          if (inputElement) {
            inputElement.focus();
          }
        }, 50);
        
        newSelectedOptions = [...selectedOptions];
      }
    } else {
      if (isSelected) {
        newSelectedOptions = selectedOptions.filter(item => item !== label);
      } else {
        newSelectedOptions = [...selectedOptions, label];
        if (!selectedOptions.includes(otherSnsLabel)) {
          setIsEditingOther(false);
        }
      }
      justSelected.current = false;
    }
    setSelectedOptions(newSelectedOptions);
  };

  const handleSubmit = () => {
    let finalSelectedOptions = [...selectedOptions];
    
    if (otherPending && otherDetail.trim()) {
      finalSelectedOptions.push(otherSnsLabel);
    }
    
    const finalOtherDetail = (selectedOptions.includes(otherSnsLabel) || (otherPending && otherDetail.trim())) 
      ? otherDetail.trim() 
      : "";
    
    onSubmit(finalSelectedOptions, finalOtherDetail);
    onClose();
  };

  const handleOtherSnsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherDetail(e.target.value);
  };

  const handleOtherSnsInputBlur = () => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    blurTimeoutRef.current = setTimeout(() => {
      if (otherPending && otherDetail.trim()) {
        setOtherPending(false);
        setSelectedOptions(prev => [...prev, otherSnsLabel]);
      }
      setIsEditingOther(false);
    }, 100);
  };

  const handleOtherSnsInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otherPending && otherDetail.trim()) {
        setOtherPending(false);
        setSelectedOptions(prev => [...prev, otherSnsLabel]);
      }
      setIsEditingOther(false);
    }
  };

  const handleOtherSnsInputFocus = () => {
    justSelected.current = false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto py-4">
      <div className="bg-white/95 rounded-2xl p-6 w-full max-w-md mx-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] my-auto">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent mb-2">
            知ったきっかけ (SNS)
          </h2>
          <p className="text-gray-600">
            利用したSNSをすべて選択してください
          </p>
        </div>

        <div className="relative bg-gray-50/50 rounded-xl p-3">
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none z-10 rounded-t-xl"></div>
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none z-10 rounded-b-xl"></div>
          
          <div className="space-y-2 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-300/50 scrollbar-track-transparent py-1">
            {snsOptions.map(({ label, description, isOtherSns, brandColor, hoverColor }) => {
              const isSelected = selectedOptions.includes(label);
              const showOtherInput = isOtherSns && (isSelected || otherPending) && isEditingOther;
              const showCheckmark = isSelected && !(isOtherSns && otherPending);
              
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleToggleSelection(label, isOtherSns)}
                  className={`group relative w-full p-4 bg-white rounded-xl shadow-sm
                    hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-300 text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-offset-2
                  `}
                >
                  <div className="flex flex-col items-start w-full">
                    {showOtherInput ? (
                      <input
                        type="text"
                        value={otherDetail}
                        onChange={handleOtherSnsInputChange}
                        onBlur={handleOtherSnsInputBlur}
                        onFocus={handleOtherSnsInputFocus}
                        onKeyDown={handleOtherSnsInputKeyDown}
                        placeholder="具体的なSNS名を入力"
                        className="w-full py-2 px-1 bg-transparent text-black placeholder-gray-600/70 focus:outline-none z-10 relative text-base border-b border-amber-950/30 focus:border-amber-950/60"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="block text-gray-900 transition-all duration-300">
                          {isOtherSns && otherDetail && (isSelected || otherPending) ? otherDetail : label}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">{description}</span>
                      </>
                    )}
                  </div>
                  {showCheckmark && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs animate-scaleIn">
                      ✓
                    </div>
                  )}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 ${brandColor} transition-all duration-300`}>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedOptions.length > 0 && (
          <div className="mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full text-amber-900">
              <span className="text-sm font-medium">
                {selectedOptions.length}個選択中
              </span>
            </div>
            {selectedOptions.length >= 2 && (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 rounded-full text-amber-900">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">
                            複数選択されています
                          </span>
                        </div>
                      )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:from-amber-600 hover:to-amber-500 transition-all duration-300 shadow-md"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnsModal; 