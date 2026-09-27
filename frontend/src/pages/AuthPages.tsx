import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { api, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';
const PENDING_EMAIL_KEY = 'roomfinder.pendingEmail';
const maskEmail = (email: string) => { const [name, domain] = email.split('@'); return name && domain ? `${name.slice(0, Math.min(2, name.length))}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}` : email; };

const OtpInput: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? '');
  const setDigit = (index: number, digit: string) => { const next = [...digits]; next[index] = digit.replace(/\D/g, '').slice(-1); onChange(next.join('')); if (next[index] && index < 5) refs.current[index + 1]?.focus(); };
  return <div className="grid grid-cols-6 gap-2" onPaste={event => { const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (pasted) { event.preventDefault(); onChange(pasted); refs.current[Math.min(pasted.length, 5)]?.focus(); } }}>
    {digits.map((digit, index) => <input key={index} ref={element => { refs.current[index] = element; }} value={digit} inputMode="numeric" aria-label={`Chữ số OTP ${index + 1}`} onChange={event => setDigit(index, event.target.value)} onKeyDown={event => { if (event.key === 'Backspace' && !digit && index > 0) refs.current[index - 1]?.focus(); }} className="h-12 min-w-0 rounded-xl border border-border text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-rausch/30 focus:border-rausch" />)}
  </div>;
};

