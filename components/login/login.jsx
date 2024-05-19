import React, { useState, useRef, useEffect } from "react";
import { signIn } from 'next-auth/react';
import { makeApiCall } from "@lib/visitor";
import getSession from "@lib/getSession";
import { useRouter } from 'next/router';
import Head from "next/head";
import Logo from "@UI/icons/userLogo";
import EyeIcon from "@UI/icons/eye";

function Login({ clientIP = null }) {
  const TITLE = "Example Sign in";

  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const router = useRouter();
  const emailRef = useRef(null);
  const session = getSession();

  useEffect(() => {
    if (session) {
      window.location.href = "/";
    }
  }, [session]);


  const togglePasswordVisibility = () => {
    const showPwElement = document.querySelector(".showPw");
    if (showPwElement) {
      showPwElement.classList.toggle("active-pw");
    }
    setShowPassword(!showPassword);
  };


  const validateEmail = () => {
    const email = inputValue.email;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setEmailError("Email address is invalid");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleBlur = () => {
    if (inputValue.email.trim() !== "") {
      validateEmail();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsButtonDisabled(true);
    setEmailError("");
    setPasswordError("");

    const isEmailInvalid = !validateEmail();
    const isPasswordEmpty = inputValue.password.trim() === "";

    try {
      if (isEmailInvalid) {
        setEmailError("Email address is invalid");
        return;
      } else {
        setEmailError("");
      }
      if (isPasswordEmpty && !isEmailInvalid) {
        setPasswordError(
          'Your credentials are incorrect or have expired. Please try again or \
          <a class="href_reset" href="/auth/reset-password">reset your password</a>.'
        );
      } else if ((!isEmailInvalid && !passwordError) || !isPasswordEmpty) {

        setPasswordError("");
        try {
          setIsButtonDisabled(true);
          const result = await signIn('credentials', {
            redirect: false,
            ...inputValue
          });

          if (result.ok) {
            setIsButtonDisabled(false);
            router.push('/');
          } else if (result.error.includes("banned")) {
            setIsButtonDisabled(false);
            setPasswordError(
              'Your account have been banned ,please contant our support \
              <a class="href_reset" href="/support">Support page</a>.'
            );
          } else if (result.error.includes("verify")) {
            setIsButtonDisabled(false);
            setPasswordError(
              'Your account is not verified ,please verify before logging in'
            );
          } else {
            setIsButtonDisabled(false);
            setPasswordError(
              'Your credentials are incorrect or have expired. Please try again or \
              <a class="href_reset" href="/auth/reset-password">reset your password</a>.'
            );
          }
        } catch (error) {
          setIsButtonDisabled(false);
          setPasswordError(
            'Your credentials are incorrect or have expired (unknown error). Please try again or \
            <a class="href_reset" href="/auth/reset-password">reset your password</a>.'
          );
        }
      } else {
        setIsButtonDisabled(false);
        setPasswordError("");
      }
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const isEmailInvalid = !validateEmail();

    setInputValue({
      ...inputValue,
      [name]: value,
    });

    if (name === "email") {
      setEmailError("");
    }
    if (!isEmailInvalid && !passwordError) {
      setEmailError("");
      setPasswordError("");
    }
  };

  const handleEmailFocus = () => {
    if (inputValue.email.trim() === "") {
      setEmailError("");
    }
  };

  useEffect(() => {
    if (clientIP) {
      makeApiCall(clientIP, "login");
    }
  }, [clientIP]);

  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>
      <div className="LogiForm">
        <div className="headerLogin">
          <div
            onClick={() => (window.location.href = "/")}
            style={{ cursor: "pointer" }}
          >
            <Logo style={{ width: '100px', height: '100px' }} />
          </div>
          <p className="p24 white center">Sign in to Example</p>
        </div>
        <div className="diver">
        </div>
        <div className="bodyLogin">
          <form action="">
            <div
              className="col_inp l_sp"
              style={{ display: "flex" }}
            >
              <label htmlFor="email">EMAIL</label>
              <input
                ref={emailRef}
                type="email"
                placeholder="Enter your email"
                name="email"
                id="email"
                value={inputValue.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyUp={handleEmailFocus}
                className={emailError || passwordError ? "invalid-input" : ""}
              />
              {emailError && <div className="error-text">{emailError}</div>}
            </div>
            <div style={{ position: "relative" }} className="col_inp l_sp">
              <label htmlFor="password">PASSWORD</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                name="password"
                id="password"
                value={inputValue.password}
                onChange={handleInputChange}
                className={passwordError ? "invalid-input" : ""}
              />
              {passwordError && (
                <div
                  className="error-text"
                  style={{ color: "red" }}
                  dangerouslySetInnerHTML={{ __html: passwordError }}
                />
              )}
              <div onClick={togglePasswordVisibility} className="showPw">
                <EyeIcon></EyeIcon>
              </div>
            </div>
            <div style={{ gap: "7px" }} className="rememberMe fl_row">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                value="remember"
                defaultChecked
              />
              <label
                style={{ textTransform: "capitalise" }}
                htmlFor="remember"
                className="white p16 remember-me"
              >
                Remember me
              </label>
            </div>
          </form>
        </div>
        <div className="footerLogin" style={{ gap: "15px" }}>
          <button
            onClick={handleFormSubmit}
            disabled={isButtonDisabled}
            className="btn-bleu l_sp"
          >
            Sign in
          </button>
          <a
            href="/auth/reset-password"
            className="remember-me _remeber-me"
          >
            Forgot your password?
          </a>
          <a style={{ color: "white" }}>or</a>
          <a href="/register" className="remember-me _remeber-me">Create an account</a>
        </div>
      </div>
    </>
  );
}

export default Login;
