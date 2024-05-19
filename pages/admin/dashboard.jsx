import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import useClientIP from '@lib/useClientIP';
import DashboardUi from "../../components/Dashboard/DashboardUi";
import LoadingAnimation from "../../components/LoadingAnimation/animation";
import DashboardIcon from "../../components/UI/icons/dashboard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

async function Dashboard() {
  const { data: session, status } = useSession();
  const clientIP = await useClientIP();
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [secret, setSecret] = useState("");
  const [isSecretCorrect, setIsSecretEntered] = useState(false);

  const checkAccount = async (email) => { // scraped code
    const apiEndpoint = "/api/auth/accChecker";
    try {
      const res = await axios.post(apiEndpoint, { email: email, re_c: clientIP });
    } catch (err) {
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get("error");
    if (error === "CredentialsSignin") {
      toast.error("Error signing in!");
    } else if (error?.includes("banned")) {
      toast.error(error);
    } else if (error) {
      toast.error(error);
    }
    setTimeout(() => {
      const urlWithoutError = window.location.href.split("?")[0];
      history.replaceState({}, document.title, urlWithoutError);
    }, 800);
  }, []);

  useEffect(() => {
    const storedKey = localStorage.getItem("Dkjzizjdu54s7z1e2scxaZAsd");

    if (storedKey) {
      checkKeyWithAPI(storedKey);
    }
  }, []);

  const checkKeyWithAPI = async (key) => {
    const apiEndpoint = "/api/auth/dash/keyChecker";

    try {
      const response = await axios.post(apiEndpoint, { secret: key });
      const { key: verifiedKey } = response.data;

      if (response.status === 200) {
        if (verifiedKey) {
          setIsSecretEntered(true);
        }
      } else {
        toast.error("An error occurred or key check failed");
      }
    } catch (error) {
      toast.error("An error occurred or key check failed");
      console.error("Error while checking stored key:", error);
    }
  };

  const handleSecretSubmit = async (event) => {
    event.preventDefault();
    const apiEndpoint = "/api/auth/dash/keyChecker";

    try {
      const response = await axios.post(apiEndpoint, { secret });
      const { key } = response.data;

      if (response.status === 200) {
        if (key) {
          localStorage.setItem("Dkjzizjdu54s7z1e2scxaZAsd", key);
          setIsSecretEntered(true);
        }
      } else {
        toast.error("An error occurred or key check failed");
      }
    } catch (error) {
      toast.error("An error occurred or key check failed");
      console.error("Error while processing secret:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      setDashboardVisible(true);
    }
  }, [status]);

  if (status === "loading") {
    return <LoadingAnimation />;
  }

  if (!isSecretCorrect) {
    return (
      <div id="AuthLogin">
        <div className="AuthWrapper">
          <div className="headerAuth fl_col">
            <DashboardIcon></DashboardIcon>
            <h2>Enter the secret to unlock:</h2>
          </div>
          <form className="fl_col" onSubmit={handleSecretSubmit}>
            <div className="fl_col inp_col">
              <input
                type="text"
                name="secret"
                placeholder="Enter the secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (status === "authenticated") {
    const isAdmin =
      (session?.user && session?.user.role === "admin") ||
      session?.user.role === "user";

    if (isAdmin) {
      return (
        <div className={dashboardVisible ? "fade-in" : ""}>
          <DashboardUi session={session}></DashboardUi>
        </div>
      );
    } else {
      return (
        <div id="AuthLogin">
        <div className="AuthWrapper" style={{height: "250px"}}>
          <p>You do not have permission to access this page.</p>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
        </div>
      );
    }
  } else {
    return (
      <div id="AuthLogin">
        <div className="AuthWrapper">
          <div className="headerAuth fl_col">
            <DashboardIcon></DashboardIcon>
            <h2>Sign in to the dashboard:</h2>
          </div>
          <form className="fl_col" onSubmit={handleSignIn}>
            <div className="fl_col inp_col">
              <input
                type="text"
                name="email"
                placeholder="Email"
                onChange={(e) => setEmailInput(e.target.value)}
                value={emailInput}
              />
            </div>
            <div className="fl_col inp_col">
              <input type="password" name="password" placeholder="Password" />
            </div>
            <button type="submit">Sign in</button>
          </form>
        </div>
        <ToastContainer />
      </div>
    );
  }

  function handleSignIn(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    // checkAccount(email); // scraped for now
    const returnUrl =
      new URLSearchParams(window.location.search).get("returnUrl") ||
      "/admin/dashboard";
    signIn("credentials", { email, password, callbackUrl: returnUrl });
  }
}

export default Dashboard;
