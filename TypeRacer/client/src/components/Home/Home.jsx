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
    const [words, setWords] = useState(null); 

useEffect(() => {
    // Connect to Socket.io server if not already connected
    if (!socket) {
        const newSocket = io("http://localhost:4000");
        setSocket(newSocket);
    }
    ///////////////////
    if(socket){
        socket.on("updateTypingData",(words) => {
            console.log(123);
            console.log(words);
            setWords(words);
        });
    }
    //////////////////
    return () => {};
}, [username, room, socket,words]);
    
    const joinRoom = (room) => {
        setRoom(room);
        socket.emit("joinRoom", room);
        socket.on("updateTypingData",(words1) => {
            console.log(words1);
            setWords(words1);
        });
    };
    const handleJoinRoom = () => {
        const room = parseInt(prompt("Enter room ID"));
        if(room) {
            joinRoom(room);
            setIsJoined(true);
        }
    };
    const handleCreateRoom = () => {
        const room = parseInt(Math.floor(Math.random() * 1000000));
        joinRoom(room);
        setRoom(room);
        setIsJoined(true);
        if(!words){
            axios.get("http://localhost:4000/api/words")
            .then((response) => {
                let words = response.data.data.content.split(" ");
                socket.emit("typingData",{words:words,room:room});
                // setWords(words);
            }).catch((error) => {
                setError(error.message);
            });
        }
        
    }

    return (
        <div className="homePage">
            <div className="navbar" >
                <div className="headingContainer">
                    {/* <img className="websiteIcon" alt="website icon" src='' /> */}
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
                        <p className="username">{username}</p>
                    </div>
                    <div className="logoutbtnContainer">
                        <button className="logout-btn" onClick={redirectToLoginPage}>Log out</button>
                    </div>
                </div>
            </div>
            {!isjoined && <div className="roomContainer">
                <div className="joinRoomContainer">
                    <button className="joinRoom-btn" onClick={handleCreateRoom}>Create Race</button>
                </div>
                <p className="orText"> or </p>
                <div className="joinRoomContainer">
                    <button className="joinRoom-btn" onClick={handleJoinRoom}>Join Race</button>
                </div>
            </div>}
            
            {isjoined && (<TypingTestPage username={username} email={email} socket={socket} words = {words} room = {room} />)}
        </div>

    );
}
export default Home;




