import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardIcon from "../../components/UI/icons/dashboard";
import getSession from "@lib/getSession";
import { setup } from "@lib/CustomCSRF";
import axios from "axios";

function SignIn() {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [secret, setSecret] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [passError, setPassError] = useState(false);
  const session = getSession();

  useEffect(() => {
    if (session) {
      window.location.href = "/";
    }
  }, [session]);

  useEffect(() => {
    validatePassword(password, confirmPassword);
  }, [password, confirmPassword]);

  function validatePassword(pass, confrimPass) {
    let isValid = confirmPassword === pass;
    if (!isValid) {
      setPassError(true);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let userData = {
      name,
      email,
      password,
      secret,
    };

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("/api/admin/create", userData);

      if (response.status === 201 && response.data.created) {
        window.location.href = "/admin/dashboard";
      } else {
        toast.error("Failed to create account");
      }
    } catch (error) {
      toast.error("Failed to create account");
      console.error("Error while registering:", error);
    }
  }

  return (
    <div id="AuthLogin">
      <div className="AuthWrapper" style={{height: "500px"}}>
        <div className="headerAuth fl_col">
          <DashboardIcon></DashboardIcon>
          <h2>Sign Up to the dashboard:</h2>
        </div>
        <form className="fl_col" onSubmit={handleSubmit}>
          <div className="fl_col inp_col">
            <input
              type="text"
              name="name"
              placeholder="Username"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
          <div className="fl_col inp_col">
            <input
              type="text"
              name="email"
              placeholder="Email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>

          <div className="fl_col inp_col">
            <input onChange={(e) => {
              setPassword(e.target.value);
            }}
              type="password"
              name="password"
              placeholder="Password"
            />
          </div>
          <div className="fl_col inp_col">
            <input onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
              type="password"
              name="password"
              placeholder="Confirm Password"
            />
          </div>
          <div className="fl_col inp_col">
            <input
              type="text"
              name="secret"
              placeholder="Secret"
              onChange={(e) => {
                setSecret(e.target.value);
              }}
            />
          </div>
          <button style={{ position: "relative", bottom: "15px !important" }} type="submit">Sign Up</button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/admin/dashboard"
          >
            Have an account? Sign in
          </a>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export const getServerSideProps = setup(async ({ req, res }) => {
  return { props: {} };
});

export default SignIn;
