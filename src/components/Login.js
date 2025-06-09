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
  background-color: #121212;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 2rem;
  color: #1DB954; // Spotify Green
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 350px;
`;

const Input = styled.input`
  background-color: #282828;
  border: 1px solid #404040;
  border-radius: 5px;
  color: #fff;
  padding: 14px;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;

  &::placeholder {
    color: #b3b3b3;
  }

  &:focus {
    outline: none;
    border-color: #1DB954;
  }
`;

const Button = styled.button`
  background-color: #1DB954;
  color: #fff;
  border: none;
  border-radius: 500px;
  padding: 16px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;

  &:hover {
    background-color: #1ed760;
  }

  &:disabled {
    background-color: #535353;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #e91e63;
  color: white;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const ToggleText = styled.p`
    margin-top: 2rem;
    color: #b3b3b3;
    cursor: pointer;

    &:hover {
        color: #fff;
    }
`;


export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      if (isLogin) {
        await login(emailRef.current.value, passwordRef.current.value);
      } else {
        await signup(emailRef.current.value, passwordRef.current.value);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(`Failed to ${isLogin ? 'log in' : 'sign up'}. Please check your credentials.`);
    }

    setLoading(false);
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
          {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
        </Button>
      </Form>
      <ToggleText onClick={toggleMode}>
        {isLogin ? "Need an account? Sign Up" : "Have an account? Log In"}
      </ToggleText>
    </LoginContainer>
  );
}
