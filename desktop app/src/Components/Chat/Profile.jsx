import React from "react";
import "./Profile.css";
import { Link, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Tooltip } from "@mui/material";


const Profile = ({ user }) => {

  const navigate = useNavigate();

  const navigateToUpdate = () => {
    navigate("/me/update")
  }

  const navigateToPassword = () => {
    navigate("/password/update")
  }

  return (
    <>
      <section className="main">
        <div className="profile-card">
          <div className="back-button">
            <Link to="/">
              <Tooltip title={"Close"}>
                <CloseIcon style={{ fontSize: '2rem' }} />
              </Tooltip>
            </Link>
          </div>
          <div className="image">
            <img src={user.avatar.url} alt="" className="profile-pic" />
          </div>
          <div className="data">
            <h2>{user.name}</h2>
            <span className="profile-span">{user.email}</span>
            <span className="profile-span">{user.mobileNumber}</span>
          </div>

          <div className="buttons">
            <Button style={{ backgroundColor: "#007bff", color: "white", borderRadius: "5px" }} onClick={navigateToUpdate}>Edit Profile</Button>
            <Button style={{ backgroundColor: "#007bff", color: "white", borderRadius: "5px", marginLeft: "15px" }} onClick={navigateToPassword}>Change Password</Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
