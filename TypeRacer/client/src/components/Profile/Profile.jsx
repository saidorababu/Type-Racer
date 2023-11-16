import React, { useState } from "react";
import axios from "axios";

import './Profile.css'

function Profile({username,email}){
    const [name, setName] = useState(username);
    const [activity, setActivity] = useState([
        { date: "2022-01-01", description: "Logged in" },
        { date: "2022-01-02", description: "Uploaded file" },
        { date: "2022-01-03", description: "Downloaded file" },
    ]);
    const [profilePhoto, setProfilePhoto] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setProfilePhoto(file);
        setActivity([...activity, { date: new Date().toISOString().slice(0, 10), description: "Changed profile photo" }]);
    };
    
    const fn = ()=>{
        setName("Jane Doe");
    }
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("profilePhoto", profilePhoto);
        formData.append("name", name);
        formData.append("email", email);
        try {
            console.log("Sending request");
            const response = await axios.post("http://localhost:4000/profilephoto", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(response.data);
        } catch (error) {
            console.error(error);
            fn();
        }
    };

    return (
        <div className="profilePage">
            <div className="profileInfo">
                <img src='' className="profilePic" alt="ProfilePhoto" />
                <form onSubmit={handleFormSubmit}>
                    <input type="file" className="fileInput" onChange={handleFileUpload} />
                    <button type="submit">Upload</button>
                </form>
                <div className="profileDetails">
                    <p>{name}</p>
                    <p>{email}</p>
                </div>
            </div>
            
            <div className="activity">
                <h2>Activity</h2>
                <ul>
                    {activity.map((event, index) => (
                        <li key={index}>
                            <p className="listElement" >{event.date}</p>
                            <p  className="listElement" >{event.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
export default Profile






