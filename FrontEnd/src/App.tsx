import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import First from "./components/createAccount";
import Second from "./components/forgotPassword";
import Main from "./components/main";
import HomePage from "./components/homePage";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCOTmSv13FbgaS4t_vNuIMapNo-Yr_VLU",
  authDomain: "loginpage-typescript.firebaseapp.com",
  projectId: "loginpage-typescript",
  storageBucket: "loginpage-typescript.appspot.com",
  messagingSenderId: "172919331346",
  appId: "1:172919331346:web:2e41231b6eb40e2e9656cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/createAccount"
                    element={<First />} />
                <Route path="/forgotPassword"
                    element={<Second />} />
                <Route path="/homePage"
                    element={<HomePage />} />
                <Route path="/"
                    element={<Main />} />

            </Routes>
        </Router>
    );
}

export default App;