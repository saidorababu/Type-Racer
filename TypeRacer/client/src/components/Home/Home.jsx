/* eslint-disable no-unused-vars */
import React from "react";
import './Home.css'
import { useNavigate } from "react-router-dom";
import TypingArea  from "../TypingArea/TypingArea";
import axios from "axios";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import TypingTestPage from "../TypingTestPage/TypingTestPage";


function Home({username,email,handleLogout}){
    const navigate = useNavigate();
    const redirectLoadProfilePage = () => {
        navigate("/profile");
    }
    const redirectToLoginPage = ()=>{
        handleLogout();
    }

    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState(null);
    const [isjoined, setIsJoined] = useState(false);

useEffect(() => {
    // Connect to Socket.io server if not already connected
    if (!socket) {
        const newSocket = io("http://localhost:4000");
        setSocket(newSocket);
    }

    return () => {};
}, [username, room, socket]);

    const joinRoom = (room) => {
        setRoom(room);
        socket.emit("joinRoom", room);
    };

    const handleJoinRoom = () => {
        
        const room = parseInt(prompt("Enter room ID"));
        setRoom(room);
        
        // const room = Math.floor(Math.random() * 1000000);
        
        joinRoom(room);
        setIsJoined(true);
    };


    return (
        <div className="homePage">
            <div className="navbar" >
                <div className="headingContainer">
                    <img className="websiteIcon" alt="website icon" src='' />
                    <h1 className="mainHeading">Type Racer</h1>
                </div>
                <div className="navLeft">
                    <div  className="navElements">
                        <p className="navElement">About Us</p>
                        <p className="navElement">Documentation</p>
                        <p className="navElement">Contact Us</p>
                    </div>
                    <div className="profileContainer">
                        <button className="profileButton"  onClick={redirectLoadProfilePage}>
                            <img className="profileImg" alt ="profile-img" src="https://imgs.search.brave.com/xkauigvFo8pS5F0fV-ciVGwBiXeWqK97dhxLMWVD4mY/rs:fit:500:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA0LzgzLzkwLzk1/LzM2MF9GXzQ4Mzkw/OTU2M19CdXB4MGsx/TnFkejJ0WFBzNzhz/ZW1IM0lvR0VqZWhn/Ri5qcGc"/>
                        </button>
                    </div>
                    <div className="logoutbtnContainer">
                        <button className="logout-btn" onClick={redirectToLoginPage}>Log out</button>
                    </div>
                    <div className="joinRoomContainer">
                        <button className="joinRoom-btn" onClick={handleJoinRoom}>Join Race</button>
                    </div>
                </div>
            </div>
            {isjoined && (<TypingTestPage username={username} email={email} socket={socket} room = {room} />)}
        </div>

    );
}
export default Home;




