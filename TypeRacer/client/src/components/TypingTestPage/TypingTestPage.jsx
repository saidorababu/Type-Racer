/* eslint-disable no-unused-vars */
import React from "react";
import './TypingTestPage.css'
import { useNavigate } from "react-router-dom";
import TypingArea  from "../TypingArea/TypingArea";
import axios from "axios";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

function TypingTestPage({username,email,socket,room}){
    const navigate = useNavigate();
    const redirectLoadProfilePage = () => {
        navigate("/profile");
    }
    const [words, setWords] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // const [progress, setProgress] = useState(0);
    const [progress, setProgress] = useState(0);
    const [allProgress, setAllProgress] = useState([]);
    
    useEffect(() => {
        setLoading(true);
        if(!words){
            axios.get("http://localhost:4000/api/words")
            .then((response) => {
                let words = response.data.data.content.split(" ");
                setWords(words);
                setLoading(false);
            }).catch((error) => {
                setError(error.message);
                setLoading(false);
            });
        }
        // Listen for updates to the words in the room
        socket.on("updateWords", (words) => {
            setWords(words);
        });
        const progressUpdate = async () => {   
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                },  
                body:JSON.stringify({progress:progress,username:username,email:email,room:room})
            }
            const response = await fetch(`http://localhost:4000/api/progress`, options);
            const data = await response.json();
            console.log(data);
        }
        progressUpdate();

        socket.on("updateProgress", async (allProgress) => {
            setAllProgress(allProgress);
        });

        socket.emit("progressUpdate", progress,email,room);

        const fetchProgress = async () => {
            const response = await fetch(`http://localhost:4000/api/progress/${room}`);
            const jsondata = await response.json();
            const data = jsondata.data;

            if (Array.isArray(data)) {
                const progressData = data.map((item) => {
                    return {
                        username: item.username,
                        progress: item.progress,
                    };
                });
                setAllProgress(progressData);
            }
        };
        fetchProgress();
            // Cleanup function to disconnect from Socket.io server
            return async () => {
                if (socket) {
                    socket.emit("leaveRoom", room);
                    // const response = await fetch(`http://localhost:4000/api/deleteroom/${room}`);
                    // const data = await response.json();
                    socket.disconnect();
                }
            };
        }, [username, email , room,socket,progress,allProgress,words]);

    return (
        <div className="typingTestPage">
            <div className="headingContainer">
                <h1>Online Type Racer</h1>
                <h1>Race room:{room}</h1>
            </div>
            
            {words && <TypingArea words={words} setProgress={setProgress} setAllProgress={setAllProgress} />}
           
                {(<div className="progress-bar">
                    {allProgress.map((item) => {
                        return ( 
                                <div className="progresscontainer">
                                    <div className="progress" style={{width: `${item.progress}%`}}>{item.progress}%</div>
                                    <p>{item.username}</p>
                                </div>
                            );
                    })}

                 </div>
                    )
                }
                
                
        </div>

    );
}
export default TypingTestPage;




