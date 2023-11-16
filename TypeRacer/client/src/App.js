
import {BrowserRouter,Routes,Navigate,Route} from "react-router-dom"
import { useState } from 'react';
import SignUp from "./components/SignUp/SignUp.jsx"
import Login from "./components/Login/Login.jsx"
import Home from "./components/Home/Home.jsx"
import Profile from "./components/Profile/Profile.jsx"
function App() {
  const [userData,setUserData] = useState({isAuthenticated:false});
  const handleLogin = (data)=>{
    setUserData({username:data.username,email:data.email,token:data.token,isAuthenticated:true});
  };
  const handleLogout = ()=>{
    setUserData({isAuthenticated:false});
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={userData.isAuthenticated?<Navigate to="/home" />:<Login onLogin={handleLogin} />}/>
        <Route path="/signup" exact element={<SignUp  />}/>
        <Route path="/home" element={userData.isAuthenticated?<Home username={userData.username} email = {userData.email} handleLogout={handleLogout} />:<Navigate to="/" />} />
        <Route path="/profile" element ={1?<Profile username={userData.username} email = {userData.email} />:<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
