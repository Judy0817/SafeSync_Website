import React, { useState } from 'react';
import '../App.css';
import InputField from './inputField';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Main(){

  const navigate = useNavigate();
 
  const goToForgotPassword = () => {

      // This will navigate to second component
      navigate('/forgotPassword');
  };
  const gotTocreateAccount = () => {
 
    // This will navigate to first component
    navigate('/createaccount');
};
const handleGoBack = () => {
  // Go back to the previous page when the arrow is clicked
  
  navigate(-1);
};

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const handleSignIn =()=>{
  const auth = getAuth();

  
      signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log('User signed In:', user);
      navigate('/homePage');
      // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const errorMsg = `Sign In error: ${errorCode} - ${errorMessage}`;

        // Display error message in a pop-up alert
        window.alert(errorMsg);
      });

}


  return (
    
    <div className="App">
      <div className="login_box">
        <div>
        <FontAwesomeIcon icon={faArrowLeft} className="arrow" onClick={handleGoBack}/>
        <span className="heading">Welcome Back! </span>
        <span className="sub_heading">User Login</span>
        <InputField type="email" placeholder="E-mail" value ={email} onChange={(e) => setEmail(e.target.value)}/>
          <InputField type="password" placeholder="Password" value ={password} onChange={(e) => setPassword(e.target.value)} />
        <button  className='button' onClick={handleSignIn}>Login</button>
        <div className="sub_heading1">
          <span  onClick={goToForgotPassword}>Forgot password </span>
        <span onClick={gotTocreateAccount}>Don't have an account? </span>
        </div>

        
        
        </div>
      </div>
    </div>
  );
}

export default Main;
