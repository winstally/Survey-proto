"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { stores } from '@/app/api/line/login/store';

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LineLoginProps {
  children: React.ReactNode;
  onSuccess: (profile: LineProfile) => void;
}

export default function LineLogin({ children, onSuccess }: LineLoginProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'kanto' | 'kyushu'>('kanto');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const fromError = params.get('fromError');

    if (code) {
      handleCallback(code);
    } else if (fromError) {
      setShowStoreSelector(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (storeName: string) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      localStorage.removeItem('overlayState');
      localStorage.removeItem('generatedFeedback');
      
      localStorage.setItem('selectedStore', storeName);

      const response = await fetch('/api/line/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ store: storeName }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      window.location.href = data.authUrl;

    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallback = async (code: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/line/callback?code=${code}`);
      const data = await response.json();

      if (data.error === "Authorization code not found") {
        setErrorMessage('セッションの有効期限が切れました。再度ログインをお願いします。');
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.user) {
        setUser(data.user);
        router.push('/survey-form');
      }
    } catch (error) {
      console.error('Callback error:', error);
      setErrorMessage('認証に失敗しました。もう一度ログインしてください。');
    } finally {
      setIsLoading(false);
    }
  };

  const StoreSelector = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white/95 rounded-2xl p-6 max-w-md w-full mx-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent mb-2">
            ご利用店舗の選択
          </h2>
          <p className="text-gray-600">
            アンケートにお答えいただく店舗を選択してください
          </p>
        </div>
        
        <div className="flex gap-2 mb-4">
          {['kanto', 'kyushu'].map((region) => (
            <button
              key={region}
              onClick={() => {
                setSelectedRegion(region as 'kanto' | 'kyushu');
                localStorage.removeItem('overlayState');
              }}
              className={`
                flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300
                ${selectedRegion === region 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-lg transform -translate-y-0.5' 
                  : 'bg-gray-50/80 text-gray-600 hover:bg-gray-100 hover:shadow'}
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
              `}
            >
              <span className="flex items-center justify-center gap-2">
                <span>{region === 'kanto' ? '関東エリア' : '九州エリア'}</span>
                <span className="text-sm">
                  ({stores.filter(s => s.region === region).length})
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="relative bg-gray-50/50 rounded-xl p-3">
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none z-10 rounded-t-xl"></div>
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none z-10 rounded-b-xl"></div>
          
          <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-300/50 scrollbar-track-transparent py-1">
            {stores
              .filter(store => store.region === selectedRegion)
              .map(store => (
                <button
                  key={store.name}
                  onClick={() => {
                    handleLogin(store.name);
                    setShowStoreSelector(false);
                  }}
                  className="group relative p-4 bg-white rounded-xl shadow-sm
                    hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-300 text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                >
                  <span className="block group-hover:text-amber-700 transition-all duration-300">
                    {store.name}
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/0 to-amber-400/0 
                    group-hover:from-amber-400/5 group-hover:to-amber-400/10 transition-all duration-300">
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="min-h-screen flex items-center justify-center py-10">
          <div className="max-w-[440px] w-full mx-4 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-10">
            <div className="text-center space-y-6">
              <div className="text-red-500 mb-4">
                {errorMessage}
              </div>
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setShowStoreSelector(true);
                }}
                className="group w-full flex items-center justify-center gap-3 bg-[#06C755] text-white p-5 rounded-2xl font-bold text-lg hover:opacity-95 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <Image
                  src="/images/line-logo.svg"
                  alt="LINEで続行"
                  width={28}
                  height={28}
                />
                再度ログインする
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="min-h-screen flex items-center justify-center py-10">
        <div className="max-w-[440px] w-full mx-4 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-10">
          <div className="flex flex-col items-center space-y-6 mb-10">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ログイン
              </h1>
            </div>
            <Image
              src="/images/logo.png"
              alt=""
              width={90}
              height={90}
              priority
            />
          </div>

          <div className="space-y-8">
            <button
              onClick={() => setShowStoreSelector(true)}
              className="group w-full flex items-center justify-center gap-3 bg-[#06C755] text-white p-5 rounded-2xl font-bold text-lg hover:opacity-95 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Image
                src="/images/line-logo.svg"
                alt="LINEで続行"
                width={28}
                height={28}
              />
              LINEでログイン
            </button>

            <div className="text-center space-y-3 pt-2">
              <p className="text-xs text-gray-500">
                ログインすることで、
                利用規約
                と
                プライバシーポリシー
                に同意したことになります
              </p>
            </div>
          </div>
        </div>
      </div>
      {showStoreSelector && <StoreSelector />}
    </div>
  );
}
