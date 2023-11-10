/* eslint-disable no-unused-vars */
import React from "react";
import './Home.css'
import { useNavigate } from "react-router-dom";



function Home({username,email}){
    const navigate = useNavigate();
    const redirectLoadProfilePage = () => {
        navigate("/profile");
    }
    return (
        <div className="homePage">
            <div className="navbar" >
                <div className="headingContainer">
                    <img className="websiteIcon" alt="website icon" src='' />
                    <h1 className="mainHeading">DBC Cloud</h1>
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
                </div>
            </div>

        </div>

    );
}
export default Home