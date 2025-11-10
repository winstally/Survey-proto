'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginError() {
  const router = useRouter();

  const handleLoginRetry = () => {
    router.push('/?fromError=true');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="min-h-screen flex items-center justify-center py-10">
        <div className="max-w-[440px] w-full mx-4 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-10">
          <div className="flex flex-col items-center space-y-6 mb-10">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                認証エラー
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
              onClick={handleLoginRetry}
              className="group w-full flex items-center justify-center gap-3 bg-[#06C755] text-white p-5 rounded-2xl font-bold text-lg hover:opacity-95 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Image
                src="/images/line-logo.svg"
                alt="LINEで続行"
                width={28}
                height={28}
              />
              再度ログイン
            </button>

            <div className="text-center space-y-3 pt-2">
              <p className="text-xs text-gray-500">
                認証エラーが発生しました。<br />
                お手数ですが、再度ログインをお試しください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 