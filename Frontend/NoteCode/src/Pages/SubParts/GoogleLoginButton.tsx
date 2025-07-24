import React from 'react';
import { GoogleOAuthProvider, GoogleLogin, GoogleCredentialResponse } from '@react-oauth/google';
import  { jwtDecode,JwtPayload } from 'jwt-decode';
import axios from 'axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
const GoogleLoginButton: React.FC = () => {
    let decoded: JwtPayload & { email?: string; picture?: string; name?: string }
  const handleSuccess = async (credentialResponse: GoogleCredentialResponse) => {
    try {
       decoded = jwtDecode<JwtPayload & { email?: string; picture?: string; name?: string }>(
        credentialResponse.credential ?? ''
      );

      console.log('Name:', decoded.name);
      console.log('Email:', decoded.email);
      console.log('Picture:', decoded.picture);

      const response = await axios.post(
        'http://localhost:3000/user/login',
        {
        
          name: decoded.name,
          email: decoded.email,
          password: 'GoogleLogin', // Placeholder password for Google login
          image: decoded.picture,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.success== true||response.data.sucess== true) {
        
        toast.success('Login Successful! Welcome back!', { className: 'success' });
        Cookies.set('userId', response.data.user.id);
        Cookies.set('name', decoded.name??"");
        Cookies.set('email', decoded.email??"");
        Cookies.set('avatar', decoded.picture??"https://github.com/shadcn.png");
        setTimeout(() => {
          window.location.href = '../HomePage';
        },1500);
      } else {
        console.log('Login failed'+response);
        toast.error('Login Failed', { className: 'error' });
      }
    } catch (error: any) {
      if(error.response.data.success==true)
      {
        toast.success('Login Successful! Welcome back!', { className: 'success' });
        Cookies.set('userId', error.response.data.user.id);
        Cookies.set('name', error.response.data.user.name??"");
        Cookies.set('email', error.response.data.user.email??"");
        Cookies.set('avatar', error.response.data.user.image??"https://github.com/shadcn.png");
        setTimeout(() => {
          window.location.href = '../HomePage';
        },1500);
      }
      if(error.response.data.message=="User is not logged in with google account") { toast.error("We could not find you\'re account with Google. Please Login with Website Crendentials", { className: "error" });}
      //Invalid email or password
      else if(error.response.data.error=="Invalid email or password") { toast.error("Email is not registered or there is an issue with you're Login", { className: "error" });}
      else
      {
        toast.error('Login Failed', { className: 'error' });
      }
      console.error('Error during Google login:', error);
      
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <GoogleOAuthProvider clientId="750881943329-g7l3uorbajpe4lam6lu89l4afuspbe3l.apps.googleusercontent.com">
      <div className="flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
