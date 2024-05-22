import React, { useState, useRef, useEffect } from "react";
import { signIn } from 'next-auth/react';
import { makeApiCall } from "@lib/visitor";
import { useRouter } from 'next/router';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import axios from "axios";
import Logo from "@UI/icons/userLogo";
import EyeIcon from "@UI/icons/eye";

function Register({ clientIP = null }) {
    const TITLE = "Example Sign up";

    const [showPassword, setShowPassword] = useState(false);
    const [inputValue, setInputValue] = useState({ email: "", password: "", name: "" });
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const router = useRouter();
    const emailRef = useRef(null);

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
                    'Please make sure to fill in all the inputs!'
                );
            } else if ((!isEmailInvalid && !passwordError) || !isPasswordEmpty) {

                setPasswordError("");
                try {
                    setIsButtonDisabled(true);
                    let userData = {
                        ...inputValue,
                        re_r: clientIP,
                    };

                    const response = await axios.post("/api/user/create", userData);
                    let errors = []
                    if (response?.data?.errors){
                        errors = response.data.errors[0];
                    }

                    if (response.status === 201 && response.data.created) {
                        setIsButtonDisabled(false);
                        toast.success(
                            "Account created succefully, Please verify you email!.",
                            {
                                position: "top-center",
                                autoClose: 5000,
                                hideProgressBar: true,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            }
                        );
                        setTimeout(() => {
                            router.push("/login");
                        }, 5000);
                    } else if (errors.includes("length")) {
                        setIsButtonDisabled(false);
                        setPasswordError(
                            'Make sure your password is at least 6 chars or more.'
                        );
                    } else if (errors.includes("in use")) {
                        setIsButtonDisabled(false);
                        setPasswordError(
                            'This email is already in use ,reset your password if you forgot it \
              <a class="href_reset" href="/auth/reset-password">reset your password</a>.'
                        );
                    }
                } catch (error) {
                    console.log(error);
                    setIsButtonDisabled(false);
                    setPasswordError(
                        'An error occured. Please try again or \
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
            makeApiCall(clientIP, "register");
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
                    <p className="p24 white center">Sign up Example</p>
                </div>
                <div className="diver">
                </div>
                <div className="bodyLogin">
                    <form action="">
                        <div
                            className="col_inp l_sp"
                            style={{ display: "flex" }}
                        >
                            <label htmlFor="email">User name</label>
                            <input
                                type="name"
                                placeholder="Enter Your User Name"
                                name="name"
                                id="name"
                                value={inputValue.name}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                // onKeyUp={handleEmailFocus}
                                className={emailError || passwordError ? "invalid-input" : ""}
                            />
                        </div>
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
                    </form>
                </div>
                <div className="footerLogin" style={{ gap: "15px" }}>
                    <button
                        onClick={handleFormSubmit}
                        disabled={isButtonDisabled}
                        className="btn-bleu l_sp"
                    >
                        Sign Up
                    </button>
                    <a
                        href="/auth/reset-password"
                        className="remember-me _remeber-me"
                    >
                        Forgot your password?
                    </a>
                    <a style={{ color: "white" }}>or</a>
                    <a href="/login" className="remember-me _remeber-me">Already signed up?</a>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}

export default Register;
