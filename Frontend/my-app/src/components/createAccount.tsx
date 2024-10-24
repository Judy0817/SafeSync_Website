import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import InputField from './inputField';
import {useNavigate } from 'react-router-dom';
import '../App.css';
import React, { useState } from 'react';
 
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCOTmSv13FbgaS4t_vNuIMapNo-Yr_VLU",
  authDomain: "loginpage-typescript.firebaseapp.com",
  projectId: "loginpage-typescript",
  storageBucket: "loginpage-typescript.appspot.com",
  messagingSenderId: "172919331346",
  appId: "1:172919331346:web:2e41231b6eb40e2e9656cb"
};

const app = initializeApp(firebaseConfig);



function First() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoBack = () => {
      // Go back to the previous page when the arrow is clicked
      
      navigate(-1);
    };

    const handleSignUp =()=>{
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        console.log('User signed up:', user);
        navigate('/homePage');

        })
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const errorMsg = `Sign up error: ${errorCode} - ${errorMessage}`;

          // Display error message in a pop-up alert
          window.alert(errorMsg);
    });
    } 


  return (
    
        <div className="App">
        <div className="login_box">
          <div>
          <FontAwesomeIcon icon={faArrowLeft} className="arrow" onClick={handleGoBack}/>
         <div className='content' >
         <span className="heading">Welcome Back! </span>
          <span className="sub_heading">Create An Account</span>
          <InputField type="email" placeholder="E-mail" value ={email} onChange={(e) => setEmail(e.target.value)}/>
          <InputField type="password" placeholder="Password" value ={password} onChange={(e) => setPassword(e.target.value)} />
          {/* <InputField type="password" placeholder="Re-enter password" /> */}
          <button type="button" onClick={handleSignUp} className='button'>SignUp</button>
         </div>
          </div>
        </div>
        </div>

  );
}
 
export default First;