import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import SearchIcon from "../UI/icons/search";
import DeleteIcon from "../UI/icons/delete";
import { Button, Popover, TextField } from "@material-ui/core";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Dotsicon from "../UI/icons/dots";
import Popup from "reactjs-popup";
import { CSSTransition } from "react-transition-group";

export default function SupportRequests() {
    const [supportRequests, setSupportRequests] = useState([]);
    const [activeColumn, setActiveColumn] = useState(null);
    const [deleteButtonVisible, setDeleteButtonVisible] = useState(false);
    const [selectedRows, setSelectedRows] = useState({});
    const [sortAscending, setSortAscending] = useState(true);
    const [banPopupVisibility, setBanPopupVisibility] = useState({});
    const [toolsVisibility, setToolsVisibility] = useState({});
    const [popupOpen, setPopupOpen] = useState(false);
    const toolsRef = useRef(null);
    const [activeTab, setActiveTab] = useState("all");
    const [userCount, setUserCount] = useState(0);
    const [selectAll, setSelectAll] = useState(false);
    const [tableContentClassName, setTableContentClassName] = useState("fade-in");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentTicket, setcurrentTicket] = useState({
        id: null,
        email: null,
        reply: null,
        by_user: null,
    });
    const [currReplyMessage, setReplyMessage] = useState(null);
    const [replyPopup, setreplyPopup] = useState(false);

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

    const fetchSupportRequests = async () => {
        try {
            const response = await axios.get("/api/admin/getSupportRequests");
            setUserCount(response.data.length);
            setSupportRequests(response.data);
            handleSort("createdAt")
        } catch (error) {
            console.error("Error fetching support requests:", error);
        }
    };

    const handleDeleteTickets = async () => {
        const selectedUserIds = Object.keys(selectedRows);
        console.log(selectedUserIds)

        if (selectedUserIds.length === 0) {
            toast.warning("Please select at least one ticket to delete.");
            return;
        }

        try {
            const response = await axios.post("/api/admin/deleteTickets", {
                ticketIds: selectedUserIds,
            });

            if (response.status === 200) {
                toast.success("Tickets deleted successfully");
                handleCancelBanPopup();
                fetchSupportRequests();
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

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        axios
            .get("/api/admin/getSupportRequests")
            .then((response) => {
                if (tabName === "all") {
                    setSupportRequests(response.data);
                    setUserCount(response.data.length);
                } else {
                    const filteredData = response.data.filter(
                        (item) =>
                            (tabName === "replied" && item.replyMessage) ||
                            (tabName === "Waiting" && item.replyMessage === null)
                    );
                    setSupportRequests(filteredData);
                    setUserCount(filteredData.length);
                }
            })
            .catch((error) => {
                toast.error("Error loading data from API");
                setTableContentClassName("fade-in");
                console.error(error);
            });
    };

    useEffect(() => {
        fetchSupportRequests();
    }, []);

    const handleSort = (column) => {
        if (activeColumn === column) {
            setSortAscending((prevSortAscending) => !prevSortAscending);
        } else {
            setActiveColumn(column);
            setSortAscending(true);
        }
    };

    const handleCancelBanPopup = () => {
        setBanPopupVisibility({});
        setToolsVisibility({});
    };

    const handleToggleTools = (rowId, event) => {
        event.stopPropagation();

        setToolsVisibility((prevVisibility) => {
            const updatedVisibility = {};
            updatedVisibility[rowId] = !prevVisibility[rowId];
            return updatedVisibility;
        });
    };

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${text} copied to clipboard`, { autoClose: 500 });
        });
    };

    const handleToggleBanPopup = (rowId) => {
        setBanPopupVisibility((prevVisibility) => {
            const updatedVisibility = {};
            updatedVisibility[rowId] = !prevVisibility[rowId];

            if (updatedVisibility[rowId]) {
                console.log(updatedVisibility[rowId]);
            } else {
                setSelectedData([]);
                setToolsVisibility({});
            }

            return updatedVisibility;
        });
    };

    const handleDeleteTicket = async (ticketId) => {
        try {
            const response = await axios.post("/api/admin/deleteTicket", { ticketId });

            if (response.status === 200) {
                toast.success("Ticket deleted successfully");
                handleCancelBanPopup();
                fetchSupportRequests();
                setSelectedRows((prevSelectedRows) => {
                    const updatedSelectedRows = { ...prevSelectedRows };
                    delete updatedSelectedRows[0];
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

    const parseDate = (dateString) => {
        return new Date(dateString);
    };

    const getSortedData = () => {
        if (!Array.isArray(supportRequests)) {
            toast.warning("Invalid data");
            return [];
        }

        const sortedData = [...supportRequests];
        if (activeColumn) {
            sortedData.sort((a, b) => {
                let aValue = a[activeColumn];
                let bValue = b[activeColumn];

                if (typeof aValue === "string" && typeof bValue === "string") {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (activeColumn === "createdAt" || activeColumn === "verifiedAt") {
                    const dateA = parseDate(aValue);
                    const dateB = parseDate(bValue);
                    if (dateA > dateB) return sortAscending ? -1 : 1;
                    if (dateA < dateB) return sortAscending ? 1 : -1;
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

    const handleBanButton = async (id, email, reply, by_user) => {
        setcurrentTicket({ id: id, email: email, reply: reply, by_user: by_user });
        setToolsVisibility({});
        setreplyPopup(true);
    };

    const ticketReplyHandler = async () => {
        try {
            if (!currReplyMessage) {
                toast.warning("Please fill in the ban message");
                return;
            }
            const response = await axios.post("/api/admin/replyToTicket", {
                email: currentTicket.email,
                replyMessage: currReplyMessage,
            });

            if (response.status === 200) {
                fetchSupportRequests();
                setreplyPopup(false);
                setSelectedRows({});
                toast.success("Replied successfully");
            } else {
                if (response.data.message) {
                    toast.error(response.data.message);
                } else {
                    toast.error("An error occurred while processing the request");
                }
            }
        } catch (error) {
            if (error) {
                toast.error(error);
            } else {
                toast.error("An error occurred while processing the request");
            }
        } finally {
            setReplyMessage(null);
        }
    };

    const [currTicketMessage, setcurrTicketMessage] = useState(null);

    const openPopup = async (message) => {
        try {
            setcurrTicketMessage(message);
            setPopupOpen(true);
        } catch (error) {
            console.error(error);
            toast.error("Error fetching ticket data. Please try again.");
        }
    };

    const closePopup = () => {
        setPopupOpen(false);
        setcurrTicketMessage(null);
    };

    return (
        <div id="AdminAssignTable">
            <Popup
                trigger={null}
                position="left center"
                contentStyle={{
                    width: "30vw",
                    height: "450px",
                    position: "fixed",
                    backgroundColor: "white !important",
                    left: "40%",
                    top: "30%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onClose={() => setreplyPopup(false)}
                open={replyPopup}
            >
                {currentTicket?.id && !currentTicket.reply ? (
                    <div className="accountOwner">
                        <p className="assigned-to">Reply to ticket!</p>
                        <TextField
                            label="Your reply here..."
                            InputLabelProps={{
                                style: { color: "#463b8d" },
                            }}
                            id="filled-basic"
                            variant="filled"
                            type="text"
                            onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            className="doneButton"
                            onClick={() => ticketReplyHandler()}
                        >
                            Reply
                        </Button>
                    </div>
                ) : (
                    <div className="accountOwner">
                        <p className="assigned-to">Replied to by {currentTicket?.by_user}:</p>
                        <div className="acc-box" style={{
                            maxWidth: '100%',
                            width: '100%',
                            minHeight: '100px',
                            maxHeight: '345px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            display: 'block',
                            border: '1px solid #ccc',
                            padding: '10px',
                            boxSizing: 'border-box'
                        }}>
                            <p className="second-txt" style={{
                                margin: '0',
                                padding: '0',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word'
                            }}>
                                {currentTicket?.reply}
                            </p>
                        </div>
                    </div>
                )}
            </Popup>
            <Popup
                trigger={null}
                position="left center"
                contentStyle={{
                    width: "30vw",
                    height: "450px",
                    position: "fixed",
                    backgroundColor: "white !important",
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
                {currTicketMessage && (
                    <div className="accountOwner">
                        <p className="assigned-to">Message:</p>
                        <div className="acc-box" style={{
                            maxWidth: '100%',
                            width: '100%',
                            minHeight: '100px',
                            maxHeight: '345px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            display: 'block',
                            border: '1px solid #ccc',
                            padding: '10px',
                            boxSizing: 'border-box'
                        }}>
                            <p className="second-txt" style={{
                                margin: '0',
                                padding: '0',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word'
                            }}>
                                {currTicketMessage}
                            </p>
                        </div>
                    </div>
                )}
            </Popup>
            <div className="ToolsBar fl_row jc_s ai_c">
                <div className="SearchTable fl_row jc_s ai_c">
                    <div className="fl_row search__">
                        <SearchIcon></SearchIcon>
                        <input
                            type="text"
                            placeholder={`Search Tickets (${userCount})`}
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
                    <div className="delete-button" onClick={handleDeleteTickets}>
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
                    <div
                        className={activeTab === "replied" ? "active_tab" : ""}
                        onClick={() => handleTabClick("replied")}
                    >
                        Replied
                    </div>
                    <div
                        className={activeTab === "Waiting" ? "active_tab" : ""}
                        onClick={() => handleTabClick("Waiting")}
                    >
                        Waiting
                    </div>
                    <div className="data-count">
                        <Tooltip title="Total Tickets">
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
                        <div id="id_col_sup" onClick={() => handleSort("id")}>
                            <p>ID</p>
                            {activeColumn === "id" && (
                                <i
                                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                                        }`}
                                ></i>
                            )}
                        </div>
                        <div id="email_col_sup" onClick={() => handleSort("accountEmail")}>
                            <p>Email</p>
                            {activeColumn === "accountEmail" && (
                                <i
                                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                                        }`}
                                ></i>
                            )}
                        </div>
                        <div id="subject_col" onClick={() => handleSort("subject")}>
                            <p>Subject</p>
                            {activeColumn === "subject" && (
                                <i
                                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                                        }`}
                                ></i>
                            )}
                        </div>

                        <div id="message_col" onClick={() => handleSort("message")}>
                            <p>Message</p>
                            {activeColumn === "message" && (
                                <i
                                    className={`icon-sort ${sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                                        }`}
                                ></i>
                            )}
                        </div>
                        <div id="date_col_sup" onClick={() => handleSort("createdAt")}>
                            <p>CreateAt</p>
                            {activeColumn === "createdAt" && (
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
                                    className={`table_data fl_row ai_c ${item.replyMessage ? "itembanned" : ""}`}
                                    style={{
                                        backgroundColor: item.replyMessage
                                            ? "#006400"
                                            : "",
                                        borderRadius: item.replyMessage ? "8px" : "",
                                    }}
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
                                        id="id_col_sup"
                                        onClick={() => handleCopyToClipboard(item.id)}
                                    >
                                        <p className="truncate" style={{ maxWidth: "25ch" }}>
                                            {item.id}
                                        </p>
                                    </div>
                                    <div
                                        id="email_col_sup"
                                        onClick={() => handleCopyToClipboard(item.accountEmail)}
                                    >
                                        <p className="truncate" style={{ maxWidth: "35ch" }}>
                                            {item.accountEmail}
                                        </p>
                                    </div>
                                    <div
                                        id="subject_col"
                                        onClick={() => handleCopyToClipboard(item.subject)}
                                    >
                                        <p className="truncate" style={{ maxWidth: "25ch" }}>
                                            {item.subject}
                                        </p>
                                    </div>
                                    <div
                                        id="message_col"
                                        onClick={() => openPopup(item?.message)}
                                    >
                                        <p className="truncate" style={{ maxWidth: "35ch" }}>{item.message}</p>
                                    </div>
                                    <div
                                        id="date_col_sup"
                                        onClick={() => handleCopyToClipboard(item.createdAt)}
                                    >
                                        <p className="truncate" style={{ maxWidth: "35ch" }}>{formatDate(item.createdAt)}</p>
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
                                                    <p
                                                        onClick={() =>
                                                            handleBanButton(item.id, item.accountEmail, item.replyMessage, item.repliedByUser)
                                                        }
                                                    >
                                                        {item.replyMessage ? "View Reply" : "reply"}
                                                    </p>
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
                                                            backgroundColor: "white !important",
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
                                                                removing support ticket?
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
                                                                    onClick={() => handleDeleteTicket(item.id)}
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
