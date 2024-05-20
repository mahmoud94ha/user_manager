import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
// import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { faCheck, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { faTimes, faUserTimes } from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";
import SearchIcon from "../UI/icons/search";
import ChatComp from "./chat";
import DeleteIcon from "../UI/icons/delete";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Dotsicon from "../UI/icons/dots";
import Popup from "reactjs-popup";
import LoadingAnimation from "../LoadingAnimation/animation";
import { CSSTransition } from "react-transition-group";

export default function AdminAssign({
  searchUserId,
  setSearchUserId,
  isDarkMode,
}) {
  const { data: session } = useSession();
  const [activeColumn, setActiveColumn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortAscending, setSortAscending] = useState(true);
  const [userTableData, setUserTableData] = useState([]);
  const [deleteButtonVisible, setDeleteButtonVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toolsVisibility, setToolsVisibility] = useState({});
  const [banPopupVisibility, setBanPopupVisibility] = useState({});
  const [chatPopupVisibility, setchatPopupVisibility] = useState({});
  const [tableContentClassName, setTableContentClassName] = useState("fade-in");
  const toolsRef = useRef(null);
  const [userCount, setUserCount] = useState(0);
  const [apiParms, setApiParms] = useState({
    userId: "",
    onlyAccounts: true,
  });

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/admin/getUser");
      setUserTableData(response.data);
      const userLength = response.data.length;
      setUserCount(userLength);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    if (searchUserId) {
      setSearchQuery(searchUserId);
      setSearchUserId(null);
    }
  }, []);

  const handleTabClick = (tab) => {
    setTableContentClassName("fade-out");
    setTimeout(() => {
      setActiveTab(tab);
      setTableContentClassName("fade-in");
    }, 100);
  };

  const handleCheckboxClick = (rowId) => {
    setSelectAll(false);
    setSelectedRows((prevSelectedRows) => {
      const updatedSelectedRows = {
        ...prevSelectedRows,
        [rowId]: !prevSelectedRows[rowId],
      };

      Object.keys(updatedSelectedRows).forEach((id) => {
        if (!updatedSelectedRows[id]) {
          delete updatedSelectedRows[id];
        }
      });

      const updatedSelectedData = Object.keys(updatedSelectedRows).map((id) =>
        parseInt(id, 10)
      );
      setDeleteButtonVisible(updatedSelectedData.length > 1);

      return updatedSelectedRows;
    });
  };

  const handleSelectAll = () => {
    const updatedSelectAll = !selectAll;
    setSelectAll(updatedSelectAll);

    const updatedSelectedRows = {};
    filteredTableData.forEach((item) => {
      updatedSelectedRows[item.id] = updatedSelectAll;
    });

    const updatedSelectedData = updatedSelectAll
      ? filteredTableData.map((item) => item.id)
      : [];

    setDeleteButtonVisible(updatedSelectedData.length > 0);
    setSelectedRows(updatedSelectedRows);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${text} copied to clipboard`, { autoClose: 500 });
    });
  };

  const handleSortByAccounts = () => {
    setActiveColumn("accounts");
    const sortedData = [...userTableData];
    sortedData.sort((a, b) => {
      const aAccounts = 0;
      const bAccounts = 0;

      const order = sortAscending ? 1 : -1;
      return order * (bAccounts - aAccounts);
    });
    setUserTableData(sortedData);
    setSortAscending((prevSortAscending) => !prevSortAscending);
  };

  const handleSort = (column) => {
    if (column === "accounts") {
      handleSortByAccounts();
    } else {
      if (activeColumn === column) {
        setSortAscending((prevSortAscending) => !prevSortAscending);
      } else {
        setActiveColumn(column);
        setSortAscending(true);
      }
    }
  };

  const getSortedData = () => {
    if (!Array.isArray(userTableData)) {
      toast.warning("Invalid data");
      return [];
    }

    const sortedData = [...userTableData];
    if (activeColumn) {
      sortedData.sort((a, b) => {
        let aValue = a[activeColumn];
        let bValue = b[activeColumn];

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortAscending ? -1 : 1;
        if (aValue > bValue) return sortAscending ? 1 : -1;

        return 0;
      });
    }
    return sortedData;
  };

  const sortedTableData = getSortedData();

  const handleToggleTools = (rowId, event) => {
    event.stopPropagation();

    setToolsVisibility((prevVisibility) => {
      const updatedVisibility = {};
      updatedVisibility[rowId] = !prevVisibility[rowId];
      return updatedVisibility;
    });
  };

  const handleCancelBanPopup = () => {
    setBanPopupVisibility({});
    setToolsVisibility({});
  };

  const handleClickOutside = (event) => {
    const isOutside =
      !event.target.closest(".table_data") &&
      !event.target.closest(".userOptions");

    if (isOutside) {
      setToolsVisibility({});
      setBanPopupVisibility({});
      setchatPopupVisibility({});
    }
  };

  useEffect(() => {
    document.body.addEventListener("click", handleClickOutside);
    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, []);


  const handleToggleBanPopup = (rowId) => {
    setBanPopupVisibility((prevVisibility) => {
      const updatedVisibility = {};
      updatedVisibility[rowId] = !prevVisibility[rowId];

      if (updatedVisibility[rowId]) {
        setApiParms({
          ...apiParms,
          userId: rowId,
        });
      } else {
        setSelectedData([]);
        setToolsVisibility({});
      }

      return updatedVisibility;
    });
  };

  const handleToggleChatPopup = (rowId) => {
    setchatPopupVisibility((prevVisibility) => {
      const updatedVisibility = {};
      updatedVisibility[rowId] = !prevVisibility[rowId];

      if (updatedVisibility[rowId]) {
      } else {
        setSelectedData([]);
        setToolsVisibility({});
      }
      return updatedVisibility;
    });
  };

  const getFilteredTableData = () => {
    switch (activeTab) {
      case "noAccounts":
        return sortedTableData.filter((item) => 0 === 0);
      case "haveAccounts":
        return sortedTableData.filter((item) => 0 > 0);
      case "all":
      default:
        return sortedTableData.filter((item) =>
          Object.values(item).some(
            (value) =>
              typeof value === "string" &&
              value.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
    }
  };

  const filteredTableData = getFilteredTableData();


  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.post("/api/admin/deleteUser", { userId });

      if (response.status === 200) {
        toast.success("User deleted successfully");
        handleCancelBanPopup();
        fetchUserData();
        setSelectedRows((prevSelectedRows) => {
          const updatedSelectedRows = { ...prevSelectedRows };
          delete updatedSelectedRows[userId];
          return updatedSelectedRows;
        });
        setDeleteButtonVisible(selectedRows.length > 1);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while processing the request");
      }
    }
  };

  const handleDeleteUsers = async () => {
    const selectedUserIds = Object.keys(selectedRows);

    if (selectedUserIds.length === 0) {
      toast.warning("Please select at least one user to delete.");
      return;
    }

    try {
      const response = await axios.post("/api/admin/deleteUsers", {
        userIds: selectedUserIds,
      });

      if (response.status === 200) {
        toast.success("Users deleted successfully");
        handleCancelBanPopup();
        fetchUserData();
        setSelectedRows({});
        setDeleteButtonVisible(selectedRows.length > 1);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while processing the request");
      }
    }
  };

  useEffect(() => {
    setUserCount(filteredTableData.length);
  }, [filteredTableData]);

  useEffect(() => {
    if (userTableData.length > 0) {
      handleSort("accounts");
    }
  }, [loading]);


  if (loading) {
    return (
      <div>
        <LoadingAnimation className={`LoadingDiv fl_col`} />
      </div>
    );
  }

  return (
    <div id="AdminAssignTable">
      <div className="ToolsBar fl_row jc_s ai_c">
        <div className="SearchTable fl_row jc_s ai_c">
          <div className="fl_row search__">
            <SearchIcon></SearchIcon>
            <input
              type="text"
              placeholder={`Search Users (${userCount})`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <CSSTransition
          in={deleteButtonVisible}
          timeout={250}
          classNames="delete-button"
          unmountOnExit
        >
          <div className="delete-button" onClick={handleDeleteUsers}>
            <DeleteIcon />
          </div>
        </CSSTransition>
      </div>
      <div className="Table">
        <div className="TableHeader fl_row ai_c">
          <div
            className={activeTab === "all" ? "active_tab" : ""}
            onClick={() => handleTabClick("all")}
          >
            All
          </div>
          <div className="data-count">
            <Tooltip title="Total Users">
              <p
                className={
                  tableContentClassName === "fade-out" ? "loading" : ""
                }
              >
                <FontAwesomeIcon
                  icon={faUser}
                  className="antialiased-icon"
                  style={{
                    color: userCount === 0 ? "red" : "green",
                    marginRight: "5px",
                  }}
                />
                {userCount}
              </p>
            </Tooltip>
          </div>
        </div>
        <div className={`TableContent fl_col ${tableContentClassName}`}>
          <div className="table_titles fl_row ai_c">
            <div className="selectAll" id="checkbox">
              <input
                type="checkbox"
                name=""
                id=""
                onChange={handleSelectAll}
                checked={selectAll}
              />
            </div>
            <div id="id_col" onClick={() => handleSort("id")}>
              <p>ID</p>
              {activeColumn === "id" && (
                <i
                  className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                    }`}
                ></i>
              )}
            </div>
            <div id="name_col" onClick={() => handleSort("name")}>
              <p>Name</p>
              {activeColumn === "name" && (
                <i
                  className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                    }`}
                ></i>
              )}
            </div>
            <div id="email_col" onClick={() => handleSort("email")}>
              <p>Email</p>
              {activeColumn === "email" && (
                <i
                  className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                    }`}
                ></i>
              )}
            </div>
            <div id="password_col" onClick={() => handleSort("plainPassword")}>
              <p>Password</p>
              {activeColumn === "plainPassword" && (
                <i
                  className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                    }`}
                ></i>
              )}
            </div>
            <div id="role_col" onClick={() => handleSort("role")}>
              <p>Role</p>
              {activeColumn === "role" && (
                <i
                  className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                    }`}
                ></i>
              )}
            </div>
          </div>
          {filteredTableData.length === 0 ? (
            <p
              style={{ textAlign: "center", padding: "20px", fontSize: "14px" }}
            >
              No results found
            </p>
          ) : (
            filteredTableData.map((item) => {
              return (
                <div
                  className="table_data fl_row ai_c"
                  key={item.id}
                  onClick={() => handleCheckboxClick(item.id)}
                >
                  <div id="checkbox">
                    <input
                      type="checkbox"
                      name=""
                      id=""
                      onChange={() => { }}
                      checked={selectedRows[item.id] || false}
                    />
                  </div>
                  <div
                    id="id_col"
                    onClick={() => handleCopyToClipboard(item.id)}
                  >
                    <p className="truncate" style={{ maxWidth: "25ch" }}>
                      {item.id}
                    </p>
                  </div>
                  <div
                    id="name_col"
                    onClick={() => handleCopyToClipboard(item.name)}
                  >
                    <p>{item.name}</p>
                  </div>
                  <div
                    id="email_col"
                    onClick={() => handleCopyToClipboard(item.email)}
                  >
                    <p className="truncate" style={{ maxWidth: "35ch" }}>
                      {item.email}
                    </p>
                  </div>
                  <div
                    id="password_col"
                    onClick={() => handleCopyToClipboard(item.plainPassword)}
                  >
                    <p className="truncate" style={{ maxWidth: "25ch" }}>
                      {item.plainPassword}
                    </p>
                  </div>
                  <div
                    id="role_col"
                    onClick={() => handleCopyToClipboard(item.role)}
                  >
                    <p>{item.role}</p>
                  </div>
                  <div className="userOptions" ref={toolsRef}>
                    <div
                      className="dots"
                      onClick={(event) => handleToggleTools(item.id, event)}
                    >
                      <Dotsicon></Dotsicon>
                    </div>
                    <CSSTransition
                      in={toolsVisibility[item.id]}
                      timeout={300}
                      classNames="tools-dropdown"
                      unmountOnExit
                    >
                      <div className="tools">

                        <div>
                          <p onClick={() => handleToggleChatPopup(item.id)}>
                            Message
                          </p>
                          <Popup
                            closeOnDocumentClick={false}
                            trigger={null}
                            position="left center"
                            contentStyle={{
                              width: "50vw",
                              height: "800px",
                              position: "fixed",
                              backgroundColor: "orange !important",
                              left: "25%",
                              top: "15%",
                              transform: "translate(-50%, -50%)",
                            }}
                            onClose={() => handleToggleChatPopup(item.id)}
                            open={chatPopupVisibility[item.id]}
                          >
                            <ChatComp userId={item.id} userName={item.name} />
                          </Popup>
                        </div>
                        <div>
                          <p onClick={() => handleToggleBanPopup(item.id)}>
                            Remove
                          </p>
                          <Popup
                            closeOnDocumentClick={false}
                            trigger={null}
                            position="left center"
                            contentStyle={{
                              width: "20vw",
                              height: "300px",
                              position: "fixed",
                              backgroundColor: "orange !important",
                              left: "40%",
                              top: "30%",
                              transform: "translate(-50%, -50%)",
                            }}
                            onClose={() => handleToggleBanPopup(item.id)}
                            open={banPopupVisibility[item.id]}
                          >
                            <div className="ConfirmationPopup">
                              <div>
                                Are you certain you wish to proceed with
                                removing the user <span>@{item?.name} ?</span>
                              </div>
                              <div className="fl_row">
                                <button
                                  className="cancel"
                                  onClick={handleCancelBanPopup}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="ban"
                                  onClick={() => handleDeleteUser(item.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </Popup>
                        </div>
                      </div>
                    </CSSTransition>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <ToastContainer autoClose={700} />
    </div>
  );
}
