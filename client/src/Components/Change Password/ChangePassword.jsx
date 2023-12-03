import { CircularProgress } from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { changePassword } from "../../Redux/actions/userAction";
import toast from "react-hot-toast";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Tooltip } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";

const ChangePassword = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { loading } = useSelector((state) => state.updateProfile);

  const handleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const handleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(changePassword(oldPassword, newPassword)).then((response) => {
      if (response && response.success) {
        toast.success("Password Changed Successfully");
        navigate("/me");
      } else {
        toast.error("Old Password Incorrect");
      }
    });
  };

  return (
    <>
      <section id="section">
      <Link to="/me">
          <Tooltip title={"Go Back"}>
            <ReplyIcon style={{ fontSize: "3rem", color: "#007bff", position: 'absolute', right: '30%', top: '15%' }} />
          </Tooltip>
        </Link>
        <div className="container" id="container">
          <div className="form-container sign-in-container">
            <form onSubmit={submitHandler} autoComplete="off">
              <h1 className="loginh1">Change Password</h1>
              <div className="passwordShow">
                <input
                  className="passwordInput"
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                  }}
                  placeholder="Enter Old Password"
                  required
                />
                <div className="password-toggle" onClick={handleOldPasswordVisibility}>
                  {showOldPassword ? <VisibilityIcon style={{ cursor: 'pointer', fontSize: '20px' }} /> : <VisibilityOffIcon style={{ cursor: 'pointer', fontSize: '20px' }} />}
                </div>
              </div>

              <div className="passwordShow">
                <input
                  className="passwordInput"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                  }}
                  placeholder="Enter New Password"
                  required
                />
                <div className="password-toggle" onClick={handleNewPasswordVisibility}>
                  {showNewPassword ? <VisibilityIcon style={{ cursor: 'pointer', fontSize: '20px' }} /> : <VisibilityOffIcon style={{ cursor: 'pointer', fontSize: '20px' }} />}
                </div>
              </div>

              <button id="loginbtn" type="submit" disabled={loading}>
                {loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </div>

          <div className="overlay-container">
            <div className="overlay-loginpage">
              <div className="overlay-panel overlay-left">
                <h1 className="loginh1">Welcome Back!</h1>
                <p>
                  To keep connected with us please login with your personal info
                </p>
                <button className="ghost" id="signIn">
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1 className="loginh1"> Hello ! {user.name}</h1>
                <p>Change your Password here</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ChangePassword;
