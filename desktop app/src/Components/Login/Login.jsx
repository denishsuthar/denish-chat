import React, { useState } from "react";
import "./Login.css";
import { login } from "../../Redux/actions/userAction";
import { useDispatch } from "react-redux";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <>
      <section id="section">
        <div className="container" id="container">

          <div className="form-container sign-in-container">
            <form onSubmit={submitHandler} autoComplete="off">
              <h1 className="loginh1">Sign in</h1>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="Email or Mobile Number"
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
                  {showPassword ? <VisibilityIcon style={{ cursor: 'pointer', fontSize: '20px' }}/> : <VisibilityOffIcon style={{ cursor: 'pointer', fontSize: '20px' }}/>}
                </div>
                </div>
              {/* <a href="#">Forgot your password?</a> */}
              <button id="loginbtn">Sign In</button>
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
                <h1 className="loginh1">Hello, Friend!</h1>
                <p>Enter your Login details to continue</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
