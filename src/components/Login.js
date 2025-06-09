import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.logo};
  font-size: 4rem;
  font-weight: normal;
  letter-spacing: 2px;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  text-shadow: 2px 2px 8px rgba(138, 43, 226, 0.5);

  @media (max-width: 480px) {
    font-size: 3rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 350px;
  padding: 0 20px;
`;

const Input = styled.input`
  background-color: ${({ theme }) => theme.colors.surfaceHighlight};
  border: 1px solid #404040;
  border-radius: 5px;
  color: ${({ theme }) => theme.colors.text};
  padding: 14px;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-family: ${({ theme }) => theme.fonts.main};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 500px;
  padding: 16px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background-color: #535353;
    cursor: not-allowed;
  }
`;

const GoogleButton = styled(Button)`
  background-color: #fff;
  color: #000;
  margin-top: 0.5rem;

  &:hover {
    background-color: #eee;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const Divider = styled.p`
  margin: 1.5rem 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

const ToggleText = styled.p`
    margin-top: 2rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: pointer;

    &:hover {
        color: ${({ theme }) => theme.colors.text};
    }
`;

// Simple inline SVG for the Google logo to avoid adding new dependencies
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M17.64 9.20455C17.64 8.56682 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"></path><path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957272V13.0418C2.43818 15.9873 5.48182 18 9 18Z" fill="#34A853"></path><path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29H0.957272C0.347727 8.55 0 10.0227 0 11.29C0 12.5573 0.347727 14.03 0.957272 15.29L3.96409 13.0418V10.71Z" fill="#FBBC05"></path><path d="M9 3.57955C10.3214 3.57955 11.5077 4.02409 12.4405 4.92545L15.0218 2.34545C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01273 0.957272 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"></path></svg>
);


export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, signup, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(emailRef.current.value, passwordRef.current.value);
      } else {
        await signup(emailRef.current.value, passwordRef.current.value);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(`Failed to ${isLogin ? 'log in' : 'sign up'}.`);
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with Google.');
      setLoading(false);
    }
  }
  
  const toggleMode = () => {
      setIsLogin(!isLogin);
      setError('');
  }

  return (
    <LoginContainer>
      <Title>EvilTwins</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Form onSubmit={handleSubmit}>
        <Input type="email" placeholder="Email" ref={emailRef} required />
        <Input type="password" placeholder="Password" ref={passwordRef} required />
        <Button disabled={loading} type="submit">
          {isLogin ? 'Log In' : 'Sign Up'}
        </Button>
      </Form>

      <Divider>or</Divider>

      <GoogleButton onClick={handleGoogleSignIn} disabled={loading}>
        <GoogleIcon />
        Sign in with Google
      </GoogleButton>

      <ToggleText onClick={toggleMode}>
        {isLogin ? "Need an account? Sign Up" : "Have an account? Log In"}
      </ToggleText>
    </LoginContainer>
  );
}
