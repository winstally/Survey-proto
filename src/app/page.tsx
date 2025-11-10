'use client';

import LineLogin from '../components/LineLogin';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { setUser } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <LineLogin 
        onSuccess={(profile) => setUser(profile)}
      >
        LINEでログイン
      </LineLogin>
    </div>
  );
}