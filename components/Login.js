'use client';
import Link from 'next/link';
import {ArrowLeft,Eye,MoveRight} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useEffect,useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {clearAuthFeedback,signIn as signInCustomer} from '@/redux/slices/authSlice';

export default function Login(){
  const router=useRouter();
  const dispatch=useDispatch();
  const {loginError,loginStatus}=useSelector((state)=>state.auth);
  const [show,setShow]=useState(false);
  useEffect(()=>{dispatch(clearAuthFeedback())},[dispatch]);
  async function signIn(event){
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const result=await dispatch(signInCustomer({email:form.get('email'),password:form.get('password'),remember:form.get('remember')==='on'}));
    if(signInCustomer.fulfilled.match(result))router.push('/dashboard');
  }
  return <main className="login-page">
    <section className="login-visual"><Link href="/" className="brand"><span className="brand-glyph">DH</span><span>Digital<br/>Heroes</span></Link><div className="login-poster"><span>MADE<br/>TO</span><b>MATTER.</b><small>YOUR PRINT. YOUR WAY.</small></div><p>One account. Every proof, order and bright idea in one place.</p></section>
    <section className="login-form"><Link href="/" className="back-link"><ArrowLeft/>Back to shop</Link><div><span className="eyebrow dark"><span/>WELCOME BACK</span><h1>Pick up where<br/>you left off.</h1><p>Sign in to review proofs, track orders and reorder favourites.</p><form onSubmit={signIn} aria-busy={loginStatus==='loading'}><label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" disabled={loginStatus==='loading'} required/></label><label>Password<div className="password-field"><input name="password" type={show?'text':'password'} placeholder="At least 8 characters" autoComplete="current-password" minLength="8" disabled={loginStatus==='loading'} required/><button type="button" onClick={()=>setShow(!show)} disabled={loginStatus==='loading'} aria-label={show?'Hide password':'Show password'}><Eye/></button></div></label>{loginError&&<p className="form-error" role="alert">{loginError}</p>}<div className="form-meta"><label><input name="remember" type="checkbox" defaultChecked disabled={loginStatus==='loading'}/>Remember me</label><button type="button" disabled={loginStatus==='loading'}>Forgot password?</button></div><button className="button button-primary" type="submit" disabled={loginStatus==='loading'}>{loginStatus==='loading'?<><span className="button-spinner"/>Signing in…</>:<>Sign in <MoveRight/></>}</button></form><p className="signup-line">New here? <Link href="/signup">Create an account</Link></p></div></section>
  </main>;
}
