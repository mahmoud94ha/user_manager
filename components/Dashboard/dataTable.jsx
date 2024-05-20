import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import { CSSTransition } from "react-transition-group";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Popover, TextField } from "@material-ui/core";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  faCheck,
  faUserCheck,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faTimes, faUserTimes } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import OptionsIcon from "../UI/icons/options";
import ExportIcon from "../UI/icons/export";
import SearchIcon from "../UI/icons/search";
import DeleteIcon from "../UI/icons/delete";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Dotsicon from "../UI/icons/dots";
import Popup from "reactjs-popup";
import LoadingAnimation from "../LoadingAnimation/animation";

function dataTable({
  apiEndpoint,
  apiParms,
  onSelectedDataChange,
  tableData,
  setTableData,
  resetSignal,
  currentPage,
  setSearchUserId,
  MainSetActiveTab,
  openMessageModal,
  startSortedby,
}) {
  const { data: session } = useSession();
  const itemsPerPage = 100;
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const [showMorePressed, setShowMorePressed] = useState(false);
  const [toolsVisibility, setToolsVisibility] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeColumn, setActiveColumn] = useState(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [sortAscending, setSortAscending] = useState(true);
  const [tableContentVisible, setTableContentVisible] = useState(true);
  const [tableContentClassName, setTableContentClassName] = useState("fade-in");
  const [loading, setLoading] = useState(false);
  const [OfflineCount, setOfflineCount] = useState(0);
  const [OnlineCount, setOnlineCount] = useState(0);
  const [doneAccCounter, seDoneAccCounter] = useState(0);
  const [UnDoneAccCounter, seUnDoneAccCounter] = useState(0);
  const [DataCounts, setDataCounts] = useState(0);
  const [verifiedCount, setverifiedCount] = useState(0);
  const [notverifiedCount, setnotverifiedCount] = useState(0);
  const [deleteButtonVisible, setdeleteButtonVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [accountVerDate, setAccountVerDate] = useState(null);
  const [messagePopup, setMessagePopup] = useState(false);
  const [currDoneData, setCurrDoneData] = useState({
    name: null,
    message: null,
  });
  const [currentAccountBan, setCurrentAccountBan] = useState({
    id: null,
    ban: false,
  });
  const [currBanMessage, setBanMessage] = useState(null);
  const [banPopupOpen, setBanPopupOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [editPopupValue, setEditPopupValue] = useState({
    input: null,
    value: null,
  });
  const isUserAdmin = session?.user.role === "admin";

  const fetchData = async () => {
    try {
      const response = await axios.post(apiEndpoint, apiParms);
      setTableData(response.data);
      updateCounts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxClick = (rowId) => {
    setSelectedRows((prevSelectedRows) => {
      const updatedSelectedRows = {
        ...prevSelectedRows,
        [rowId]: !prevSelectedRows[rowId],
      };
      const selectedCount =
        Object.values(updatedSelectedRows).filter(Boolean).length;
      setSelectAll(selectedCount === filteredTableData.length);

      onSelectedDataChange(updatedSelectedRows);

      return updatedSelectedRows;
    });
  };

  const handleSelectAll = () => {
    const updatedSelectedRows = Object.fromEntries(
      tableData.map((item) => [item.id, !selectAll])
    );
    setSelectAll((prevSelectAll) => !prevSelectAll);
    setSelectedRows(updatedSelectedRows);
    onSelectedDataChange(updatedSelectedRows);
  };

  const deselectAllItems = () => {
    const updatedSelectedRows = { ...selectedRows };
    for (const key in updatedSelectedRows) {
      updatedSelectedRows[key] = false;
    }
    setSelectedRows(updatedSelectedRows);
    setSelectAll(false);
  };

  const exportSelectedUsers = () => {
    const selectedUserIds = Object.keys(selectedRows).filter(
      (userId) => selectedRows[userId]
    );

    if (selectedUserIds.length > 0) {
      const selectedUsersData = [];

      selectedUserIds.forEach((userId) => {
        const selectedUser = filteredTableData.find(
          (user) => user.id.toString() === userId.toString()
        );

        if (selectedUser) {
          selectedUsersData.push({
            id: selectedUser.id,
            username: selectedUser.username,
            email: selectedUser.email,
            ipAddress: selectedUser.ip,
            location: selectedUser.location,
            verified: selectedUser.verified,
            createdAt: selectedUser.createdAt,
            lastActive: selectedUser.online,
          });
        }
      });

      if (selectedUsersData.length > 0) {
        const jsonData = JSON.stringify(selectedUsersData, null, 2);

        const jsonBlob = new Blob([jsonData], {
          type: "application/json",
        });

        const url = URL.createObjectURL(jsonBlob);
        const a = document.createElement("a");
        const currentDateTime = new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
        const fileName = `um_data_${currentDateTime}.json`;
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
      } else {
        toast.warning("No data selected for export.");
      }
    } else {
      toast.warning("No data selected for export.");
    }
  };


  const handleCopyToClipboard = (event, text, message = "") => {
    if (!event.altKey && !event.ctrlKey) {
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          if (message) {
            toast.success(`${message} copied to clipboard`, { autoClose: 500 });
          } else {
            toast.success(`${text} copied to clipboard`, { autoClose: 500 });
          }
        });
      }
    }
  };

  const handleSort = (column) => {
    if (activeColumn === column) {
      setSortAscending((prevSortAscending) => !prevSortAscending);
    } else {
      setActiveColumn(column);
      setSortAscending(true);
    }
  };

  const parseDate = (dateString) => {
    return new Date(dateString);
  };

  const getSortedData = () => {
    if (!Array.isArray(tableData)) {
      toast.warning("Either user has no accounts or API returned invalid data");
      return [];
    }
    const sortedData = [...tableData];
    if (activeColumn) {
      sortedData.sort((a, b) => {
        let aValue = a[activeColumn];
        let bValue = b[activeColumn];

        if (aValue === null) aValue = "";
        if (bValue === null) bValue = "";

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (activeColumn === "createdAt" || activeColumn === "verifiedAt") {
          const dateA = parseDate(aValue);
          const dateB = parseDate(bValue);
          if (dateA > dateB) return sortAscending ? -1 : 1;
          if (dateA < dateB) return sortAscending ? 1 : -1;
        } else if (activeColumn === "status") {
          const valueA = aValue ? 1 : 0;
          const valueB = bValue ? 1 : 0;
          if (valueA > valueB) return sortAscending ? -1 : 1;
          if (valueA < valueB) return sortAscending ? 1 : -1;
        } else if (activeColumn === "verified") {
          const valueA = aValue ? 1 : 0;
          const valueB = bValue ? 1 : 0;
          if (valueA > valueB) return sortAscending ? -1 : 1;
          if (valueA < valueB) return sortAscending ? 1 : -1;
        } else {
          if (aValue < bValue) return sortAscending ? -1 : 1;
          if (aValue > bValue) return sortAscending ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedData;
  };

  const sortedTableData = getSortedData();

  const filteredTableData = sortedTableData.filter((item) => {
    if (searchQuery.startsWith("done:")) {
      const doneValue = searchQuery.slice(5).toLowerCase().trim();
      return doneValue === "true"
        ? item.verified === true
        : doneValue === "false"
          ? item.verified === false || item.verified === null
          : false;
    } else if (searchQuery.startsWith("user:")) {
      const doneValue = searchQuery.slice(5).toLowerCase().trim();
      if (item?.name) {
        return item.name.toLowerCase() === doneValue;
      }
    } else {
      return Object.values(item).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  });

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  const updateCounts = (data) => {
    const OfflineCount = data.filter((item) => !item.online).length;
    const OnlineCount = data.filter((item) => item.online).length;
    const verifiedCount = data.filter((item) => item.verified).length;
    const notverifiedCount = data.filter(
      (item) => !item.verified && !item.done
    ).length;
    const doneCount = data.filter((item) => item.banned).length;
    const undoneCount = data.filter((item) => !item.banned).length;

    setDataCounts(data.length);
    seDoneAccCounter(doneCount);
    seUnDoneAccCounter(undoneCount);
    setOfflineCount(OfflineCount);
    setOnlineCount(OnlineCount);
    setverifiedCount(verifiedCount);
    setnotverifiedCount(notverifiedCount);
  };

  const handleTabClick = (tabName, loading = true) => {
    setActiveTab(tabName);
    if (loading) {
      setTableContentClassName("fade-out");
    }
    deselectAllItems();
    setLoading(loading);

    axios
      .post(apiEndpoint, apiParms)
      .then((response) => {
        if (tabName === "All") {
          setTableData(response.data);
          updateCounts(response.data);
        } else {
          const filteredData = response.data.filter(
            (item) =>
              (tabName === "Offline" && !item.online) ||
              (tabName === "Online" && item.online) ||
              (tabName === "verified" && item.verified) ||
              (tabName === "notverified" && !item.verified) ||
              (tabName === "Done" && item.banned) ||
              (tabName === "UnDone" && !item.banned)
          );
          setTableData(filteredData);
        }
        setLoading(false);
        if (loading) {
          setTimeout(() => {
            setTableContentClassName("fade-in");
            setTableContentVisible(true);
          }, 300);
        }
      })
      .catch((error) => {
        toast.error("Error loading data from API");
        setLoading(false);
        setTableContentClassName("fade-in");
        setTableContentVisible(true);
        console.error(error);
      });
  };

  function formatDate(dateString) {
    const date = new Date(dateString);

    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";

    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    return `${month}/${day}/${year} at ${hours}:${minutes}${period}`;
  }

  const handleDeleteAccounts = async () => {
    const selectedAccountIds = Object.keys(selectedRows);

    if (selectedAccountIds.length === 0) {
      toast.warning("Please select at least one account to delete.");
      return;
    }

    try {
      const response = await axios.post("/api/admin/deleteAccounts", {
        accountIds: selectedAccountIds,
      });

      if (response.status === 200) {
        toast.success("Accounts deleted successfully");
        if (activeTab && activeTab !== "All") {
          handleTabClick(activeTab, false);
        } else {
          fetchData();
        }
        setSelectedRows({});
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while processing the request");
      }
    }
  };

  const handleBanButton = async (id, ban) => {
    if (!isUserAdmin && ban) {
      toast.warning("This acacount is already banned");
      return;
    }
    setCurrentAccountBan({ id: id, ban: ban });
    setToolsVisibility({});
    setBanPopupOpen(true);
  };

  const accountBanHandler = async () => {
    try {
      if (!currBanMessage) {
        toast.warning("Please fill in the ban message");
        return;
      }
      const response = await axios.post("/api/admin/banAccount", {
        accountId: currentAccountBan.id,
        banMessage: currBanMessage,
      });

      if (response.status === 200) {
        const secResponse = await axios.post(
          "/api/admin/banMessage",
          {
            accountId: currentAccountBan.id,
            banMessage: currBanMessage,
            by_user: session?.user.name
          }
        );
        if (secResponse.status === 200) {
          if (activeTab && activeTab !== "All") {
            handleTabClick(activeTab, false);
          } else {
            fetchData();
          }
          setBanPopupOpen(false);
          setSelectedRows({});
          toast.success("Account updated successfully");
        }
      } else {
        if (response.data.message) {
          toast.error(response.data.message);
        } else {
          toast.error("An error occurred while processing the request");
        }
      }
    } catch (error) {
      if (error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while processing the request");
      }
    } finally {
      setBanMessage(null);
    }
  };

  const accountUBANHandler = async () => {
    try {
      const response = await axios.post("/api/admin/banAccount", {
        accountId: currentAccountBan.id,
        admin_reset: true,
      });

      if (response.status === 200) {
        const secResponse = await axios.post(
          "/api/admin/banMessage",
          {
            accountId: currentAccountBan.id,
            by_user: session?.user.name,
            banMessage: "admin_reset",
          }
        );
        if (secResponse.status === 200) {
          if (activeTab && activeTab !== "All") {
            handleTabClick(activeTab, false);
          } else {
            fetchData();
          }
          setBanPopupOpen(false);
          setSelectedRows({});
          toast.success("Account updated successfully");
        }
      } else {
        if (response.data.message) {
          toast.error(response.data.message);
        } else {
          toast.error("An error occurred while processing the request");
        }
      }
    } catch (error) {
      if (error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while processing the request");
      }
    } finally {
      setBanMessage(null);
    }
  };

  const switchStatus = async (id, verified) => {
    setToolsVisibility({});
    try {
      const response = await axios.post("/api/user/setVerifiedStatus", {
        accountid: id,
        verified: verified,
      });

      if (response.status === 200) {
        toast.success("Account status changed");
        if (activeTab && activeTab !== "All") {
          handleTabClick(activeTab, false);
        } else {
          fetchData();
        }
        setSelectedRows({});
      } else {
        if (response.data.errors) {
          toast.error(response.data.errors.join(","));
        } else {
          toast.error("An error occurred while processing the request");
        }
      }
    } catch (error) {
      if (error.response.data.errors) {
        toast.error(error.response.data.errors.join(","));
      } else {
        toast.error("An error occurred while processing the request");
      }
    } finally {
      setConfirmationDialogOpen(false);
    }
  };

  useEffect(() => {
    if (resetSignal) {
      handleTabClick("All");
    }
  }, [resetSignal]);

  useEffect(() => {
    const selectedValues = Object.values(selectedRows);
    const checkedItemsCount = selectedValues.filter((value) => value).length;
    setdeleteButtonVisible(checkedItemsCount >= 1);
    setSelectedCount(checkedItemsCount);
  }, [selectedRows]);

  const openPopup = async (date, verified) => {
    if (!verified) {
      toast.warning("This account is not verified.");
      return;
    }
    try {
      setAccountVerDate(formatDate(date));
      setPopupOpen(true);
      toast.success("Account verified at " + formatDate(date));
    } catch (error) {
      console.error(error);
      toast.error("Error fetching user data. Please try again.");
    }
  };


  const closePopup = () => {
    setPopupOpen(false);
    setAccountVerDate(null);
  };

  const closeDonePopup = () => {
    setBanPopupOpen(false);
  };

  useEffect(() => {
    setDataCounts(filteredTableData.length);
  }, [filteredTableData]);

  useEffect(() => {
    if (startSortedby) {
      setActiveColumn(startSortedby);
    } else {
      handleSort("createdAt");
    }
  }, []);


  const handleToggleTools = (rowId, event) => {
    event.stopPropagation();

    setToolsVisibility((prevVisibility) => {
      const updatedVisibility = {};
      updatedVisibility[rowId] = !prevVisibility[rowId];
      return updatedVisibility;
    });
  };

  const handleClickOutside = (event) => {
    const isOutside =
      !event.target.closest(".table_data") &&
      !event.target.closest(".userOptions");

    if (isOutside) {
      setConfirmationDialogOpen(false);
      setToolsVisibility({});
    }
  };

  const openCurrMessageModal = (name, message) => {
    console.log(name, message);
    setCurrDoneData({ name: name, message: message });
    messagePopupOpen();
  };

  const messagePopupOpen = () => {
    setMessagePopup(true);
  };

  const messagePopupClose = () => {
    setToolsVisibility({});
    setMessagePopup(false);
  };

  const showMessageOnCtrlPlusClick = (event, user, message) => {
    if (event.ctrlKey && isUserAdmin && message) {
      openCurrMessageModal(user, message);
    }
  };

  const triggerEditItemValuePopup = (event, id, text, input) => {
    if (isUserAdmin && event.altKey) {
      setEditPopupValue({ id: id, input: input, value: text });
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditPopupChange = (event) => {
    setEditPopupValue({ ...editPopupValue, value: event.target.value });
    console.log(editPopupValue);
  };

  const openConfirmationDialog = () => {
    setConfirmationDialogOpen(true);
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialogOpen(false);
  };

  const handleConfirm = async () => {
    try {
      const response = await axios.post("/api/admin/updateAccountValues", {
        accountId: editPopupValue.id,
        field: editPopupValue.input,
        value: editPopupValue.value,
      });
      if (response.status === 200) {
        toast.success(`${editPopupValue.input} updated successfully`);
        if (activeTab && activeTab !== "All") {
          handleTabClick(activeTab, false);
        } else {
          fetchData();
        }
      } else {
        if (response.data.errors) {
          toast.error(response.data.errors.join(","));
        }
        toast.error("Error occurred while updating value");
      }
    } catch (error) {
      if (error.response.data.errors) {
        toast.error(error.response.data.errors.join(","));
      } else {
        toast.error("An error occurred while processing the request");
      }
      console.error("Error updating Account values:", error);
    }
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const hasverifiedAtField =
    Array.isArray(filteredTableData) &&
    filteredTableData.every((item) => "verifiedAt" in item);

  useEffect(() => {
    document.body.addEventListener("click", handleClickOutside);
    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const showMore = () => {
    setVisibleItems((prevVisibleItems) => prevVisibleItems + itemsPerPage);
    setShowMorePressed(true);
  };

  const ShowAll = () => {
    setVisibleItems(filteredTableData.length);
    setShowMorePressed(true);
  };

  const resetShow = () => {
    setVisibleItems(itemsPerPage);
    setShowMorePressed(false);
  };

  return (
    <div id="AccountsTable">
      <Button
        disabled={true}
        variant="contained"
        className="doneButton"
        style={{ display: 'none' }}
      >
        THIS IS TO MAKE NEXT COMPILE THIS UI ELEMENT, ANNOYING BUG
      </Button>
      {isUserAdmin && currentPage === "accounts" && (
        <Popup
          trigger={null}
          position="left center"
          contentStyle={{
            width: "30vw",
            height: "450px",
            position: "fixed",
            backgroundColor: "orange !important",
            left: "40%",
            top: "30%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClose={messagePopupClose}
          open={messagePopup}
        >
          {currDoneData.name ? (
            <div className="accountOwner">
              <div className="doneMessage">
                <p className="ownerName">{currDoneData.name}'s ban reason</p>
                <p className="doneMessage_p">{currDoneData.message}</p>
              </div>
            </div>
          ) : (
            <div className="accountOwner">
              <div className="doneMessage">
                <p className="ownerName">admin's ban reason</p>
                <p className="doneMessage_p">{currDoneData.message}</p>
              </div>
            </div>
          )}
        </Popup>
      )}
      {isUserAdmin && currentPage === "accounts" && (
        <Popup
          trigger={null}
          position="left center"
          contentStyle={{
            width: "30vw",
            height: "450px",
            position: "fixed",
            backgroundColor: "orange !important",
            left: "40%",
            top: "30%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClose={closePopup}
          open={popupOpen}
        >
          {accountVerDate && (
            <div className="accountOwner">
              <p className="assigned-to">Verified at:</p>
              <div className="acc-box">
                <p className="first-txt">Date</p>
                <p className="second-txt"> {accountVerDate}</p>
              </div>
            </div>
          )}
        </Popup>
      )}
      {currentPage === "accounts" && (
        <Popup
          trigger={null}
          position="left center"
          contentStyle={{
            width: "30vw",
            height: "450px",
            position: "fixed",
            backgroundColor: "orange !important",
            left: "40%",
            top: "30%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClose={closeDonePopup}
          open={banPopupOpen}
        >
          {currentAccountBan?.id && !currentAccountBan?.ban ? (
            <div className="accountOwner">
              <p className="assigned-to">Ban account?</p>
              {/* <p className="done_message_p">Fill in your message bellow:</p> */}
              <TextField
                label="Your ban reason here"
                InputLabelProps={{
                  style: { color: "#463b8d" },
                }}
                id="filled-basic"
                variant="filled"
                type="text"
                onChange={(e) => setBanMessage(e.target.value)}
                value={currBanMessage !== null ? currBanMessage : ""}
              />
              <Button
                variant="contained"
                className="doneButton"
                onClick={() => accountBanHandler()}
              >
                Confirm
              </Button>
            </div>
          ) : (
            <div className="accountOwner">
              <p className="assigned-to">Unban account?</p>
              <Button
                variant="contained"
                className="doneButton"
                onClick={() => accountUBANHandler()}
              >
                Confirm
              </Button>
            </div>
          )}
        </Popup>
      )}
      <div className="ToolsBar fl_row jc_s ai_c">
        <div className="SearchTable fl_row jc_s ai_c">
          <div className="fl_row search__">
            <SearchIcon></SearchIcon>
            <input
              type="text"
              placeholder={`Search Customers (${DataCounts})`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="SearchOptions fl_row jc_s ai_c">
            <OptionsIcon></OptionsIcon>
          </div>
        </div>
        {currentPage === "accounts" && (
          <div className="Export fl_row ai_c" onClick={exportSelectedUsers}>
            <ExportIcon></ExportIcon>
            <p>Export</p>
          </div>
        )}
        {isUserAdmin && currentPage === "accounts" && (
          <CSSTransition
            in={deleteButtonVisible}
            timeout={250}
            classNames="delete-button"
            unmountOnExit
          >
            <div className="delete-button" onClick={handleDeleteAccounts}>
              <DeleteIcon />
            </div>
          </CSSTransition>
        )}
      </div>
      <div className="Table">
        <div className="TableHeader fl_row ai_c">
          <div
            className={activeTab === "All" ? "active_tab" : ""}
            onClick={() => handleTabClick("All")}
          >
            <p>All</p>
          </div>
          {currentPage === "accounts" && (
            <>
              <div
                className={activeTab === "verified" ? "active_tab" : ""}
                onClick={() => handleTabClick("verified")}
              >
                <p>Verified</p>
              </div>
              <div
                className={activeTab === "notverified" ? "active_tab" : ""}
                onClick={() => handleTabClick("notverified")}
              >
                <p>Not Verified</p>
              </div>
            </>
          )}
          <div
            className={activeTab === "Online" ? "active_tab" : ""}
            onClick={() => handleTabClick("Online")}
          >
            <p>Online</p>
          </div>
          <div
            className={activeTab === "Offline" ? "active_tab" : ""}
            onClick={() => handleTabClick("Offline")}
          >
            <p>Offline</p>
          </div>
          <div
            className={activeTab === "Done" ? "active_tab" : ""}
            onClick={() => handleTabClick("Done")}
          >
            <p>Banned</p>
          </div>
          <div
            className={activeTab === "UnDone" ? "active_tab" : ""}
            onClick={() => handleTabClick("UnDone")}
          >
            <p>Not banned</p>
          </div>
          <div className="data-count">
            <Tooltip title="Total Accounts Number">
              <p
                className={
                  loading || tableContentClassName === "fade-out"
                    ? "loading"
                    : ""
                }
              >
                <FontAwesomeIcon
                  icon={faCircle}
                  className="antialiased-icon"
                  style={{
                    color: DataCounts === 0 ? "#e0595d" : "green",
                    marginRight: "5px",
                  }}
                />
                {loading ? "..." : DataCounts}
              </p>
            </Tooltip>

            <Tooltip title="Accounts Offline">
              <p
                className={
                  loading || tableContentClassName === "fade-out"
                    ? "loading"
                    : ""
                }
              >
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="antialiased-icon"
                  style={{
                    color: "#e0595d",
                    marginRight: "5px",
                  }}
                />
                {loading ? "..." : OfflineCount}
              </p>
            </Tooltip>

            <Tooltip title="Accounts Online">
              <p
                className={
                  loading || tableContentClassName === "fade-out"
                    ? "loading"
                    : ""
                }
              >
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="antialiased-icon"
                  style={{
                    color: "green",
                    marginRight: "5px",
                  }}
                />
                {loading ? "..." : OnlineCount}
              </p>
            </Tooltip>

            {isUserAdmin && currentPage === "accounts" && (
              <>
                <div className="vertical-line"></div>

                <Tooltip title="Verified Accounts">
                  <p
                    className={
                      loading || tableContentClassName === "fade-out"
                        ? "loading"
                        : ""
                    }
                  >
                    <FontAwesomeIcon
                      icon={faUserCheck}
                      className="antialiased-icon"
                      style={{
                        color: verifiedCount === 0 ? "#e0595d" : "green",
                        marginRight: "5px",
                      }}
                    />
                    {loading ? "..." : verifiedCount}
                  </p>
                </Tooltip>

                <Tooltip title="Not Verified Accounts">
                  <p
                    className={
                      loading || tableContentClassName === "fade-out"
                        ? "loading"
                        : ""
                    }
                  >
                    <FontAwesomeIcon
                      icon={faUserTimes}
                      className="antialiased-icon"
                      style={{
                        color: "#e0595d",
                        marginRight: "5px",
                      }}
                    />
                    {loading ? "..." : notverifiedCount}
                  </p>
                </Tooltip>
              </>
            )}
            <>
              <div className="vertical-line"></div>
              <Tooltip title="Banned Accounts">
                <p
                  className={
                    loading || tableContentClassName === "fade-out"
                      ? "loading"
                      : ""
                  }
                >
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="antialiased-icon"
                    style={{
                      color: "#e0595d",
                      marginRight: "5px",
                    }}
                  />
                  {loading ? "..." : doneAccCounter}
                </p>
              </Tooltip>
              <Tooltip title="Not banned Accounts">
                <p
                  className={
                    loading || tableContentClassName === "fade-out"
                      ? "loading"
                      : ""
                  }
                >
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="antialiased-icon"
                    style={{
                      color: "green",
                      marginRight: "5px",
                    }}
                  />
                  {loading ? "..." : UnDoneAccCounter}
                </p>
              </Tooltip>
            </>
          </div>
        </div>
        {loading ? (
          <LoadingAnimation className={`LoadingDiv fl_col`} />
        ) : (
          <div
            className={`TableContent fl_col ${tableContentClassName}`}
            style={{ display: tableContentVisible ? "" : "none" }}
          >
            <div className="table_titles fl_row ai_c">
              <div
                className="selectAll"
                id="checkbox"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  style={{ marginLeft: "", padding: "0" }}
                />
                <label
                  htmlFor="checkbox"
                  style={{
                    color: "black",
                    marginLeft: "30px",
                    position: "absolute",
                    cursor: "pointer",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      color: selectedCount > 0 ? "green" : "#4f499b",
                    }}
                  >
                    {selectedCount}
                  </p>
                </label>
              </div>
              <div
                id="id_col"
                className={activeColumn === "id" ? "active" : ""}
                onClick={() => handleSort("id")}
              >
                <p>ID</p>
                {activeColumn === "id" && (
                  <i
                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                  ></i>
                )}
              </div>
              <div
                id="username_col"
                className={activeColumn === "username" ? "active" : ""}
                onClick={() => handleSort("username")}
              >
                <p>UserName</p>
                {activeColumn === "username" && (
                  <i
                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                  ></i>
                )}
              </div>
              <div
                id="email_col"
                className={activeColumn === "email" ? "active" : ""}
                onClick={() => handleSort("email")}
              >
                <p>Email</p>
                {activeColumn === "email" && (
                  <i
                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                  ></i>
                )}
              </div>
              <div
                id="ip_col"
                className={activeColumn === "ip" ? "active" : ""}
                onClick={() => handleSort("ip")}
              >
                <p>IP</p>
                {activeColumn === "ip" && (
                  <i
                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                  ></i>
                )}
              </div>
              <div
                id="location_col"
                className={activeColumn === "location" ? "active" : ""}
                onClick={() => handleSort("location")}
                style={{ width: "12%" }}
              >
                <p>Location</p>
                {activeColumn === "location" && (
                  <i
                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                  ></i>
                )}
              </div>
              <div
                id="date_col"
                className={activeColumn === "createdAt" ? "active" : ""}
                onClick={() => handleSort("createdAt")}
              >
                <p>Create At</p>
                {activeColumn === "createdAt" && (
                  <i
                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                  ></i>
                )}
              </div>
              {currentPage === "users" && hasverifiedAtField && (
                <div
                  id="date_col"
                  className={activeColumn === "verifiedAt" ? "active" : ""}
                  onClick={() => handleSort("verifiedAt")}
                >
                  <p>Verified At</p>
                  {activeColumn === "verifiedAt" && (
                    <i
                      className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                        }`}
                    ></i>
                  )}
                </div>
              )}
              <div
                id="status"
                className={activeColumn === "status" ? "active" : ""}
                onClick={() => handleSort("status")}
              >
                <p>Status</p>
                {activeColumn === "status" && (
                  <i
                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                  ></i>
                )}
              </div>
              {currentPage === "users" && (
                <div id="assigned" className="assigned-hover" />
              )}
              {isUserAdmin && currentPage === "accounts" && (
                <div
                  id="assigned"
                  className={activeColumn === "verified" ? "active" : ""}
                  onClick={() => handleSort("verified")}
                >
                  <p>Verified?</p>
                  {activeColumn === "verified" && (
                    <i
                      className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                        }`}
                    ></i>
                  )}
                </div>
              )}
              {isUserAdmin && currentPage === "accounts" && (
                <div id="switch">
                  <p></p>
                </div>
              )}
            </div>
            {filteredTableData.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                  fontSize: "14px",
                }}
              >
                No results found
              </p>
            ) : (
              <>
                {filteredTableData.slice(0, visibleItems).map((item) => (
                  <div
                    className={`table_data fl_row ai_c ${item.online
                      ? "Online"
                      : "Offline"
                      } ${item.banned ? "itembanned" : ""}`}
                    style={{
                      backgroundColor: item.banned
                        ? "#CC0000"
                        : "",
                      borderRadius: item.banned ? "8px" : "",
                    }}
                    key={item.id}
                    onClick={(e) =>
                      showMessageOnCtrlPlusClick(
                        e,
                        item.by_user,
                        item.banMessage
                      )
                    }
                  >
                    <div
                      id="checkbox"
                      onClick={() => handleCheckboxClick(item.id)}
                    >
                      <input
                        type="checkbox"
                        name=""
                        id=""
                        checked={selectedRows[item.id] || false}
                        onChange={() => { }}
                      />
                    </div>
                    <div
                      id="id_col"
                      onClick={(e) => handleCopyToClipboard(e, item.id)}
                    >
                      <p>{item.id}</p>
                    </div>
                    <div
                      id="username_col"
                      onClick={(e) => {
                        handleCopyToClipboard(e, item.username);
                        triggerEditItemValuePopup(
                          e,
                          item.id,
                          item.username,
                          "username"
                        );
                      }}
                    >
                      <p
                        className="truncate"
                        style={{
                          maxWidth: "25ch",
                          color: item?.username ? "" : "#e0595d",
                        }}
                      >
                        {item.username ? item.username : "Null"}
                      </p>
                    </div>
                    <div
                      id="email_col"
                      onClick={(e) => {
                        handleCopyToClipboard(e, item.email);
                        triggerEditItemValuePopup(
                          e,
                          item.id,
                          item.email,
                          "email"
                        );
                      }}
                    >
                      <p
                        className="truncate"
                        style={{
                          maxWidth: "25ch",
                          color: item?.email ? "" : "#e0595d",
                        }}
                      >
                        {item.email ? item.email : "Null"}
                      </p>
                    </div>
                    <div
                      id="ip_col"
                      onClick={(e) => {
                        handleCopyToClipboard(e, item.ip);
                        triggerEditItemValuePopup(e, item.id, item.ip, "ip");
                      }}
                    >
                      <p className="truncate">{item.ip}</p>
                    </div>
                    <div
                      id="location_col"
                      style={{ width: "12%" }}
                      onClick={(e) => {
                        handleCopyToClipboard(e, item.location);
                        triggerEditItemValuePopup(
                          e,
                          item.id,
                          item.location,
                          "location"
                        );
                      }}
                    >
                      <p
                        className="truncate"
                        style={{
                          color: item?.location ? "" : "#e0595d",
                          maxWidth: "16ch",
                        }}
                      >
                        {item?.location ? item.location : "Null"}
                      </p>
                    </div>
                    <div id="date_col">
                      <p>{formatDate(item.createdAt)}</p>
                    </div>
                    {currentPage === "users" && item?.verifiedAt && (
                      <div id="date_col">
                        <p>{formatDate(item?.verifiedAt)}</p>
                      </div>
                    )}

                    <div
                      id="status"
                    >
                      <p id="table-value">
                        {item.online
                          ? "Online"
                          : "Offline"}
                      </p>
                    </div>
                    {isUserAdmin && currentPage === "accounts" && (
                      <div
                        id="assigned"
                        className="assigned-hover"
                        {...(activeColumn === "assigned" ? "active" : "")}
                        {...(isUserAdmin &&
                          currentPage === "accounts" && {
                          onClick: () => openPopup(item?.verifiedAt, item?.verified),
                        })}
                      >
                        <FontAwesomeIcon
                          icon={item?.verified ? faCheck : faTimes}
                          className="antialiased-icon"
                          style={{
                            color: item?.verified ? "green" : "#e0595d",
                            marginRight: "5px",
                          }}
                        />
                      </div>
                    )}
                    {currentPage === "accounts" && (
                      <div className="userOptions" id="switch" ref={null}>
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

                            <>
                              <div>
                                <p onClick={() => openConfirmationDialog()}>
                                  Verified
                                </p>
                                <Dialog
                                  open={confirmationDialogOpen}
                                  onClose={closeConfirmationDialog}
                                  aria-labelledby="confirmation-dialog-title"
                                  aria-describedby="confirmation-dialog-description"
                                >
                                  <DialogTitle id="confirmation-dialog-title">
                                    Confirm verified Status Change
                                  </DialogTitle>
                                  <DialogContent>
                                    <DialogContentText id="confirmation-dialog-description">
                                      Are you sure you want to switch the
                                      verified status?
                                    </DialogContentText>
                                  </DialogContent>
                                  <DialogActions>
                                    <Button
                                      onClick={closeConfirmationDialog}
                                      color="secondary"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        switchStatus(item.id, item.verified)
                                      }
                                      color="primary"
                                    >
                                      Confirm
                                    </Button>
                                  </DialogActions>
                                </Dialog>
                              </div>
                              {item.done && (
                                <div>
                                  <p
                                    onClick={() =>
                                      openCurrMessageModal(
                                        item.by_user,
                                        item.banMessage
                                      )
                                    }
                                  >
                                    Message
                                  </p>
                                </div>
                              )}
                            </>

                            <div>
                              <p
                                onClick={() =>
                                  handleBanButton(item.id, item.banned)
                                }
                              >
                                Ban
                              </p>
                            </div>
                            {item.banned && (
                              <div>
                                <p
                                  onClick={(e) =>
                                    openCurrMessageModal(item.by_user, item.banMessage)
                                  }
                                >
                                  Ban Message
                                </p>
                              </div>
                            )}
                            {/* <div>
                            <p onClick={() => handleDeleteAccount(item.id)}>
                              Remove
                            </p>
                          </div> */}
                          </div>
                        </CSSTransition>
                      </div>
                    )}
                    {currentPage === "users" && item.done ? (
                      <div
                        id="assigned"
                        className="assigned-hover"
                        onClick={() =>
                          openMessageModal(
                            item.by_user,
                            item.doneMessage
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={faMessage}
                          className="antialiased-icon"
                          style={{
                            color: "green",
                            marginRight: "5px",
                          }}
                        />
                      </div>
                    ) : (
                      currentPage === "users" && (
                        <div id="assigned" className="assigned-hover"></div>
                      )
                    )}
                  </div>
                ))}
                {filteredTableData.length > visibleItems ? (
                  <div className="showMoreLess">
                    <p className="showingText">
                      Showing {visibleItems} accounts
                    </p>
                    <button onClick={showMore}>Show More</button>
                    <button onClick={ShowAll}>Show All</button>
                  </div>
                ) : (
                  visibleItems >= 100 &&
                  showMorePressed && (
                    <div className="showMoreLess">
                      <p className="showingText">
                        Showing {visibleItems} accounts
                      </p>
                      <button onClick={resetShow}>Reset</button>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        )}
      </div>
      {currentPage === "accounts" && isUserAdmin && (
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <div style={{ padding: "16px", minWidth: "200px" }}>
            <TextField
              label={`Edit ${editPopupValue?.input} value`}
              value={editPopupValue?.value}
              onChange={handleEditPopupChange}
              fullWidth
              InputLabelProps={{
                style: { color: "black" },
              }}
            />
            <div style={{ marginTop: "16px" }}>
              <Button
                color="primary"
                variant="contained"
                style={{
                  borderRadius: "5px",
                }}
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </div>
          </div>
        </Popover>
      )}
    </div>
  );
}

export default dataTable;
