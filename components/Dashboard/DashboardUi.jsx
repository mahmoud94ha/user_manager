import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Tooltip from "@mui/material/Tooltip";
import { useRouter } from "next/router";
import { CSSTransition } from "react-transition-group";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from "react-toastify";
import { useSession, signOut } from "next-auth/react";
import UserLogo from "../UI/icons/userLogo";
import HomeIcon from "../UI/icons/home";
import SupportIcon from "../UI/icons/support";
import DataBaseIcon from "../UI/icons/database";
import SettingsIcon from "../UI/icons/settings";
import UsersIcon from "../UI/icons/users";
import AdminIcon from "../UI/icons/admin";
import ShapeHeader from "../UI/icons/shapeHeader";
import AccountsList from "./AccountsList";
import AdminAssign from "./AdminAssign";
import SupportTickets from "./SupportTickets"
import Settings from "./Settings";
import Home from "./Home";
import NavigationItem from "./NavigationItem";
import GenerateAccount from "./GenerateAccounts";
import GenerateUserIcon from "../UI/icons/generateUserIcon";
import Head from "next/head";

let socket;

const tabs = [
  { id: "home", icon: <HomeIcon />, label: "Home", roles: ["user", "admin"] },
  {
    id: "customers",
    icon: <UsersIcon />,
    label: "Customers",
    roles: ["user", "admin"],
    headTitle: "Customers - UM",
  },
  {
    id: "dash_users",
    icon: <DataBaseIcon />,
    label: "Users",
    roles: ["admin"],
    headTitle: "User Managment - UM",
  },
  {
    id: "support_tickets",
    icon: <SupportIcon />,
    label: "Tickets",
    roles: ["admin"],
    headTitle: "Support tickets - UM",
  },
  {
    id: "generateAccount",
    icon: <GenerateUserIcon />,
    label: "Generator",
    roles: ["admin"],
    headTitle: "Account Generator - UM",
  },
  {
    id: "settings",
    icon: <SettingsIcon />,
    label: "Settings",
    roles: ["admin"],
    headTitle: "App Settings - UM",
  },
];

const tabComponents = {
  home: (props) => <Home {...props} />,
  customers: (props) => <AccountsList {...props} />,
  dash_users: (props) => <AdminAssign {...props} />,
  support_tickets: (props) => <SupportTickets {...props} />,
  settings: (props) => <Settings {...props} />,
  generateAccount: (props) => <GenerateAccount {...props} />,
};

function DashboardUi() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notiSenderID, setnotiSenderID] = useState(null);
  const [activeTab, MainSetActiveTab] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [DarkModeToggle, setDarkModeToggle] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchUserId, setSearchUserId] = useState(null);

  useEffect(() => {
    socketInitializer();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [session]);


  async function socketInitializer() {
    await fetch("/api/socket");
    socket = io();

    socket.on("connect", () => {
      console.log("Connected to socket server");
      if (session?.user?.id) {
        socket.emit("join-room", session.user.id);
      }
    });

    socket.on("receive-message", (data) => {
      if (data.receiverId === session.user.id) {
        const truncatedContent = data.content.length > 15 ? `${data.content.substring(0, 15)}...` : data.content;
        toast.info(`New message from ${data.senderName}: ${truncatedContent}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClick: () => {
            MainSetActiveTab("dash_users");
            setnotiSenderID(data.senderId);
        }
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });
  }

  useEffect(() => {
    const selectedTabId = router.query.tab;
    const selectedTab = tabs.find((tab) => tab.id === selectedTabId);
    if (
      selectedTab &&
      (!selectedTab.roles || selectedTab.roles.includes(session?.user.role))
    ) {
      MainSetActiveTab(selectedTabId);
    } else {
      router.push("/admin/dashboard?tab=home");
    }
  }, [router.query.tab, session?.user.role]);

  const handleTabClick = (tabId) => {
    const selectedTab = tabs.find((tab) => tab.id === tabId);
    if (selectedTab) {
      MainSetActiveTab(tabId);
    }
    setSearchUserId(null);
    router.push(`/admin/dashboard?tab=${tabId}`);
  };

  const handleMouseEnter = () => {
    setIsMenuVisible(true);
  };

  const handleMouseLeave = () => {
    setIsMenuVisible(false);
  };

  useEffect(() => {
    import("react-dark-mode-toggle-2").then((module) => {
      const { DarkModeToggle } = module;
      setDarkModeToggle(DarkModeToggle);
    });
  }, []);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode) {
      setIsDarkMode(JSON.parse(storedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <>
      <Head>
        <title>
          {tabs.find((tab) => tab.id === activeTab)?.headTitle ||
            "Dashboard - UM"}
        </title>
      </Head>
      <section id="Dashboard" className={isDarkMode ? "dark-theme" : ""}>
        <ShapeHeader />
        <div className="dashboard_nav fl_col">
          <Tooltip title="Go to home page">
            <div
              className="navHeader fl_row ai_c"
              style={{ cursor: "pointer" }}
              onClick={() => (window.location.href = "/")}
            >
              <UserLogo />
              <p>USER MANAGER</p>
            </div>
          </Tooltip>
          <div className="navList fl_col">
            {tabs
              .filter(
                (tab) => !tab.roles || tab.roles.includes(session?.user.role)
              )
              .map((tab) => (
                <NavigationItem
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  icon={tab.icon}
                  label={tab.label}
                />
              ))}
          </div>
        </div>
        <div className="dashboard_data">
          <div className="data_header fl_row ai_c jc_s">
            <p>Welcome back @{session?.user.name} !</p>
            <div
              className="adminAccount"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <AdminIcon />
              {DarkModeToggle && (
                <DarkModeToggle
                  onChange={setIsDarkMode}
                  isDarkMode={isDarkMode}
                />
              )}
              <CSSTransition
                in={isMenuVisible}
                timeout={300}
                classNames="menu"
                unmountOnExit
              >
                <div className="adminMenu">
                  <p
                    onClick={() => signOut({ callbackUrl: "/admin/dashboard" })}
                  >
                    <FontAwesomeIcon
                      className="signOut-dash"
                      icon={faSignOutAlt}
                    />
                    Sign Out
                  </p>
                </div>
              </CSSTransition>
            </div>
          </div>
          <div className="CurrentDataPreview">
            {tabComponents[activeTab]({
              session,
              searchUserId,
              setSearchUserId,
              MainSetActiveTab,
              isDarkMode,
              notiSenderID,
              setnotiSenderID
            })}
          </div>
          <ToastContainer autoClose={700} />
        </div>
      </section>
    </>
  );
}

export default DashboardUi;
