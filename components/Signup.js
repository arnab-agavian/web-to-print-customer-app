'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, MoveRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthFeedback, signUp } from '@/redux/slices/authSlice';

export default function Signup() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { signupComplete, signupError, signupStatus, requiresEmailConfirmation, session } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const loading = signupStatus === 'loading';

  useEffect(() => {
    dispatch(clearAuthFeedback());
    if (session?.accessToken) router.replace('/dashboard');
  }, [dispatch, router, session?.accessToken]);

  async function createAccount(event) {
    event.preventDefault();
    setValidationError('');
    const form = new FormData(event.currentTarget);
    const password = form.get('password');
    const phone = String(form.get('phone') || '').replace(/[\s()-]/g, '');
    if (password !== form.get('confirmPassword')) {
      setValidationError('Passwords do not match.');
      return;
    }
    if (!/^\+[1-9][0-9]{7,14}$/.test(phone)) {
      setValidationError('Enter a valid phone number with country code, for example +919876543210.');
      return;
    }

    const result = await dispatch(signUp({
      email: form.get('email'),
      password,
      fullName: form.get('fullName'),
      phone,
      role: 'customer',
    }));

    if (signUp.fulfilled.match(result) && result.payload.session) router.replace('/dashboard');
  }

  return <main className="login-page">
    <section className="login-visual"><Link href="/" className="brand"><span className="brand-glyph">DH</span><span>Digital<br/>Heroes</span></Link><div className="login-poster"><span>MAKE<br/>YOUR</span><b>MARK.</b><small>ONE ACCOUNT. EVERY PROJECT.</small></div><p>Create an account to save designs, approve proofs and follow every order.</p></section>
    <section className="login-form"><Link href="/" className="back-link"><ArrowLeft/>Back to shop</Link><div><span className="eyebrow dark"><span/>CREATE ACCOUNT</span><h1>Start making<br/>something great.</h1><p>Keep your projects, proofs and order history together.</p>{signupComplete&&requiresEmailConfirmation?<div className="form-success" role="status"><b>Check your inbox.</b><span>We sent you a confirmation link. Confirm your email, then sign in.</span><Link href="/login">Go to sign in</Link></div>:<form onSubmit={createAccount} aria-busy={loading}><label>Full name<input name="fullName" type="text" autoComplete="name" minLength="2" maxLength="100" disabled={loading} required/></label><label>Email address<input name="email" type="email" autoComplete="email" maxLength="254" disabled={loading} required/></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+919876543210" disabled={loading} required/></label><input name="role" type="hidden" value="customer"/><label>Password<div className="password-field"><input name="password" type={showPassword?'text':'password'} autoComplete="new-password" minLength="8" maxLength="128" disabled={loading} required/><button type="button" onClick={()=>setShowPassword(!showPassword)} disabled={loading} aria-label={showPassword?'Hide password':'Show password'}><Eye/></button></div></label><label>Confirm password<input name="confirmPassword" type={showPassword?'text':'password'} autoComplete="new-password" minLength="8" maxLength="128" disabled={loading} required/></label>{(validationError||signupError)&&<p className="form-error" role="alert">{validationError||signupError}</p>}<button className="button button-primary signup-submit" type="submit" disabled={loading}>{loading?<><span className="button-spinner"/>Creating account…</>:<>Create account <MoveRight/></>}</button></form>}<p className="signup-line">Already registered? <Link href="/login">Sign in</Link></p></div></section>
  </main>;
}
