import React, { useEffect, useState } from "react";
import "../Login/Login.css";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../Redux/actions/userAction";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Tooltip } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { message, error, loading } = useSelector((state) => state.addUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setImage(file);
    };
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch({ type: "clearError" });
    }
    if (message) {
      toast.success(message);
      dispatch({ type: "clearMessage" });
    }
  }, [dispatch, error, message]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (loading) {
      return;
    }
    const myForm = new FormData();

    myForm.append("name", name);
    myForm.append("email", email);
    myForm.append("mobileNumber", mobileNumber);
    myForm.append("password", password);
    myForm.append("file", image);

    dispatch(register(myForm))
      .then((response) => {
        if (response && response.success) {
          navigate("/admin/dashboard");
        }
      })
      .catch((error) => {
        toast.error(error);
        dispatch({ type: "clearError" });
      });
  };

  return (
    <>
      <section id="section">
        <Link to="/admin/dashboard">
          <Tooltip title={"Go Back"}>
            <ReplyIcon style={{ fontSize: "3rem", color: "#007bff", position: 'absolute', right: '30%', top: '15%' }} />
          </Tooltip>
        </Link>
        <div className="container" id="container">
          <div className="form-container sign-in-container">
            <form onSubmit={submitHandler} autoComplete="off">
              <h1 className="loginh1">Enter User Details</h1>
              <input
                type={"name"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Full Name"
                required
              />
              <input
                type={"email"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="Email"
                required
              />
              <input
                type={"number"}
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                }}
                placeholder="Mobile Number"
                required
              />
              <div className="passwordShow">
                <input
                  className="passwordInput"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  placeholder="Password"
                  required
                />
                <div className="password-toggle" onClick={handlePasswordVisibility}>
                  {/* {showPassword ? <VisibilityIcon style={{ cursor: 'pointer' }} /> : <VisibilityOffIcon style={{ cursor: 'pointer' }} />} */}
                  {
                    showPassword ? (
                      <VisibilityIcon style={{ cursor: 'pointer', fontSize: '20px' }} />
                    ) : (
                      <VisibilityOffIcon style={{ cursor: 'pointer', fontSize: '20px' }} />
                    )
                  }
                </div>
              </div>
              <div className="field">
                <input
                  id="file"
                  type={"file"}
                  accept="image/*"
                  onChange={changeImageHandler}
                />
                <label>Profile Photo</label>
              </div>
              <button id="loginbtn" type="submit" disabled={loading}>
                {loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Add User"
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
                <h1 className="loginh1">Hello!</h1>
                <p>Enter User's details and start journey with us</p>
                <div className="image-preview-adduser">
                  {image && (
                    <img src={URL.createObjectURL(image)} alt="Preview" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;
