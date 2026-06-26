import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../context/authSlice';
import googleIcon from '../../assets/googleicon.svg'; // Ensure the path is correct for your project structure
const GoogleOAuth = () => {
  
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:6066';

  const handleGoogleAuth = async (code: string) => {
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/user/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensures HTTP-only cookies are saved!
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok && data.data?.user) {
        dispatch(setUser(data.data.user));
        localStorage.setItem('user', JSON.stringify(data.data.user));
        const hasDraft = localStorage.getItem('draftNote');
        setTimeout(() => navigate(hasDraft ? '/editor' : '/'), 1000);
      } else {
        console.error('Google login failed:', data.message || data.error);
      }
    } catch (err) {
      console.error('Network error during Google auth:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) =>
       {handleGoogleAuth(codeResponse.code)
        console.log('Google auth code received:', codeResponse);
       },
    onError: () => console.log('Login Failed'),
    flow: 'auth-code', 
  });

  return (
    <button
      type="button"
      className="bg-gray-100 text-black border-2 border-black  rounded-lg px-4 py-2 font-semibold hover:bg-gray-300 transition-all duration-300 w-full disabled:opacity-50"
      onClick={() => login()}
      disabled={loading}>
        <img src={googleIcon} alt="Google Icon" className="inline-block mr-2 w-5 h-5" />
      {loading ? 'Authenticating...' : ' Login With Google'}
    </button>
  );
};

export default GoogleOAuth;
