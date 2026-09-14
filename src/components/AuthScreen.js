import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  auth, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  googleProvider,
  isConfigured,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from '../firebase/firebaseConfig';
import { THEME_CONFIG } from '../constants/themeConfig';
import { 
  Terminal, 
  Crown, 
  FileSpreadsheet, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Play,
  User
} from 'lucide-react';

console.log('AuthScreen lucide imports:', { Crown, AlertCircle, Mail, Lock, RefreshCw, User });

export default function AuthScreen({ currentTheme, onAuthSuccess, onThemeChange, isModal = false, customAlert }) {
  const { t, i18n } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(() => {
    try {
      const saved = localStorage.getItem('lumora_keep_logged_in');
      return saved !== 'false'; // default to true
    } catch (e) {
      return true;
    }
  });

  const handleKeepLoggedInChange = (e) => {
    const checked = e.target.checked;
    setKeepLoggedIn(checked);
    try {
      localStorage.setItem('lumora_keep_logged_in', String(checked));
    } catch (err) {
      console.error(err);
    }
  };

  const theme = THEME_CONFIG[currentTheme] || THEME_CONFIG.developer;

  const isLengthValid = password.length >= 6;
  const isComboValid = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

  React.useEffect(() => {
    const ipc = window.electron && window.electron.ipcRenderer;

    if (ipc) {
      const handlePopupClosed = () => {
        setLoading(false);
      };
      // ipc.on returns its own unsubscribe function
      return ipc.on('auth-popup-closed', handlePopupClosed);
    }
  }, []);

  React.useEffect(() => {
    if (!isSignUp) {
      localStorage.removeItem('signing_up');
    }
  }, [isSignUp]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t('auth.err_missing_fields'));
      return;
    }

    if (isSignUp && (!isLengthValid || !isComboValid)) {
      setError(t('auth.err_pwd_invalid_requirement'));
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError(t('auth.err_pwd_mismatch'));
      return;
    }

    setError('');
    setLoading(true);

    if (!isConfigured) {
      setTimeout(() => {
        setLoading(false);
        if (isSignUp) {
          setSignUpSuccess(true);
        } else {
          onAuthSuccess({ uid: "local_" + btoa(email).replace(/=/g, ''), email });
        }
      }, 300);
      return;
    }

    try {
      if (isSignUp) {
        localStorage.setItem('signing_up', 'true');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        auth.languageCode = i18n.language || 'en';
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        
        setPassword('');
        setConfirmPassword('');
        setSignUpSuccess(true);
      } else {
        const persistence = keepLoggedIn ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);
        await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess();
      }
    } catch (err) {
      console.error(err);
      let errMsg = t('auth.err_general');
      if (err.code === "auth/email-already-in-use") {
        errMsg = t('auth.err_email_in_use');
      } else if (err.code === "auth/invalid-email") {
        errMsg = t('auth.err_invalid_email');
      } else if (err.code === "auth/weak-password") {
        errMsg = t('auth.err_weak_pwd');
      } else if (err.code === "auth/missing-password" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = t('auth.err_wrong_credentials');
      } else if (err.code === "auth/user-not-found") {
        errMsg = t('auth.err_user_not_found');
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = t('auth.err_operation_not_allowed');
      } else if (err.code === "auth/too-many-requests") {
        errMsg = t('auth.err_too_many_requests');
      } else if (err.code === "auth/user-disabled") {
        errMsg = t('auth.err_user_disabled');
      } else if (err.code === "auth/network-request-failed") {
        errMsg = t('auth.err_network');
      } else if (err.code) {
        errMsg = `${t('auth.err_general')} (${err.code})`;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);

    if (!isConfigured) {
      setTimeout(() => {
        setLoading(false);
        onAuthSuccess({ uid: "google_local_user", email: "user@gmail.com" });
      }, 300);
      return;
    }

    try {
      auth.languageCode = i18n.language || 'en';
      const persistence = keepLoggedIn ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      const res = await signInWithPopup(auth, googleProvider);
      onAuthSuccess(res ? res.user : null);
    } catch (err) {
      console.error("Google Auth Error:", err);
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        let errMsg = t('auth.err_google');
        if (err.code === "auth/unauthorized-domain") {
          errMsg = "Firebase Console에서 '127.0.0.1' 및 'localhost'를 승인된 도메인에 추가해야 합니다.";
        } else if (err.code === "auth/operation-not-allowed") {
          errMsg = "Firebase Console > Authentication에서 Google 로그인 활성화가 필요합니다.";
        } else if (err.code) {
          errMsg = `${t('auth.err_google')} (${err.code})`;
        }
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t('auth.err_enter_email_for_reset'));
      return;
    }

    setError('');
    setLoading(true);

    if (!isConfigured) {
      setTimeout(async () => {
        setLoading(false);
        if (customAlert) {
          await customAlert(t('auth.forgot_pwd') || '비밀번호 찾기', t('auth.pwd_reset_sent'), true, 'mail');
        } else {
          alert(t('auth.pwd_reset_sent'));
        }
        setIsForgotPassword(false);
      }, 300);
      return;
    }

    try {
      auth.languageCode = i18n.language || 'en';
      await sendPasswordResetEmail(auth, email);
      if (customAlert) {
        await customAlert(t('auth.forgot_pwd') || '비밀번호 찾기', t('auth.pwd_reset_sent'), true, 'mail');
      } else {
        alert(t('auth.pwd_reset_sent'));
      }
      setIsForgotPassword(false);
    } catch (err) {
      console.error(err);
      let errMsg = t('auth.err_general');
      if (err.code === "auth/invalid-email") {
        errMsg = t('auth.err_invalid_email');
      } else if (err.code === "auth/user-not-found") {
        errMsg = t('auth.err_user_not_found');
      } else if (err.code === "auth/network-request-failed") {
        errMsg = t('auth.err_network');
      } else if (err.code) {
        errMsg = `${t('auth.err_general')} (${err.code})`;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Mock sign-in for testing when firebase is not configured
  const handleGuestLogin = () => {
    console.log("Entering guest mode");
    onAuthSuccess({ uid: "guest_user", email: "guest@codetiara.com" });
  };

  return (
    <div className={isModal ? "w-full max-w-sm bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-5 relative flex flex-col font-sans my-auto" : "h-full w-full flex flex-col items-center justify-center bg-gray-50 p-2 font-sans overflow-hidden"}>
      
      {/* If it's NOT a modal, wrap in the card container. If it IS a modal, we are already returning the card container. */}
      {(() => {
        let content;
        if (signUpSuccess) {
          content = (
            <>
              {/* Header Icon */}
              <div className="flex flex-col items-center justify-center mb-3 mt-1">
                <div className="w-12 h-12 bg-gradient-to-tr from-black to-gray-700 rounded-xl flex items-center justify-center shadow-md transform -rotate-6">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="mt-2 font-extrabold tracking-widest text-xs text-gray-800 uppercase">Code Tiara</div>
              </div>

              {/* Success Message */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-extrabold text-black tracking-tight mb-2 font-['Inter',sans-serif]">
                  {t('auth.signup_complete_title')}
                </h1>
                <p className="text-xs text-gray-500 font-medium font-sans leading-relaxed whitespace-pre-line">
                  {t('auth.signup_complete_desc')}
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSignUpSuccess(false);
                    setIsSignUp(false);
                  }}
                  className="w-full py-3 bg-black text-white rounded-[14px] font-bold text-xs hover:bg-gray-900 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  {t('auth.go_to_login')}
                </button>
              </div>
            </>
          );
        } else if (isForgotPassword) {
          content = (
            <>
              {/* Header Icon */}
              <div className="flex flex-col items-center justify-center mb-3 mt-1">
                <div className="w-12 h-12 bg-gradient-to-tr from-black to-gray-700 rounded-xl flex items-center justify-center shadow-md transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="mt-2 font-extrabold tracking-widest text-xs text-gray-800 uppercase">Code Tiara</div>
              </div>

              {/* Titles */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-extrabold text-black tracking-tight mb-1 font-['Inter',sans-serif]">
                  {t('auth.forgot_pwd')}
                </h1>
                <p className="text-xs text-gray-500 font-medium font-sans">
                  {t('auth.pwd_reset_subtitle')}
                </p>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-500 text-xs font-semibold rounded-xl flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-3">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onInvalid={(e) => e.target.setCustomValidity(t('auth.err_invalid_email_tooltip'))}
                    onInput={(e) => e.target.setCustomValidity('')}
                    placeholder={t('auth.email_placeholder')}
                    disabled={loading}
                    className="w-full bg-[#F2F2F2] border-none rounded-[14px] px-4 py-2.5 text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-gray-400"
                  />
                  <Mail className="absolute right-4 w-4 h-4 text-gray-400" />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-black text-white rounded-[14px] font-bold text-xs hover:bg-gray-900 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    {t('auth.send_reset_link')}
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="mt-4 text-center text-xs font-medium text-gray-500">
                <span>
                  <button 
                    onClick={() => { setIsForgotPassword(false); setError(''); }} 
                    className="text-[#FF4B4B] font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    {t('auth.back_to_login')}
                  </button>
                </span>
              </div>
            </>
          );
        } else {
          content = (
            <>
              {/* Header Icon */}
              <div className="flex flex-col items-center justify-center mb-3 mt-1">
                <div className="w-12 h-12 bg-gradient-to-tr from-black to-gray-700 rounded-xl flex items-center justify-center shadow-md transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="mt-2 font-extrabold tracking-widest text-xs text-gray-800 uppercase">Code Tiara</div>
              </div>

              {/* Titles */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-extrabold text-black tracking-tight mb-1 font-['Inter',sans-serif]">
                  {isSignUp ? t('auth.signup') : t('auth.login')}
                </h1>
                <p className="text-xs text-gray-500 font-medium font-sans">
                  {isSignUp ? t('auth.subtitle_signup') : t('auth.subtitle_login')}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 justify-center border border-red-100 shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onInvalid={(e) => e.target.setCustomValidity(t('auth.err_invalid_email_tooltip'))}
                    onInput={(e) => e.target.setCustomValidity('')}
                    placeholder={t('auth.email_placeholder')}
                    disabled={loading}
                    className="w-full bg-[#F2F2F2] border-none rounded-[14px] px-4 py-2.5 text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-gray-400"
                  />
                  <Mail className="absolute right-4 w-4 h-4 text-gray-400" />
                </div>

                <div className="space-y-1">
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.pwd_placeholder')}
                      disabled={loading}
                      className="w-full bg-[#F2F2F2] border-none rounded-[14px] px-4 py-2.5 text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-gray-400"
                    />
                    <Lock className="absolute right-4 w-4 h-4 text-gray-400" />
                  </div>
                  {!isSignUp && (
                    <div className="flex justify-end px-1">
                      <button 
                        type="button" 
                        onClick={() => { setIsForgotPassword(true); setError(''); }}
                        disabled={loading}
                        className="text-[11px] text-[#FF4B4B] hover:text-[#E03A3A] font-medium bg-transparent border-none cursor-pointer p-0 transition-colors whitespace-nowrap"
                      >
                        {t('auth.forgot_pwd')}
                      </button>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div className="mt-1 mb-1 px-2 text-left space-y-0.5">
                    <div className={`flex items-center gap-1 text-[11px] transition-colors duration-200 ${isLengthValid ? 'text-emerald-600 font-bold' : 'text-gray-400 font-medium'}`}>
                      <span className="flex-shrink-0 text-[9px]">{isLengthValid ? '●' : '○'}</span>
                      <span>{t('auth.pwd_req_length')}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[11px] transition-colors duration-200 ${isComboValid ? 'text-emerald-600 font-bold' : 'text-gray-400 font-medium'}`}>
                      <span className="flex-shrink-0 text-[9px]">{isComboValid ? '●' : '○'}</span>
                      <span>{t('auth.pwd_req_combo')}</span>
                    </div>
                  </div>
                )}

                {isSignUp && (
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('auth.pwd_confirm_placeholder')}
                      disabled={loading}
                      className="w-full bg-[#F2F2F2] border-none rounded-[14px] px-4 py-2.5 text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-gray-400"
                    />
                    <Lock className="absolute right-4 w-4 h-4 text-gray-400" />
                  </div>
                )}

                {!isSignUp && (
                  <div className="flex items-center px-1">
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium cursor-pointer select-none whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={keepLoggedIn}
                        onChange={handleKeepLoggedInChange}
                        className="w-3.5 h-3.5 flex-shrink-0 rounded-sm border-gray-300 text-black focus:ring-black accent-black" 
                      />
                      {t('auth.keep_logged_in')}
                    </label>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-black text-white rounded-[14px] font-bold text-xs hover:bg-gray-900 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    {isSignUp ? t('auth.signup') : t('auth.login')}
                  </button>
                </div>
              </form>

              <div className="mt-4 flex items-center justify-between">
                <div className="h-[1px] bg-gray-200 flex-1"></div>
                <span className="px-3 text-[11px] text-gray-400 font-medium tracking-wider">{t('auth.or_easy_login')}</span>
                <div className="h-[1px] bg-gray-200 flex-1"></div>
              </div>

              <div className="mt-3 flex justify-center gap-4">
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer shadow-sm"
                  title="Google 로그인"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.63v3.02h3.88c2.28-2.1 3.57-5.19 3.57-8.5z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.02c-1.08.72-2.47 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13C3.26 20.17 7.37 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.27 14.27c-.25-.72-.39-1.5-.39-2.27s.14-1.55.39-2.27V6.6H1.29C.47 8.23 0 10.06 0 12s.47 3.77 1.29 5.4l3.98-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.37 0 3.26 3.83 1.29 7.73l3.98 3.13c.95-2.85 3.6-4.96 6.73-4.96z"/>
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer shadow-sm text-gray-700"
                  title={t('auth.guest_mode')}
                >
                  <User className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 text-center text-xs font-medium text-gray-500">
                {isSignUp ? (
                  <span>{t('auth.already_have_account')} <button onClick={() => setIsSignUp(false)} className="text-[#FF4B4B] font-bold hover:underline bg-transparent border-none cursor-pointer p-0 ml-1">{t('auth.login')}</button></span>
                ) : (
                  <span>{t('auth.no_account')} <button onClick={() => setIsSignUp(true)} className="text-[#FF4B4B] font-bold hover:underline bg-transparent border-none cursor-pointer p-0 ml-1">{t('auth.signup')}</button></span>
                )}
              </div>
            </>
          );
        }

        if (isModal) return content;
        
        return (
          <div className="w-full max-w-xs bg-white rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] p-5 relative flex flex-col my-auto flex-shrink-0">
            {content}
          </div>
        );
      })()}
    </div>
  );
}
