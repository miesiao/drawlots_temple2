
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HandCoins, 
  ArrowLeft, 
  Mic, 
  Keyboard, 
  History as HistoryIcon, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Circle 
} from 'lucide-react';
import { Step, UserInfo, Poem, DivinationRecord, BweiResult } from './types';
import { 
  DEITY_IMAGE, 
  TUBE_IMAGE, 
  PRAYER_IMAGE, 
  POEM_DATA 
} from './constants';
import { processTranscriptWithAI } from './services/gemini';
import BweiVisual from './components/BweiVisual';

const App: React.FC = () => {
  // Navigation State
  const [step, setStep] = useState<Step>(Step.Welcome);
  
  // User Data State
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', birthday: '', address: '', quest: '' });
  const [inputMode, setInputMode] = useState<'voice' | 'manual'>('voice');
  const [isLoading, setIsLoading] = useState(false);

  // Divination State
  const [isShaking, setIsShaking] = useState(false);
  const [currentPoem, setCurrentPoem] = useState<Poem | null>(null);
  const [sessionWillSucceed, setSessionWillSucceed] = useState(false);
  const [failAtToss, setFailAtToss] = useState(0);

  // Bwei State
  const [shengCount, setShengCount] = useState(0);
  const [bweiResult, setBweiResult] = useState<BweiResult>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [bweiMessage, setBweiMessage] = useState('');

  // History State
  const [history, setHistory] = useState<DivinationRecord[]>([]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize History from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('divination_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save to History
  const saveToHistory = useCallback((poem: Poem, info: UserInfo) => {
    const newRecord: DivinationRecord = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('zh-TW'),
      userInfo: info,
      poem: poem
    };
    const updated = [newRecord, ...history];
    setHistory(updated);
    localStorage.setItem('divination_history', JSON.stringify(updated));
  }, [history]);

  // Handlers
  const handleStartDivination = () => {
    setStep(Step.Input);
    setInputMode('voice');
  };

  const handleFinishVoiceInput = async () => {
    setIsLoading(true);
    // Simulation: the transcript is fixed for the demo
    const mockTranscript = "弟子誠心求籤，請開恩示導。";
    const aiInfo = await processTranscriptWithAI(mockTranscript);
    setUserInfo(aiInfo);
    setIsLoading(false);
    setStep(Step.Drawing);
    startDivinationSession();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(Step.Drawing);
    startDivinationSession();
  };

  const startDivinationSession = () => {
    const willSucceed = Math.random() < 0.5;
    setSessionWillSucceed(willSucceed);
    if (!willSucceed) {
      setFailAtToss(Math.floor(Math.random() * 3)); // Fail at 0, 1, or 2
    }
    setShengCount(0);
    setBweiResult(null);
    setBweiMessage('');
  };

  const handleShakeStart = () => setIsShaking(true);
  const handleShakeEnd = () => {
    if (!isShaking) return;
    setIsShaking(false);
    const randomPoem = POEM_DATA[Math.floor(Math.random() * POEM_DATA.length)];
    setCurrentPoem(randomPoem);
    setStep(Step.DrawResult);

    // Auto navigate to bwei after 3 seconds
    setTimeout(() => {
      setStep(Step.Bwei);
    }, 3000);
  };

  const handleCastBwei = () => {
    if (isCasting || shengCount >= 3) return;

    setIsCasting(true);
    setBweiResult(null);
    setBweiMessage('擲筊中...');

    setTimeout(() => {
      let result: BweiResult = 'sheng';
      
      if (sessionWillSucceed) {
        result = 'sheng';
      } else {
        if (shengCount === failAtToss) {
          result = Math.random() < 0.5 ? 'xiao' : 'yin';
        } else {
          result = 'sheng';
        }
      }

      setBweiResult(result);
      setIsCasting(false);

      if (result === 'sheng') {
        const nextCount = shengCount + 1;
        setShengCount(nextCount);
        setBweiMessage(`第 ${nextCount} 個聖筊！`);
        
        if (nextCount === 3) {
          if (currentPoem) saveToHistory(currentPoem, userInfo);
          setBweiMessage('恭喜！獲得三聖筊，請領取籤詩。');
        }
      } else {
        setBweiMessage(result === 'xiao' ? '笑筊：神明微笑不語，請重新抽籤。' : '陰筊：神明不允，請重新抽籤。');
        setTimeout(() => {
          setShengCount(0);
          setBweiResult(null);
          setBweiMessage('');
          setStep(Step.Drawing);
          startDivinationSession();
        }, 2500);
      }
    }, 1200);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPoem) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Background
    ctx.fillStyle = '#fffcf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Frame
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, 370, 770);

    // Fonts & Text Styles
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8b0000';
    
    // Title
    ctx.font = 'bold 24px "Noto Serif TC"';
    ctx.fillText('恩主公靈籤', 200, 60);

    // Poem Title
    ctx.font = 'bold 36px "Noto Serif TC"';
    ctx.fillText(currentPoem.title, 200, 120);

    // User Info
    ctx.font = '16px "Noto Sans TC"';
    ctx.fillStyle = '#333';
    ctx.fillText(`求籤弟子：${userInfo.name || '弟子'}`, 200, 160);
    ctx.fillText(`所求之事：${userInfo.quest || '祈福平安'}`, 200, 185);

    // Content
    ctx.fillStyle = '#8b0000';
    ctx.font = 'bold 24px "Noto Serif TC"';
    const lines = currentPoem.content.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, 200, 260 + (i * 50));
    });

    // Advice (聖意)
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px "Noto Sans TC"';
    ctx.fillText('【聖意】', 200, 520);
    ctx.font = '16px "Noto Sans TC"';
    
    // Wrap text for advice
    const words = currentPoem.advice;
    let line = '';
    let y = 550;
    for (let i = 0; i < words.length; i++) {
      line += words[i];
      if (line.length > 18) {
        ctx.fillText(line, 200, y);
        line = '';
        y += 25;
      }
    }
    ctx.fillText(line, 200, y);

    // Download Link
    const link = document.createElement('a');
    link.download = `籤詩-${currentPoem.title}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // View Components
  const Header = () => {
    const showHistoryButton = step === Step.Result || step === Step.History;
    return (
      <header className="sticky top-0 z-50 bg-[#8b0000] text-white p-4 shadow-lg flex items-center h-16">
        <div className="relative w-full flex items-center">
           {/* Center Title */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h1 className="text-xl md:text-2xl font-bold font-serif-tc tracking-widest">恩主公線上求籤</h1>
           </div>
           
           {/* Right History Button */}
           <div className="ml-auto relative z-10">
            {showHistoryButton && (
              <button 
                onClick={() => setStep(Step.History)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
              >
                <HandCoins size={20} />
                <span className="hidden sm:inline">功德簿</span>
              </button>
            )}
           </div>
        </div>
      </header>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        {step === Step.Welcome && (
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
              <img src={DEITY_IMAGE} alt="關聖帝君" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-bold font-serif-tc text-[#7a0000]">恩主公靈籤</h2>
              <p className="text-lg md:text-xl leading-relaxed text-gray-700">
                弟子誠心向關聖帝君稟告，<br />
                祈求指點迷津，開恩示導。
              </p>
              <button 
                onClick={handleStartDivination}
                className="w-full md:w-auto px-12 py-5 bg-[#8b0000] text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform animate-pulse"
              >
                開始稟告
              </button>
            </div>
          </div>
        )}

        {step === Step.Input && (
          <div className="max-w-xl w-full space-y-8 animate-slide-up">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif-tc text-[#7a0000] mb-4">稟告事項</h2>
              <div className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-red-50/50">
                {inputMode === 'voice' ? (
                  <div className="space-y-6">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-red-100">
                      <img src={PRAYER_IMAGE} alt="祈禱" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-gray-500 text-lg h-8">
                      {isLoading ? '' : '「弟子誠心求籤，請開恩示導...」'}
                    </div>
                    <button 
                      onClick={handleFinishVoiceInput}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-[#8b0000] text-white rounded-full font-bold shadow-lg disabled:opacity-50"
                    >
                      <Mic size={24} />
                      {isLoading ? '稟告中...' : '稟告完畢'}
                    </button>
                    <button 
                      onClick={() => setInputMode('manual')}
                      className="text-[#8b0000] underline flex items-center justify-center gap-2 w-full"
                    >
                      <Keyboard size={18} />
                      改用手動填寫
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-1">姓名</label>
                      <input 
                        type="text" 
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="請輸入姓名"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-1">生辰 (如: 農曆八月十五)</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="請輸入生辰"
                        value={userInfo.birthday}
                        onChange={(e) => setUserInfo({...userInfo, birthday: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-1">所求之事</label>
                      <textarea 
                        required
                        rows={3}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="請簡述您的疑惑或祈求事項"
                        value={userInfo.quest}
                        onChange={(e) => setUserInfo({...userInfo, quest: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-4 bg-[#8b0000] text-white rounded-full font-bold shadow-lg"
                    >
                      確認並開始求籤
                    </button>
                    <button 
                      type="button"
                      onClick={() => setInputMode('voice')}
                      className="text-[#8b0000] underline w-full text-center"
                    >
                      返回語音模式
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {step === Step.Drawing && (
          <div className="flex flex-col items-center gap-8 animate-fade-in">
            <h2 className="text-3xl font-bold font-serif-tc text-[#7a0000]">搖動籤筒</h2>
            <p className="text-gray-600">請長按或按住籤筒進行搖動</p>
            <div 
              className={`w-64 md:w-80 cursor-pointer transition-all ${isShaking ? 'animate-shake' : 'hover:scale-105'}`}
              onMouseDown={handleShakeStart}
              onMouseUp={handleShakeEnd}
              onTouchStart={handleShakeStart}
              onTouchEnd={handleShakeEnd}
            >
              <img src={TUBE_IMAGE} alt="籤筒" className="w-full rounded-[4rem] shadow-2xl border-8 border-white" />
            </div>
            {isShaking && (
              <div className="text-xl font-bold text-[#8b0000] animate-bounce">
                虔心搖動中...
              </div>
            )}
          </div>
        )}

        {step === Step.DrawResult && (
          <div className="text-center space-y-8 animate-zoom-in">
            <h2 className="text-2xl text-gray-500">抽出靈籤</h2>
            <div className="text-7xl md:text-9xl font-bold font-serif-tc text-[#8b0000] drop-shadow-lg">
              {currentPoem?.title}
            </div>
            <div className="text-xl text-gray-600 mt-4">
              即將進行擲筊確認...
            </div>
          </div>
        )}

        {step === Step.Bwei && (
          <div className="max-w-2xl w-full flex flex-col items-center gap-8 animate-slide-up">
            <h2 className="text-3xl font-bold font-serif-tc text-[#7a0000]">擲筊確認</h2>
            
            <div className="flex gap-4 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  {shengCount >= i ? (
                    <CheckCircle2 size={48} className="text-green-500" />
                  ) : (
                    <Circle size={48} className="text-gray-300" />
                  )}
                  <span className="text-sm font-bold text-gray-500 mt-2">{i}</span>
                </div>
              ))}
            </div>

            <BweiVisual 
              result={bweiResult} 
              isCasting={isCasting} 
              onClick={handleCastBwei} 
            />

            <div className="h-12 flex items-center justify-center">
              <p className={`text-xl font-bold ${bweiResult === 'sheng' ? 'text-green-600' : 'text-red-600'}`}>
                {bweiMessage}
              </p>
            </div>

            {shengCount === 3 && (
              <button 
                onClick={() => setStep(Step.Result)}
                className="px-12 py-5 bg-[#8b0000] text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
              >
                領取籤詩
              </button>
            )}
          </div>
        )}

        {step === Step.Result && currentPoem && (
          <div className="max-w-4xl w-full flex flex-col gap-8 animate-fade-in mb-12">
            {/* Integrated Result Container */}
            <div className="bg-[#fffcf7] rounded-[2rem] shadow-2xl border-[12px] border-[#8b0000] overflow-hidden flex flex-col">
              {/* Poem Content Part */}
              <div className="p-8 md:p-12 text-[#8b0000] flex flex-col items-center border-b-2 border-dashed border-red-200">
                <div className="text-lg md:text-xl font-bold font-serif-tc mb-4">恩主公靈籤</div>
                <div className="text-5xl md:text-7xl font-black font-serif-tc mb-8">{currentPoem.title}</div>
                <div className="space-y-4 md:space-y-6 text-2xl md:text-4xl font-bold font-serif-tc text-center leading-relaxed">
                  {currentPoem.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
              
              {/* Advice & Explanation Integrated */}
              <div className="p-8 md:p-10 bg-white space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#8b0000] mb-3 font-serif-tc flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#8b0000] rounded-full"></span>
                    聖意
                  </h3>
                  <p className="text-xl text-gray-700 leading-relaxed font-sans-tc">{currentPoem.advice}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#8b0000] mb-3 font-serif-tc flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#8b0000] rounded-full"></span>
                    解說
                  </h3>
                  <p className="text-xl text-gray-700 leading-relaxed font-sans-tc">{currentPoem.explanation}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 px-4">
              <button 
                onClick={downloadImage}
                className="flex-1 flex items-center justify-center gap-2 py-5 bg-gray-800 text-white rounded-full font-bold shadow-lg hover:bg-gray-700 transition-colors text-lg"
              >
                <Download size={24} />
                留存籤詩 (下載)
              </button>
              <button 
                onClick={() => setStep(Step.Welcome)}
                className="flex-1 flex items-center justify-center gap-2 py-5 bg-[#8b0000] text-white rounded-full font-bold shadow-lg hover:bg-[#7a0000] transition-colors text-lg"
              >
                <RefreshCw size={24} />
                再求一籤
              </button>
            </div>
          </div>
        )}

        {step === Step.History && (
          <div className="max-w-4xl w-full animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-[#8b0000] rounded-2xl">
                  <HistoryIcon size={32} />
                </div>
                <h2 className="text-3xl font-bold font-serif-tc text-[#7a0000]">功德簿 (紀錄)</h2>
              </div>
              <button 
                onClick={() => setStep(Step.Welcome)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800"
              >
                <ArrowLeft size={20} />
                返回首頁
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2rem] shadow-inner text-gray-400">
                <p className="text-xl">尚無求籤紀錄</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((record) => (
                  <div 
                    key={record.id}
                    onClick={() => {
                      setCurrentPoem(record.poem);
                      setUserInfo(record.userInfo);
                      setStep(Step.Result);
                    }}
                    className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-transparent hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-400">{record.timestamp}</span>
                      <span className="text-[#8b0000] font-bold font-serif-tc">{record.poem.title}</span>
                    </div>
                    <p className="text-gray-700 font-bold mb-1">所求：{record.userInfo.quest}</p>
                    <p className="text-gray-500 text-sm line-clamp-1">{record.poem.content.replace(/\n/g, ' ')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Hidden Canvas for generating PNG */}
      <canvas ref={canvasRef} width={400} height={800} className="hidden" />

      <footer className="bg-gray-100 p-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} 恩主公線上求籤 AI 版 - 本站為模擬體驗
      </footer>
    </div>
  );
};

export default App;
