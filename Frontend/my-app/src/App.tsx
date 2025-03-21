import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import First from "./components/createAccount";
import Second from "./components/forgotPassword";
import Main from "./components/main";
import HomePage from "./components/homePage";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import Notify from "./components/notify";
import AnalyzeData from "./components/analyzeData";
import TotalAccident from "./components/total_accident";
import Weather from "./components/weather";
import RoadFeature from "./components/roadfeature";
import Timenalysis from "./components/timeAnalysis";
import Severity_Distribution from "./components/severity_distribution";
import MapView from "./components/map";
import AdminRoadFeatureAnalysis from "./components/analyze_road_data";
import AdminRoadFeatureWeatherAnalysis from "./components/analyze_road_weather_data";
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
                <Route path="/notify"
                    element={<Notify />} />
                <Route path="/homePage"
                    element={<HomePage />} />
                <Route path="/analyzeData"
                    element={<AnalyzeData />} />
                <Route path="/analyze_road_data"
                    element={<AdminRoadFeatureAnalysis />} />
                <Route path="/analyze_road_weather_data"
                    element={<AdminRoadFeatureWeatherAnalysis />} />
                <Route path="/total_accident"
                    element={<TotalAccident />} />
                <Route path="/weather"
                    element={<Weather />} />
                <Route path="/roadfeature"
                    element={<RoadFeature />} />
                <Route path="/timeAnalysis"
                    element={<Timenalysis />} />
                <Route path="/severity_distribution"
                    // eslint-disable-next-line react/jsx-pascal-case
                    element={<Severity_Distribution />} />
                <Route path="/map"
                    // eslint-disable-next-line react/jsx-no-undef
                    element={<MapView />} />
                <Route path="/"
                    element={<Main />} />

            </Routes>
        </Router>
    );
}

export default App;