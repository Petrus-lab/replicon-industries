// ✅ FILE: src/components/AuthPage.jsx

import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin]     = useState(true);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [errorMsg, setErrorMsg]   = useState('');

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setErrorMsg('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      // show Firebase error code/message
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="form" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2 className="form-title">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {errorMsg && <p className="form-error">{errorMsg}</p>}

        <div className="form-group">
          <button type="submit" className="form-button">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        {isLogin
          ? "Don't have an account? "
          : 'Already have an account? '}
        <button
          onClick={toggleMode}
          type="button"
          className="form-button"
          style={{ display: 'inline-block', marginLeft: '0.5rem' }}
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
}
