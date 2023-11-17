/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import axios from "axios";
import './Profile.css'
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

function Profile({username,email}){
    const [name, setName] = useState(username);
    const navigate = useNavigate();
    const [resourceUsage, setResourceUsage] = useState([
        { name: "Storage", usage: "50 GB", paymentStatus: "Paid" },
        { name: "Compute", usage: "10 hours", paymentStatus: "Unpaid" },
        { name: "Bandwidth", usage: "100 GB", paymentStatus: "Paid" },
    ]);
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
        setResourceUsage([...resourceUsage, { name: "Storage", usage: "1 GB", paymentStatus: "Paid" }]);
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
    const editProfileName = async() => {
        const newName = prompt("Enter your new name");
        if(!newName) return;
        setName(newName);
        const url = "http://localhost:4000/updateusername";
        const data = {email:email,username:newName};
        const options = {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "accept":"application/json"
            },
            body:JSON.stringify(data)
        }
        const response = await fetch (url,options);
        const jsonData = await response.json();
        console.log(jsonData);
        getUserName()
        setActivity([...activity, { date: new Date().toISOString().slice(0, 10), description: "Changed profile name" }]);
    }
    const getUserName = async () => {
        const url = `http://localhost:4000/getusername/${email}`;
        const options = {
            method: "GET",
        };
        const response = await fetch(url, options);
        const jsonData = await response.json();
        setName(jsonData.data.username);
    };
    useEffect(()=>{
        getUserName();
    });

    return (
    
        <div className="profilePage">
            <button onClick={() => navigate('/home')} className="homeButton">Go Back Home</button>
            <div className="profileInfo">
                <img className="profilePic" alt="ProfilePhoto" />
                <form onSubmit={handleFormSubmit}>
                    <input type="file" className="fileInput" onChange={handleFileUpload} />
                    <button type="submit" className="uploadButton">Upload</button>
                </form>
                <div className="profileDetails">
                    <p>{name}</p>
                    <p>{email}</p>
                </div>
                <button className="editProfileButton" onClick={editProfileName}>Edit Profile</button>
            </div>
            
            
            {/* <div className="resourceUsage">
                <h2>Resource Usage</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th>Usage</th>
                            <th>Payment Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resourceUsage.map((resource, index) => (
                            <tr key={index}>
                                <td>{resource.name}</td>
                                <td>{resource.usage}</td>
                                <td>{resource.paymentStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> */}
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






