import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from './inputField';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
 

function First() {
const navigate = useNavigate();
const handleGoBack = () => {
  // Go back to the previous page when the arrow is clicked
  
  navigate(-1);
};
const [email, setEmail] = useState('');
const handleResetPassword =()=>{
  const auth = getAuth();
      sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        // ..
        window.alert("Password reset email sent!");
      })
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const errorMsg = `Email error: ${errorCode} - ${errorMessage}`;

          // Display error message in a pop-up alert
          window.alert(errorMsg);
      });
}

  return (
    
        <div className="App">
        <div className="login_box">
          <div>
          <FontAwesomeIcon icon={faArrowLeft} className="arrow" onClick={handleGoBack}/>
          <span className="heading" style={{ whiteSpace: 'pre-line' }}>Reset Your password</span>

          <span className="sub_heading">Please enter your e-mail Address</span>
          <InputField type="email" placeholder="E-mail" value ={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={handleResetPassword} className='button'>Reset Password</button> 
          </div>
        </div>
        </div>

  );
}
 
export default First;