import React, { useEffect, useMemo, useState } from "react";
import "../Chat/Chat.css";

//Mui imports
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";

import { useDispatch, useSelector } from "react-redux";
import {
  allGroupMembers,
  allUsers,
  craeteGroup,
  editGroupInfo,
  editProfile,
  groupUsers,
  lastMessageOfAllUsers,
  lastSeenUsers,
  logout,
  mylastMessages,
  updateUserStatus,
} from "../../Redux/actions/userAction";
import toast from "react-hot-toast";
import Chatarea from "./Chatarea";
import axios from "axios";
import { server, serverSocket } from "../../Redux/store";
import { io } from "socket.io-client";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  CircularProgress,
  ClickAwayListener,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Modal,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import SearchIcon from "@mui/icons-material/Search";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ChatareaGroup from "./ChatareaGroup";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

import ClearIcon from '@mui/icons-material/Clear';
import v2Logo from "../../../src/v2logoor.png"


const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, error } = useSelector((state) => state.users);

  const lastSeenList = useSelector((state) => state.lastSeenUsers.users);

  const { userGroups } = useSelector((state) => state.usersGroup);

  const { loading } = useSelector((state) => state.createGroup);

  const user = useSelector((state) => state.profile.user);
  const loginUserId = user._id;

  const { lastMessages } = useSelector((state) => state.myLastMessageReducer);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserGroup, setSelectedUserGroup] = useState(null);

  const [senderId, setSenderId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [open, setOpen] = useState("");
  const [listMessages, setListMessages] = useState([]);
  const [listGroupMessages, setListGroupMessages] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserGroupId, setSelectedUserGroupId] = useState("");

  const [readMessages, setReadMessages] = useState({});
  const [openChatUser, setOpenChatUser] = useState(null);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [messageCounts, setMessageCounts] = useState({});
  const [messageGroupCounts, setMessageGroupCounts] = useState({});

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryUser, setSearchQueryUser] = useState("");

  // Stepper
  const [openModal, setOpenModal] = React.useState(false);
  const handleOpen = () => setOpenModal(true);
  const resetModalState = () => {
    setOpenModal(false);
    setActiveStep(0);
    setSkipped(new Set());
    setCheckedUsers([]);
  };

  const handleClose = () => {
    resetModalState();
  };

  const steps = [
    "Group Name",
    "Upload Group Avatar",
    "Select Group Members",
  ];

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [image, setImage] = useState("");
  const [checkedUsers, setCheckedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [craeteGroupImage, setCraeteGroupImage] = useState("");

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setCraeteGroupImage(file);
    };
  };

  const handleCheckboxChange = (event, userId) => {
    const checked = event.target.checked;
    setCheckedUsers((prevCheckedUsers) => {
      if (checked) {
        return [...prevCheckedUsers, userId];
      } else {
        return prevCheckedUsers.filter((id) => id !== userId);
      }
    });
  };


  const socket = io(`${serverSocket}`, {
    withCredentials: true,
  });

  const logoutHandler = () => {
    dispatch(updateUserStatus(new Date()));
    dispatch(logout());
  };

  const handleClick = () => {
    setOpen(!open);
  };

  useEffect(() => {
    dispatch(groupUsers());
  }, [dispatch, groupUsers])

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch({ type: "clearError" });
    } else if (!users || users.length === 0) {
      dispatch(allUsers());
    }
  }, [dispatch, error, users]);

  useEffect(() => {
    socket.on("connect", () => {
      // console.log('Socket.io connection opened');
    });

    //User's Socket
    socket.on("AddUser", (data) => {
      dispatch(allUsers());
    });

    socket.on("AddUser", (data) => {
      dispatch(editProfile());
    });

    socket.on("DeleteUser", (data) => {
      dispatch(allUsers());
    });


    //Group's Socket
    socket.on("AddGroup", (data) => {
      dispatch(groupUsers());
    });

    socket.on("AddGroup", (data) => {
      dispatch(editGroupInfo());
    });

    socket.on("DeleteGroup", (data) => {
      dispatch(groupUsers());
    });

    socket.on("disconnect", () => {
      // console.log('Socket.io connection closed');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, dispatch]);

  useEffect(() => {
    if (!userGroups || userGroups.length === 0) {
      dispatch(groupUsers());
    }
  }, [dispatch, groupUsers]);

  const handleUserSelect = (user) => {
    setSelectedUserGroupId("");
    setSelectedUser(user);
    setSelectedUserId(user._id);

    // Reset the message count to 0 for the selected user
    setMessageCounts((prevCounts) => ({
      ...prevCounts,
      [user._id]: 0,
    }));

    // Set the currently open chat user and reset the new message count
    setOpenChatUser(user);
    setNewMessageCount(0);
    receiveMessages();
  };

  const handleUserGroupSelect = (groupUser) => {
    setSelectedUserId("");
    setSelectedUserGroup(groupUser);
    setSelectedUserGroupId(groupUser._id);

    // Reset the message count to 0 for the selected user
    setMessageGroupCounts((prevCounts) => ({
      ...prevCounts,
      [groupUser._id]: 0,
    }));

    // Set the currently open chat user and reset the new message count
    setOpenChatUser(user);
    setNewMessageCount(0);
  };

  const receiveMessages = async () => {
    try {
      if(selectedUserId) {
        const response = await axios.get(`${server}/message/${selectedUserId}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
      }
    } catch (error) {
      console.error("Error fetching messages: ", error);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      // console.log('Socket.io connection opened');
    });

    socket.on("Messages", (data) => {
      setListMessages((item) => [...item, data]);
      receiveMessages();
      setSenderId(data.messageData.sender._id);

      if (data.messageData.receiver === loginUserId) {
        if (data.messageData.sender._id !== loginUserId) {
          setMessageCounts((prevCounts) => ({
            ...prevCounts,
            [data.messageData.sender._id]:
              (prevCounts[data.messageData.sender._id] || 0) + 1,
          }));
        }
      }
    });

    socket.on("disconnect", () => {
      // console.log('Socket.io connection closed');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, dispatch, loginUserId, messageCounts]);

  useEffect(() => {
    socket.on("connect", () => {
      // console.log('Socket.io connection opened');
    });

    socket.on("GroupMessages", (data) => {
      setListGroupMessages((item) => [...item, data]);

      if (data.groupMessage.sender._id !== loginUserId) {
        setMessageGroupCounts((prevCounts) => ({
          ...prevCounts,
          [data.groupMessage.groupId]:
            (prevCounts[data.groupMessage.groupId] || 0) + 1,
        }));
      }
    });

    socket.on("disconnect", () => {
      // console.log('Socket.io connection closed');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, dispatch, loginUserId, messageGroupCounts]);

  useEffect(() => {
    const savedMessageCounts =
      JSON.parse(localStorage.getItem("messageCounts")) || {};

    const filteredMessageCounts = Object.keys(savedMessageCounts).reduce(
      (result, key) => {
        if (savedMessageCounts[key] !== 0) {
          result[key] = savedMessageCounts[key];
        }
        return result;
      },
      {}
    );

    setMessageCounts(filteredMessageCounts);
  }, []);

  useEffect(() => {
    localStorage.setItem("messageCounts", JSON.stringify(messageCounts));
  }, [messageCounts]);

  useEffect(() => {
    const savedMessageGroupCounts =
      JSON.parse(localStorage.getItem("messageGroupCounts")) || {};

    const filteredMessageCounts = Object.keys(savedMessageGroupCounts).reduce(
      (result, key) => {
        if (savedMessageGroupCounts[key] !== 0) {
          result[key] = savedMessageGroupCounts[key];
        }
        return result;
      },
      {}
    );

    setMessageGroupCounts(filteredMessageCounts);
  }, []);

  useEffect(() => {
    dispatch(lastSeenUsers());
  }, [dispatch])


  useEffect(() => {
    localStorage.setItem(
      "messageGroupCounts",
      JSON.stringify(messageGroupCounts)
    );
  }, [messageGroupCounts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      // console.log('Socket.io connection opened');
    });

    socket.on("Lastseen", (data) => {
      dispatch(lastSeenUsers());
    });

    socket.on("disconnect", () => {
      // console.log('Socket.io connection closed');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, dispatch]);

  function convertTimeToCustomFormat(inputTime) {
    const date = new Date(inputTime);
    const currentTime = new Date();

    const timeDifferenceMilliseconds = currentTime - date;
    const timeDifferenceMinutes = Math.floor(
      timeDifferenceMilliseconds / (1000 * 60)
    );
    const timeDifferenceHours = Math.floor(timeDifferenceMinutes / 60);
    const timeDifferenceDays = Math.floor(timeDifferenceHours / 24);

    if (timeDifferenceDays > 0) {
      return `${timeDifferenceDays} days ago`;
    } else if (timeDifferenceHours > 0) {
      return `${timeDifferenceHours} hours ago`;
    } else if (timeDifferenceMinutes > 0) {
      return `${timeDifferenceMinutes} minutes ago`;
    } else {
      return "Just now";
    }
  }

  function removeHTMLStyling(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.body.textContent || "";
  }

  function getLastMessageForUser(userId) {
    const filteredMessages = listMessages.filter(
      (message) =>
        (message.messageData.receiver === loginUserId &&
          message.messageData.sender._id === userId) ||
        (message.messageData.receiver === userId &&
          message.messageData.sender._id === loginUserId)
    );

    if (filteredMessages.length > 0) {
      const lastMessage = filteredMessages[filteredMessages.length - 1];
      const isRead = readMessages[userId] || false;

      let text = lastMessage.messageData.text;
      let plainText = removeHTMLStyling(text);

      if (plainText.length > 10) {
        plainText = plainText.substring(0, 10) + "...";
      }

      if (isRead) {
        return {
          plainText,
          time: convertTimeToCustomFormat(lastMessage.messageData.createdAt),
          count: 0,
        };
      } else {
        return {
          plainText,
          time: convertTimeToCustomFormat(lastMessage.messageData.createdAt),
          count: filteredMessages.length,
        };
      }
    } else {
      const matchingItem = lastMessages.find((item) => {
        return (
          (item.lastMessage &&
            item.lastMessage.receiver._id === loginUserId &&
            item.lastMessage.sender._id === userId) ||
          (item.lastMessage &&
            item.lastMessage.receiver._id === userId &&
            item.lastMessage.sender._id === loginUserId)
        );
      });

      let text = (matchingItem && matchingItem.lastMessage.text) || "";
      let plainText = removeHTMLStyling(text);

      if (plainText.length > 10) {
        plainText = plainText.substring(0, 5) + "...";
      }

      if (matchingItem && matchingItem.lastMessage) {
        return {
          plainText,
          time: convertTimeToCustomFormat(matchingItem.lastMessage.createdAt),
          count: 0,
        };
      } else {
        return {
          plainText: "",
          count: 0,
        };
      }
    }
  }

  function getLastMessageForGroupUser(groupId) {
    const filteredMessages = listGroupMessages.filter(
      (message) =>
        message.groupMessage && message.groupMessage.groupId === groupId
    );

    if (filteredMessages.length > 0) {
      const lastMessage = filteredMessages[filteredMessages.length - 1];
      const isRead = readMessages[groupId] || false;

      let text = lastMessage.groupMessage.text;
      let plainText = removeHTMLStyling(text);

      if (plainText.length > 10) {
        plainText = plainText.substring(0, 10) + "...";
      }

      if (isRead) {
        return {
          plainText,
          time: convertTimeToCustomFormat(lastMessage.groupMessage.createdAt),
          count: 0,
        };
      } else {
        return {
          plainText,
          time: convertTimeToCustomFormat(lastMessage.groupMessage.createdAt),
          count: filteredMessages.length,
        };
      }
    } else {
      const matchingItem = lastMessages.find((item) => {
        return (
          item.lastGroupMessage && item.group._id === groupId
        );
      });

      let text = (matchingItem && matchingItem.lastGroupMessage.text) || "";
      let plainText = removeHTMLStyling(text);

      if (plainText.length > 10) {
        plainText = plainText.substring(0, 5) + "...";
      }

      if (matchingItem && matchingItem.lastGroupMessage) {
        return {
          plainText,
          time: convertTimeToCustomFormat(
            matchingItem.lastGroupMessage.createdAt
          ),
          count: 0,
        };
      } else {
        return {
          plainText: "",
          count: 0,
        };
      }
    }
  }

  const filteredDataListUser = useMemo(() => {
    let filteredDatas = users;
    if (searchQueryUser) {
      filteredDatas = filteredDatas.filter((searchList) => {
        // console.log(searchList);
        const lowercasedQuery = searchQueryUser.toLowerCase();
        if (searchList) {
          const userName = searchList.name;
          return userName.toLowerCase().includes(lowercasedQuery);
        }
      });
    }
    return filteredDatas;
  }, [searchQueryUser, users]);

  const handleClearSearchUser = () => {
    setSearchQueryUser("");
  }

  const lastReadMessage = async () => {
    dispatch(lastMessageOfAllUsers());
  };

  useEffect(() => {
    lastReadMessage();
  }, []);

  const userCountsWithTime = users.map((user) => {
    const lastMessage = getLastMessageForUser(user._id);
    return {
      user,
      count: lastMessage.count,
      time: lastMessage.time,
    };
  });

  userCountsWithTime.sort((a, b) => {
    const timeA = a.time;
    const timeB = b.time;

    function getTimeInMinutes(time) {
      if (!time) return Infinity;
      if (time.endsWith("now")) {
        return -1;
      } else if (time.endsWith("minutes ago")) {
        return parseInt(time);
      } else if (time.endsWith("hours ago")) {
        return parseInt(time) * 60;
      } else if (time.endsWith("days ago")) {
        return parseInt(time) * 60 * 24;
      } else {
        return Infinity;
      }
    }

    const timeInMinutesA = getTimeInMinutes(timeA);
    const timeInMinutesB = getTimeInMinutes(timeB);

    const countSort = b.count - a.count;

    if (countSort === 0) {
      return timeInMinutesA - timeInMinutesB;
    }
    return countSort;
  });

  const userGroupCountsWithTime = userGroups?.map((groupUser) => {
    const lastMessage = getLastMessageForGroupUser(groupUser._id);
    return {
      groupUser,
      count: lastMessage.count,
      time: lastMessage.time,
    };
  });

  userGroupCountsWithTime?.sort((a, b) => {
    const timeA = a.time;
    const timeB = b.time;

    function getTimeInMinutes(time) {
      if (!time) return Infinity;
      if (time.endsWith("now")) {
        return -1;
      } else if (time.endsWith("minutes ago")) {
        return parseInt(time);
      } else if (time.endsWith("hours ago")) {
        return parseInt(time) * 60;
      } else if (time.endsWith("days ago")) {
        return parseInt(time) * 60 * 24;
      } else {
        return Infinity;
      }
    }

    const timeInMinutesA = getTimeInMinutes(timeA);
    const timeInMinutesB = getTimeInMinutes(timeB);

    const countSort = b.count - a.count;

    if (countSort === 0) {
      return timeInMinutesA - timeInMinutesB;
    }
    return countSort;
  });

  const allUserCountsWithTime = [
    ...userCountsWithTime,
    ...(userGroupCountsWithTime || []),
  ];

  allUserCountsWithTime.sort((a, b) => {
    const timeA = a.time;
    const timeB = b.time;

    function getTimeInMinutes(time) {
      if (!time) return Infinity;
      if (time.endsWith("now")) {
        return -1;
      } else if (time.endsWith("minutes ago")) {
        return parseInt(time);
      } else if (time.endsWith("hours ago")) {
        return parseInt(time) * 60;
      } else if (time.endsWith("days ago")) {
        return parseInt(time) * 60 * 24;
      } else {
        return Infinity;
      }
    }

    const timeInMinutesA = getTimeInMinutes(timeA);
    const timeInMinutesB = getTimeInMinutes(timeB);

    const countSort = b.count - a.count;

    if (countSort === 0) {
      return timeInMinutesA - timeInMinutesB;
    }
    return countSort;
  });

  const filteredDataList = useMemo(() => {
    let filteredData = allUserCountsWithTime;

    if (searchQuery) {
      filteredData = filteredData.filter((searchList) => {
        const lowercasedQuery = searchQuery.toLowerCase();

        if (searchList.groupUser) {
          const groupName = searchList.groupUser.groupName;
          return groupName.toLowerCase().includes(lowercasedQuery);
        }

        if (searchList.user) {
          const userName = searchList.user.name;
          return userName.toLowerCase().includes(lowercasedQuery);
        }
      });
    }

    return filteredData;
  }, [searchQuery, allUserCountsWithTime]);


  useEffect(() => {
    dispatch(mylastMessages());
  }, []);

  const navigateToProfile = () => {
    navigate("/me");
  };

  const navigateToDashboard = () => {
    navigate("/admin/dashboard");
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const handleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const matches = useMediaQuery("(min-width: 781px) and (max-width: 2560px)");
  const matches1 = useMediaQuery("(min-width: 320px) and (max-width:780px)");

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  // const list = (anchor) => (
  //   <Box
  //     sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 300 }}
  //     role="presentation"
  //     onClick={toggleDrawer(anchor, false)}
  //     onKeyDown={toggleDrawer(anchor, false)}
  //   >
  //     <List>
  //       <div className={`${isDarkMode ? "dark-mode" : ""}`}>
  //         {userCountsWithTime.map(({ user }) => (
  //           <div
  //             className={`msg ${selectedUser === user ? "selected" : "online"}`}
  //             onClick={() => handleUserSelect(user)}
  //             key={user.id}
  //           >
  //             <img
  //               className="msg-profile"
  //               src={user.avatar.url}
  //               alt="Profile"
  //             />
  //             <div className="msg-detail">
  //               <div className="msg-username">{user.name}</div>
  //               <div className="msg-content">
  //                 <span
  //                   className={`msg-message ${isDarkMode ? "msgDarkMode" : ""}`}
  //                 >
  //                   {getLastMessageForUser(user._id).plainText}
  //                 </span>
  //                 {getLastMessageForUser(user._id).time && (
  //                   <span
  //                     className={`msg-date ${isDarkMode ? "msgDarkMode" : ""}`}
  //                   >
  //                     {getLastMessageForUser(user._id).time}
  //                   </span>
  //                 )}
  //                 {messageCounts[user._id] > 0 && (
  //                   <span className="msg-count">{messageCounts[user._id]}</span>
  //                 )}
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </List>
  //   </Box>
  // );

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 700,
    bgcolor: "background.paper",
    border: "none",
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
    maxHeight: "500px",
  };

  const isStepOptional = (step) => {
    return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleCreateGroup();
    } else {
      let newSkipped = skipped;
      if (isStepSkipped(activeStep)) {
        newSkipped = new Set(newSkipped.values());
        newSkipped.delete(activeStep);
      }

      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped(newSkipped);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleCreateGroup = () => {
    const myForm = new FormData();

    myForm.append("groupName", groupName);
    myForm.append("file", craeteGroupImage);

    checkedUsers.forEach((userId, index) => {
      myForm.append(`participants[${index}]`, userId);
    });


    dispatch(craeteGroup(myForm))
      .then((response) => {
        if (response.success === true) {
          handleClose();
          toast.success(response.message);
          dispatch(groupUsers());
          setGroupName("");
          setCraeteGroupImage("");
        }
      })
      .catch((error) => {
        toast.error(error);
        dispatch({ type: "clearError" });
      });
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }



  return (
    <>
      <div className={`app ${isDarkMode ? "dark-mode" : ""}`}>
        <div className={`header ${isDarkMode ? "dark-mode" : ""}`}>
          <div>
            {/* <h2 className="chatapp">Chat App</h2> */}
            <img className="headerLogo" src={v2Logo} alt="v2 header logo" />
          </div>
          <div className="themeProfile">
            <div>
              <IconButton
                sx={{ ml: 1 }}
                onClick={handleDarkMode}
                color="inherit"
              >
                {isDarkMode === true ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </div>
            <div className="mainDiv">
              <ClickAwayListener onClickAway={handleClickAway}>
                <List>
                  <div className="profileDiv">
                    <ListItemButton onClick={handleClick}>
                      <ListItemIcon>
                        <Avatar alt={user.name} src={user.avatar.url} />
                      </ListItemIcon>
                      <h2 className="profileName">{user.name}</h2>
                      {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </div>

                  <div className="settingDiv">
                    <Collapse 
                    in={open} 
                    timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        <ListItemButton
                          onClick={navigateToProfile}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText style={{ color: "black" }} primary="Profile" />
                        </ListItemButton>

                        {user.role === "admin" && (
                          <ListItemButton
                            onClick={navigateToDashboard}
                            sx={{ pl: 4 }}
                          >
                            <ListItemIcon>
                              <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText style={{ color: "black" }} primary="Dashboard" />
                          </ListItemButton>
                        )}

                        <ListItemButton onClick={logoutHandler} sx={{ pl: 4 }}>
                          <ListItemIcon>
                            <LogoutIcon />
                          </ListItemIcon>
                          <ListItemText style={{ color: "black" }} primary="Logout" />
                        </ListItemButton>
                      </List>
                    </Collapse>
                  </div>
                </List>
              </ClickAwayListener>
            </div>
          </div>
        </div>
        {matches && (
          <div className="wrapper">
            <div
              className={`conversation-area ${isDarkMode ? "dark-modes" : ""}`}
            >
              <div className="searchGroupDiv">
                <TextField
                  style={{ width: "85%", margin: "10px 0px 10px 10px" }}
                  id="search-field"
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  variant="standard"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" >
                        <SearchIcon
                          style={{ color: isDarkMode ? "white" : "black" }}
                        />
                      </InputAdornment>
                    ),
                    style: {
                      width: "80%",
                      backgroundColor: isDarkMode ? "black" : "white",
                      color: isDarkMode ? "white" : "black",
                      marginLeft: "15px",
                      borderBottom: "1px solid #94999f",
                    },
                    disableUnderline: true,
                  }}
                />

                <Tooltip title="Create Group">
                  <GroupAddIcon
                    style={{ cursor: "pointer" }}
                    onClick={handleOpen}
                  ></GroupAddIcon>
                </Tooltip>

                <Modal
                  open={openModal}
                  onClose={handleClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={style}>
                    <Stepper activeStep={activeStep}>
                      {steps.map((label, index) => {
                        const stepProps = {};
                        const labelProps = {};
                        if (isStepOptional(index)) {
                          labelProps.optional = (
                            <Typography variant="caption">Optional</Typography>
                          );
                        }
                        if (isStepSkipped(index)) {
                          stepProps.completed = false;
                        }
                        return (
                          <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                          </Step>
                        );
                      })}
                    </Stepper>
                    {activeStep === steps.length ? (
                      <React.Fragment>
                        <Typography sx={{ mt: 2, mb: 1 }}>
                          All steps completed - you&apos;re finished
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexDirection: "row", pt: 2 }}
                        >
                          <Box sx={{ flex: "1 1 auto" }} />
                          <Button onClick={handleReset}>Reset</Button>
                          <Button disabled={loading} onClick={handleCreateGroup}>
                            {loading ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              "Submit"
                            )}
                          </Button>
                        </Box>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        {activeStep === 0 ? (<><TextField style={{ margin: '20px 5px', width: "85%" }} id="standard-basic" label="Enter Group Name"
                          variant="standard" value={groupName} onChange={(e) => setGroupName(e.target.value)} /></>) :
                          (<>{activeStep === 1 ? (<>
                            <div className="groupAvatarDiv">
                              <div className="field" style={{ margin: '30px 5px', display: 'flex', alignItems: 'center' }}>
                                <input
                                  id="file"
                                  type={"file"}
                                  accept="image/*"
                                  onChange={changeImageHandler}
                                />
                              </div>
                              <div className="image-preview">
                                {craeteGroupImage && (
                                  <img src={URL.createObjectURL(craeteGroupImage)} alt="Preview" />
                                )}
                              </div>
                            </div></>) :
                            (
                              <>
                                <FormGroup style={{ margin: '20px 5px', maxHeight: "300px", overflow: "auto", display: "grid" }}>
                                  <TextField
                                    style={{ width: "80%", margin: "10px 0px 10px 10px" }}
                                    id="search-field"
                                    type="text"
                                    placeholder="Search"
                                    value={searchQueryUser}
                                    variant="standard"
                                    onChange={(e) => setSearchQueryUser(e.target.value)}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start" >
                                          <SearchIcon
                                            style={{ color: "black" }}
                                          />
                                        </InputAdornment>
                                      ),
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          {searchQueryUser && (
                                            <IconButton
                                              edge="end"
                                              onClick={handleClearSearchUser}
                                              style={{ color: 'black' }}
                                            >
                                              <ClearIcon />
                                            </IconButton>
                                          )}
                                        </InputAdornment>
                                      ),
                                      style: {
                                        width: "80%",
                                        backgroundColor: "white",
                                        color: "black",
                                        marginLeft: "15px",
                                        borderBottom: "1px solid #94999F",
                                      },
                                      disableUnderline: true,
                                    }}
                                  />
                                  {filteredDataListUser.map((user, index) => (
                                    <FormControlLabel
                                      key={index}
                                      control={
                                        <Checkbox
                                          checked={checkedUsers.includes(user._id)}
                                          onChange={(e) => handleCheckboxChange(e, user._id)}
                                          value={checkedUsers}
                                        />
                                      }
                                      label={<div style={{ display: 'flex', alignItems: 'center' }}><ListItemIcon>
                                        <Avatar alt={user.name} src={user.avatar.url} style={{ margin: '7px 5px' }} />
                                      </ListItemIcon>
                                        <Typography style={{ padding: '0px', margin: '0px', fontFamily: 'Manrope' }}>{capitalizeFirstLetter(user.name)}</Typography></div>}
                                    />
                                  ))}
                                </FormGroup>
                              </>
                            )
                          }</>)}
                        <Box
                          sx={{ display: "flex", flexDirection: "row", pt: 2 }}
                        >
                          {activeStep !== 0 && <Button
                            color="inherit"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                          >
                            Back
                          </Button>}
                          <Box sx={{ flex: "1 1 auto" }} />
                          {isStepOptional(activeStep) && (
                            <Button
                              color="inherit"
                              onClick={handleSkip}
                              sx={{ mr: 1 }}
                            >
                              Skip
                            </Button>
                          )}

                          <Button onClick={handleNext} disabled={
                            (activeStep === steps.length - 1 && checkedUsers.length <= 1) ||
                            (activeStep !== steps.length - 1 && !groupName)
                          }>
                            {activeStep === steps.length - 1
                              ?
                              (<>{loading ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                "Finish"
                              )}</>)
                              : "Next"}
                          </Button>
                        </Box>
                      </React.Fragment>
                    )}
                  </Box>
                </Modal>
              </div>

              {filteredDataList &&
                filteredDataList.map(({ user, groupUser }) => {
                  if (user) {

                    const lastSeenInfo = lastSeenList.find((seen) => seen._id === user._id);
                    const onlineClass = lastSeenInfo && lastSeenInfo.lastSeen === 'Online' && 'online';

                    return (
                      <div
                        className={`msg ${onlineClass}`}
                        onClick={() => handleUserSelect(user)}
                        key={user._id}
                      >
                        <img
                          className="msg-profile"
                          src={user.avatar.url}
                          alt="Profile"
                        />
                        <div className="msg-detail">
                          <div className="msg-username">{capitalizeFirstLetter(user.name)}</div>
                          <div className="msg-content">
                            <span
                              className={`msg-message ${isDarkMode ? "msgDarkMode" : ""
                                }`}
                            >
                              {getLastMessageForUser(user._id).plainText}
                            </span>
                            {getLastMessageForUser(user._id).time && (
                              <span
                                className={`msg-date ${isDarkMode ? "msgDarkMode" : ""
                                  }`}
                              >
                                {getLastMessageForUser(user._id).time}
                              </span>
                            )}
                            {messageCounts[user._id] > 0 && (
                              <span className="msg-count">
                                {messageCounts[user._id]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  } else if (groupUser) {
                    return (
                      <div
                        className={`msg`}
                        onClick={() => handleUserGroupSelect(groupUser)}
                        key={groupUser._id}
                      >
                        <img
                          className="msg-profile"
                          src={groupUser.groupAvatar.url}
                          alt="Profile"
                        />
                        <div className="msg-detail">
                          <div className="msg-username">
                            {capitalizeFirstLetter(groupUser.groupName)}
                          </div>
                          <div className="msg-content">
                            <span
                              className={`msg-message ${isDarkMode ? "msgDarkMode" : ""
                                }`}
                            >
                              {
                                getLastMessageForGroupUser(groupUser._id)
                                  .plainText
                              }
                            </span>
                            {getLastMessageForGroupUser(groupUser._id).time && (
                              <span
                                className={`msg-date ${isDarkMode ? "msgDarkMode" : ""
                                  }`}
                              >
                                {getLastMessageForGroupUser(groupUser._id).time}
                              </span>
                            )}
                            {messageGroupCounts[groupUser._id] > 0 && (
                              <span className="msg-count">
                                {messageGroupCounts[groupUser._id]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;

                })}
            </div>

            {/* {selectedUserId && (
              <Chatarea
                isDarkMode={isDarkMode}
                selectedUser={selectedUser}
                selectedUserId={selectedUserId}
              />
            )} */}

            {users.map((userId) => (
              userId._id === selectedUserId && (
                <Chatarea
                isDarkMode={isDarkMode}
                selectedUser={selectedUser}
                selectedUserId={selectedUserId}
                />
              )
            ))}

            {userGroups.map((allGroupId) => (
              allGroupId._id === selectedUserGroupId && (
                <ChatareaGroup
                  isDarkMode={isDarkMode}
                  selectedUserGroup={selectedUserGroup}
                  selectedUserGroupId={selectedUserGroupId}
                />
              )
            ))}

          </div>
        )}

        {/* {matches1 && (
          <>
            <div>
              {["left"].map((anchor) => (
                <React.Fragment key={anchor}>
                  <Button
                    onClick={toggleDrawer(anchor, true)}
                    className="hamburg"
                  >
                    <MenuIcon />
                  </Button>
                  <Drawer
                    anchor={anchor}
                    open={state[anchor]}
                    onClose={toggleDrawer(anchor, false)}
                  >
                    {list(anchor)}
                  </Drawer>
                </React.Fragment>
              ))}
            </div>
            {selectedUserId && (
              <Chatarea
                isDarkMode={isDarkMode}
                selectedUser={selectedUser}
                selectedUserId={selectedUserId}
              />
            )}
          </>
        )} */}
      </div>
    </>
  );
};

export default Chat;
