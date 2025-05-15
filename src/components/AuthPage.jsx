// src/components/AuthPage.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]   = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
      <h1>{isRegistering ? 'Sign Up' : 'Sign In'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: '1rem 0' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          {isRegistering ? 'Create Account' : 'Sign In'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        {isRegistering
          ? 'Already have an account? '
          : "Don't have an account? "}
        <button
          onClick={() => {
            setError(null);
            setIsRegistering(!isRegistering);
          }}
          style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {isRegistering ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}
