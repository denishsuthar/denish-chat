import React, { useState } from "react";
import "../Login/Login.css";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { editProfile, loadUser } from "../../Redux/actions/userAction";
import CircularProgress from "@mui/material/CircularProgress";
import { Tooltip } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';


const UpdateProfile = ({ user }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const { loading } = useSelector((state) => state.updateProfile);
  const navigate = useNavigate();

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setImage(file);
    };
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (loading) {
      return;
    }
    const myForm = new FormData();
    myForm.append("name", name);
    myForm.append("file", image);

    dispatch(editProfile(myForm))
      .then(() => {
        dispatch(loadUser());
        navigate("/me");
      })
      .catch((error) => {
        dispatch({ type: "clearError" });
      });
  };

  return (
    <>
      <section id="section">
        <div className="container" id="container">
          <div className="form-container sign-in-container">
            <form onSubmit={submitHandler} autoComplete="off">
              <h1 className="loginh1">Update Details</h1>
              <input
                type={"name"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Name"
              />
              <div className="field">
                <input
                  id="file"
                  type={"file"}
                  accept="image/*"
                  onChange={changeImageHandler}
                />
                <label>Profile Photo</label>
              </div>
              <div className="image-preview">
                {image && (
                  <img src={URL.createObjectURL(image)} alt="Preview" />
                )}
              </div>
              <button id="loginbtn" type="submit" disabled={loading}>
                {loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Update"
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
                  <p>Update your Profile Details here</p>
                <div className="overlay-panel1 overlay-right">
                  <Link to="/me">
                    <Tooltip title={"Close"}>
                      <CloseIcon style={{ fontSize: "2rem", color: 'white', marginLeft: '10px' }} />
                    </Tooltip>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >
    </>
  );
};

export default UpdateProfile;