export const AuthPages: React.FC = () => {
  const location = useLocation(); const navigate = useNavigate(); const { login, refreshUser } = useAuth();
  const [mode, setMode] = useState<Mode>('login'); const [username, setUsername] = useState(''); const [name, setName] = useState('');
  const [email, setEmail] = useState(() => sessionStorage.getItem(PENDING_EMAIL_KEY) ?? ''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [otp, setOtp] = useState('');
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false); const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    const nextMode: Mode = location.pathname === '/register' ? 'register' : location.pathname === '/verify-email' ? 'verify' : location.pathname === '/forgot-password' ? 'forgot' : location.pathname === '/reset-password' ? 'reset' : 'login';
    setMode(nextMode); setError(''); setMessage((location.state as { notice?: string } | null)?.notice ?? ''); if (nextMode === 'verify' || nextMode === 'reset') setResendIn(60);
  }, [location.pathname, location.state]);
  useEffect(() => { if (resendIn <= 0) return; const timer = window.setInterval(() => setResendIn(value => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [resendIn]);

  const rememberEmail = (value: string) => { sessionStorage.setItem(PENDING_EMAIL_KEY, value); setEmail(value); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError(''); setMessage('');
    try {
      if (mode === 'login') { const user = await login(email, password); navigate(user.role === 'host' ? '/host' : '/', { replace: true }); }
      else if (mode === 'register') { await api.register({ username, name, email, password }); rememberEmail(email); navigate('/verify-email', { replace: true }); }
      else if (mode === 'verify') { await api.verifyEmail(email, otp); sessionStorage.removeItem(PENDING_EMAIL_KEY); await refreshUser(); navigate('/', { replace: true }); }
      else if (mode === 'forgot') { await api.forgotPassword(email); rememberEmail(email); navigate('/reset-password', { replace: true }); }
      else { if (password !== confirmPassword) throw new Error('PASSWORD_MISMATCH'); await api.resetPassword(email, otp, password); sessionStorage.removeItem(PENDING_EMAIL_KEY); navigate('/login', { replace: true, state: { notice: 'Mật khẩu đã được cập nhật. Bạn có thể đăng nhập.' } }); }
    } catch (value) { setError(value instanceof ApiError ? value.message : value instanceof Error && value.message === 'PASSWORD_MISMATCH' ? 'Mật khẩu xác nhận không khớp.' : 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.'); }
    finally { setSubmitting(false); }
  };
  const resend = async () => { if (!email || resendIn > 0) return; setSubmitting(true); setError(''); try { if (mode === 'verify') await api.resendVerification(email); else await api.forgotPassword(email); setMessage('Mã OTP mới đã được gửi. Vui lòng kiểm tra hộp thư.'); setResendIn(60); } catch (value) { setError(value instanceof ApiError ? value.message : 'Không thể gửi lại OTP.'); } finally { setSubmitting(false); } };

  const title = mode === 'login' ? 'Chào mừng trở lại' : mode === 'register' ? 'Tạo tài khoản RoomFinder' : mode === 'verify' ? 'Kiểm tra email của bạn' : mode === 'forgot' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu';
  const needsOtp = mode === 'verify' || mode === 'reset';
  return <div className="min-h-[80vh] flex items-center justify-center px-4 py-12"><div className="w-full max-w-md bg-white border border-border rounded-3xl p-8 shadow-airbnb-card">
    <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-content-secondary mb-6"><ArrowLeft className="w-4 h-4" /> Trang chủ</Link>
    <div className="text-center mb-7"><div className="w-12 h-12 rounded-2xl bg-rausch mx-auto flex items-center justify-center text-white mb-3 shadow-md">{needsOtp ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}</div><h1 className="text-2xl font-black text-content-primary">{title}</h1><p className="text-xs text-content-secondary mt-2">{mode === 'verify' ? `Mã xác thực đã được gửi tới ${maskEmail(email)}.` : mode === 'reset' ? `Nhập mã đã gửi tới ${maskEmail(email)} và mật khẩu mới.` : mode === 'forgot' ? 'Chúng tôi sẽ gửi mã OTP 6 số nếu email có trong hệ thống.' : 'Bảo vệ tài khoản bằng xác thực email và phiên đăng nhập an toàn.'}</p></div>
    {message && <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{message}</div>}{error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs">{error}</div>}
    <form onSubmit={submit} className="space-y-4">
      {mode === 'register' && <><label className="block text-xs font-semibold">Tên đăng nhập<input value={username} onChange={event => setUsername(event.target.value)} minLength={3} required className="mt-1 w-full border border-border rounded-xl p-3 text-sm" /></label><label className="block text-xs font-semibold">Họ và tên<input value={name} onChange={event => setName(event.target.value)} minLength={2} required className="mt-1 w-full border border-border rounded-xl p-3 text-sm" /></label></>}
      {(!needsOtp || !email) && <label className="block text-xs font-semibold">{mode === 'login' ? 'Email hoặc tên đăng nhập' : 'Email'}<div className="relative mt-1"><Mail className="w-4 h-4 absolute left-3 top-3.5 text-content-tertiary" /><input type={mode === 'login' ? 'text' : 'email'} value={email} onChange={event => setEmail(event.target.value)} required className="w-full border border-border rounded-xl p-3 pl-9 text-sm" /></div></label>}
      {needsOtp && <label className="block text-xs font-semibold space-y-2"><span>Mã OTP 6 số</span><OtpInput value={otp} onChange={setOtp} /></label>}
      {(mode === 'login' || mode === 'register' || mode === 'reset') && <label className="block text-xs font-semibold">{mode === 'reset' ? 'Mật khẩu mới' : 'Mật khẩu'}<div className="relative mt-1"><Lock className="w-4 h-4 absolute left-3 top-3.5 text-content-tertiary" /><input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} required className="w-full border border-border rounded-xl p-3 pl-9 text-sm" /></div></label>}
      {mode === 'reset' && <label className="block text-xs font-semibold">Xác nhận mật khẩu mới<input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} minLength={8} required className="mt-1 w-full border border-border rounded-xl p-3 text-sm" /></label>}
      <button disabled={submitting || (needsOtp && otp.length !== 6)} className="w-full py-3.5 rounded-xl bg-rausch text-white text-sm font-bold disabled:opacity-60">{submitting ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : mode === 'verify' ? 'Xác thực tài khoản' : mode === 'forgot' ? 'Gửi mã OTP' : 'Đổi mật khẩu'}</button>
    </form>
    {needsOtp && <div className="mt-4 text-center text-xs text-content-secondary">Chưa nhận được mã? <button type="button" onClick={resend} disabled={resendIn > 0 || submitting} className="font-bold text-rausch disabled:text-content-tertiary">{resendIn > 0 ? `Gửi lại sau ${resendIn}s` : 'Gửi lại OTP'}</button></div>}
    <div className="mt-6 pt-5 border-t border-border-hairline text-center text-xs space-y-2">{mode === 'login' && <><Link to="/forgot-password" className="block font-bold text-rausch">Quên mật khẩu?</Link><span>Chưa có tài khoản? <Link to="/register" className="font-bold">Đăng ký ngay</Link></span></>}{mode !== 'login' && <Link to="/login" className="font-bold text-rausch">Quay lại đăng nhập</Link>}</div>
  </div></div>;
};
