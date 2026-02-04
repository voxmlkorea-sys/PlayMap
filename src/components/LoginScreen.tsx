
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

/**
 * INSTRUCTIONS FOR USING YOUR OWN LOGO IMAGE:
 * 1. Place your image file (e.g., 'playmap-logo.png') in your project's public/assets folder.
 * 2. Find the <PlayMapLogo ... /> component usage in the JSX below.
 * 3. Replace it with an image tag: 
 *    <img src="/playmap-logo.png" alt="PlayMap Logo" className="w-48 h-auto" />
 */

const PlayMapLogo = ({ className = "w-32 h-auto" }: { className?: string }) => (
  <svg viewBox="0 0 320 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* STYLE CONFIG */}
    <g stroke="#1F2937" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        
        {/* --- ICON: PIN WITH 'P' --- */}
        <g transform="translate(10, 10)">
            {/* Pin Outline */}
            <path d="M40 5 C18 5 0 23 0 45 C0 75 40 105 40 105 C40 105 80 75 80 45 C80 23 62 5 40 5 Z" />
            {/* Inner P */}
            <path d="M32 30 V70" />
            <path d="M32 30 H45 C55 30 55 50 45 50 H32" />
        </g>

        {/* --- TEXT: PLAY (Top Row) --- */}
        <g transform="translate(110, 25)">
             {/* P */}
             <path d="M0 0 V35" />
             <path d="M0 0 H12 C20 0 20 18 12 18 H0" />
             
             {/* L */}
             <path d="M30 0 V35 H45" />
             
             {/* A */}
             <path d="M55 35 L67 0 L80 35" />
             <path d="M60 22 H75" />
             
             {/* Y */}
             <path d="M90 0 L102 20 L115 0" />
             <path d="M102 20 V35" />
        </g>

        {/* --- TEXT: MAP (Bottom Row) --- */}
        {/* Includes the distinctive "tail" line on the M */}
        <g transform="translate(110, 80)">
             {/* Line connecting/leading into M */}
             <path d="M-15 35 H0" />
             
             {/* M */}
             <path d="M0 35 V0 L15 20 L30 0 V35" />
             
             {/* A */}
             <path d="M45 35 L57 0 L70 35" />
             <path d="M50 22 H65" />
             
             {/* P */}
             <path d="M85 35 V0 H97 C107 0 107 18 97 18 H85" />
        </g>

    </g>
  </svg>
);

const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setIsLoading(true);
    // Simulate Social Auth
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/20 rounded-full blur-[100px]" />

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/50 relative z-10 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            {/* 
                [로고 변경 방법]
                1. 가지고 계신 로고 파일(png, jpg 등)을 프로젝트 폴더에 추가하세요.
                2. 아래 img 태그의 src="..." 부분을 해당 파일 경로(예: "/assets/logo.png")로 변경하세요.
                
                [크기 조절 팁 (className 수정)]
                - h-20 (80px) -> 작음
                - h-24 (96px) -> 보통 (현재 설정)
                - h-32 (128px) -> 큼
                - w-auto -> 원본 비율 유지
            */}
            <img 
              src="https://placehold.co/240x80/transparent/1F2937?text=Your+Logo&font=montserrat" 
              alt="App Logo" 
              className="h-24 w-auto object-contain mb-2" 
            />
            
            {/* 기존 SVG 로고 (필요 시 주석 해제하여 사용)
            <PlayMapLogo className="w-64 h-auto drop-shadow-sm text-gray-900" /> 
            */}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 sr-only">PlayMap</h1>
          <p className="text-gray-500 text-sm">
            {isSignUp ? 'Create an account to track your flow.' : 'Welcome back! Visualize your spending flow.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="email" 
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block pl-12 p-3.5 outline-none transition-all"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block pl-12 pr-12 p-3.5 outline-none transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <button type="button" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-bold rounded-xl text-sm px-5 py-3.5 text-center flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/50 backdrop-blur-xl text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl px-4 py-3 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm"
          >
            {/* Google Icon SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
          <button 
             type="button"
             onClick={() => handleSocialLogin('apple')}
             disabled={isLoading}
             className="flex items-center justify-center gap-2 bg-black text-white font-semibold rounded-xl px-4 py-3 hover:bg-gray-900 transition-all active:scale-95 shadow-md"
          >
             {/* Apple Icon SVG */}
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.65-.89.52.06 1.95.23 3 1.63-2.65 1.48-2.2 5.51.53 6.64-.67 1.83-1.57 3.54-2.26 4.85zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.42-2.43 4.34-3.74 4.25z" />
             </svg>
             Apple
          </button>
        </div>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
            <span className="text-indigo-600 font-bold ml-1">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </button>
        </div>

      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 text-center w-full text-xs text-gray-400">
        &copy; 2024 PlayMap Inc. All rights reserved.
      </div>
    </div>
  );
};

export default LoginScreen;
