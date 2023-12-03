import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { styled, useTheme } from "@mui/material/styles";
import "./Chatarea.css";
import io from "socket.io-client";
import axios from "axios";
import { server, serverSocket } from "../../Redux/store";
import sendImage from "../../send-message.png";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Messages.css";

//Drawer Imports
import { Avatar, Box, Button, Checkbox, CircularProgress, ClickAwayListener, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, FormControlLabel, FormGroup, IconButton, InputAdornment, Modal, Switch, TextField, Tooltip, Typography } from "@mui/material";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CancelIcon from '@mui/icons-material/Cancel';
import { addGroupMember, allGroupMembers, deleteGroup, editGroupInfo, editGroupMember, groupAdminInfo, groupUsers, leaveGroup } from "../../Redux/actions/userAction";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from '@mui/icons-material/Clear';


const drawerWidth = 500;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

const ChatareaGroup = ({
  selectedUserGroup,
  selectedUserGroupId,
  isDarkMode,
}) => {
  const theme = useTheme();

  const socket = io(`${serverSocket}`, {
    withCredentials: true,
  });

  const loginUser = useSelector((state) => state.profile.user);

  const { users } = useSelector((state) => state.users);

  const { loading } = useSelector((state) => state.updateGroupMember);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const quillRef = useRef();
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleScroll = (event) => {
    const container = event.target;
    if (container.scrollTop >= 0) {
      setShowScrollButton(false);
    }
    if (container.scrollTop < 0) {
      setShowScrollButton(true);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
    setShowScrollButton(true);
  };

  function convertTimeToCustomFormat(inputTime) {
    const messageDate = new Date(inputTime);
    const currentDate = new Date();
    const isToday =
      messageDate.getDate() === currentDate.getDate() &&
      messageDate.getMonth() === currentDate.getMonth() &&
      messageDate.getFullYear() === currentDate.getFullYear();
    const options = { hour: "2-digit", minute: "2-digit" };
    if (isToday) {
      return messageDate.toLocaleTimeString(undefined, options);
    } else {
      return `${messageDate.toLocaleDateString()} ${messageDate.toLocaleTimeString(
        undefined,
        options
      )}`;
    }
  }

  function extractURLFromText(text) {
    const urlRegex = /(https?:\/\/[^\s<]*)/g;

    // Split the text into parts containing URLs and non-URLs
    const parts = text.split(urlRegex);

    // Process each part to create elements
    const elements = parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      } else {
        // Check if part contains HTML tags
        if (/<[^>]+>/.test(part)) {
          return (
            <span key={index} dangerouslySetInnerHTML={{ __html: part }} />
          );
        } else {
          return <span key={index}>{part}</span>;
        }
      }
    });

    return elements;
  }

  const [userMessages, setUserMessages] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [isConfirmationDialogOpenUpdate, setIsConfirmationDialogOpenUpdate] = useState(false);
  const [isConfirmationDialogOpenLeave, setIsConfirmationDialogOpenLeave] = useState(false);
  const [isConfirmationDialogOpenDelete, setIsConfirmationDialogOpenDelete] = useState(false);


  const [memberId, setMemberId] = useState('');

  const [messagess, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [loadings, setLoading] = useState(false);
  const [totalMessagePages, setTotalMessagePages] = useState(0);

  const [localUserGroup, setLocalUserGroup] = useState(selectedUserGroup);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.profile.user);

  const { userGroups } = useSelector((state) => state.usersGroup);

  const group = useSelector((state) => state.groupMemberReducer.group);

  const [particularGroupName, setParticularGroupName] = useState('');

  useEffect(() => {
    {userGroups.map((group) => {
      if (group._id === selectedUserGroupId) {
        setParticularGroupName(group.groupName);
      }
    })}
  }, [])

  const [groupName, setGroupName] = useState(particularGroupName);

  const { error } = useSelector((state) => state.updateGroupMember);

  const [text, setText] = useState("");
  const [showEditBtns, setShowEditBtns] = useState(false);


  //Edit Group Name & Group Photo
  const [image, setImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setGroupName(group.group?.groupName);
    setIsEditing(false);
  }, [group.group?.groupName]);

  const handleEditClick = () => {
    setIsEditing(true);
    setShowEditBtns(true);
  };

  const handleTextFieldChange = (event) => {
    if (isEditing) {
      setGroupName(event.target.value);
    }
  };

  const handleTextFieldBlur = () => {
    setIsEditing(false);
  };

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(file);
    };
  };
  const handleButtonClick = () => {
    setShowEditBtns(true);
    document.getElementById("file").click();
  };
  const discard = () => {
    setImage("");
    setIsEditing(false);
    setShowEditBtns(false);
  }


  const handleGroupInfoSave = () => {
    const myForm = new FormData();
    myForm.append("groupName", groupName);
    myForm.append("file", image);

    dispatch(editGroupInfo(myForm, selectedUserGroupId)).then((response) => {
      if (response.success === true) {
        toast.success(response.message);
        dispatch(allGroupMembers(selectedUserGroupId));
        dispatch(groupUsers());
        setImage("");
        setIsEditing(false);
        setShowEditBtns(false);
      }
    })
      .catch((error) => {
        dispatch({ type: "clearError" });
      });
  }


  //Modal
  const [openModal, setOpenModal] = React.useState(false);
  const [checkedUsers, setCheckedUsers] = useState([]);

  const handleOpen = () => setOpenModal(true);
  const resetModalState = () => {
    setOpenModal(false);
    setCheckedUsers([]);
  };
  const handleClose = () => {
    resetModalState();
  };


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
    maxHeight: "600px",
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

  const handleAddParticipants = () => {
    dispatch(addGroupMember(selectedUserGroupId, checkedUsers)).then((response) => {
      if (response.success === true) {
        handleClose();
        toast.success(response.message);
        dispatch(allGroupMembers(selectedUserGroupId));
        dispatch(groupUsers());
        setSearchQuery("")
      }
    }).catch(() => {
      console.log("Error:", error);
      // toast.error(error);
    })
  }

  const handleClearSearch = () => {
    setSearchQuery("");
  }


  // const handleEditorChange = (content, editor) => {
  //   setText(content);
  // };

  const handleEditorChange = (content, editor) => {
    // setText(content);
    setText((prevTextState) => ({
      ...prevTextState,
      [selectedUserGroupId]: {
        text: content,
        userId: selectedUserGroupId,
      },
    }));
  };


  const receiveMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${server}/message/group/${selectedUserGroupId}?page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      // const userMessages = response.data.groupMessages;
      // setUserMessages(userMessages);

      setTotalMessagePages(response.data.totalPages);
      const newMessages = response.data.groupMessages;
      setShowScrollButton(false);

      setMessages((prevMessages) => {
        const uniqueMessages =
          page === 1
            ? newMessages
            : [
              ...prevMessages,
              ...newMessages.filter(
                (newMessage) =>
                  !prevMessages.some(
                    (prevMessage) => prevMessage._id === newMessage._id
                  )
              ),
            ];
        return uniqueMessages;
      });
    } catch (error) {
      console.error("Error fetching messages: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (selectedUserGroupId && quillRef.current) {
      quillRef.current.focus();
    }
  }, [selectedUserGroupId]);

  useEffect(() => {
    receiveMessages();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedUserGroupId]);

  useEffect(() => {
    dispatch(groupUsers());
  }, [dispatch, groupUsers])

  useEffect(() => {
    receiveMessages();
  }, [selectedUserGroupId, text, page]);

  useEffect(() => {
    dispatch(allGroupMembers(selectedUserGroupId));
  }, [selectedUserGroupId, dispatch, allGroupMembers])

  useEffect(() => {
    socket.on("connect", () => {
      // console.log('Socket.io connection opened');
    });

    socket.on("GroupMessages", (data) => {
      if (data) {
        setPage(1);
        receiveMessages();
        scrollToBottom();
      }
    });

    // socket.on("disconnect", () => {
    //   // console.log('Socket.io connection closed');
    // });

    return () => {
      socket.disconnect();
    };
  }, [socket, dispatch, selectedUserGroupId]);

  useEffect(() => {
    socket.on("connect", () => {
      // console.log('Socket.io connection opened');
    });

    socket.on("AddGroup", (data) => {
      dispatch(allGroupMembers(selectedUserGroupId));
    });

    socket.on("AddGroup", (data) => {
      dispatch(editGroupMember(selectedUserGroupId));
    });

    socket.on("GroupLeave", (data) => {
      dispatch(allGroupMembers(selectedUserGroupId));
    });

    socket.on("GroupAdmin", (data) => {
      dispatch(allGroupMembers(selectedUserGroupId));
    });

    // socket.on("disconnect", () => {
    //   // console.log('Socket.io connection closed');
    // });

    return () => {
      socket.disconnect();
    };
  }, [socket, dispatch, localUserGroup, selectedUserGroupId]);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest(".emojis") && !e.target.closest(".emojiSetDiv")) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const filteredDataList = useMemo(() => {
    let filteredData = users;
    if (searchQuery) {
      filteredData = filteredData.filter((searchList) => {
        // console.log(searchList);
        const lowercasedQuery = searchQuery.toLowerCase();
        if (searchList) {
          const userName = searchList.name;
          return userName.toLowerCase().includes(lowercasedQuery);
        }
      });
    }
    return filteredData;
  }, [searchQuery, users]);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  // const sendMessages = async () => {
  //   const forbiddenTags = ["<ol></ol>", "<h1><br></h1>", "<ul></ul>"];
  //   const trimmedText = text.replace(/<p><br><\/p>|<li><br><\/li>/g, "");

  //   if (forbiddenTags.includes(trimmedText)) {
  //     toast.error("Please Enter Message !!");
  //   } else if (trimmedText.trim() === "") {
  //     toast.error("Please Enter Message !!");
  //   } else {
  //     const bodyData = {
  //       groupId: selectedUserGroupId,
  //       groupName: selectedUserGroup.groupName,
  //       text: trimmedText,
  //     };

  //     await axios
  //       .post(`${server}/send/message/group`, bodyData, {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         withCredentials: true,
  //       })
  //       .then((response) => {
  //         setPage(1);
  //         scrollToBottom();
  //         setText("");
  //       });
  //   }
  // };

  const sendMessages = async () => {
    const forbiddenTags = ["<ol></ol>", "<h1><br></h1>", "<ul></ul>"];

    // Check if selectedUserId exists in textState
    if (text[selectedUserGroupId]) {
      const trimmedText = text[selectedUserGroupId].text.replace(/<p><br><\/p>|<li><br><\/li>/g, "");

      if (forbiddenTags.includes(trimmedText)) {
        toast.error("Please Enter Message!!");
      } else if (trimmedText.trim() === "") {
        toast.error("Please Enter Message!!");
      } else {
        const bodyData = {
          groupId: selectedUserGroupId,
          groupName: selectedUserGroup.groupName,
          text: trimmedText,
        };

        await axios
          .post(`${server}/send/message/group`, bodyData, {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          })
          .then((response) => {
            setPage(1);
            scrollToBottom();
            setText((prevTextState) => ({
              ...prevTextState,
              [selectedUserGroupId]: {
                ...prevTextState[selectedUserGroupId],
                text: "",
              },
            }));
          });
      }
    } else {
      toast.error("User ID not found in textState");
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    sendMessages();
  };

  const handleEmojiSelect = (emoji) => {
    setText((prevText) => {
      const selectedUserText = prevText[selectedUserGroupId]?.text || '';
      const parser = new DOMParser();
      // const doc = parser.parseFromString(prevText, "text/html");
      const doc = parser.parseFromString(selectedUserText, 'text/html');

      const pTags = doc.querySelectorAll("p");
      const ulElements = doc.querySelectorAll("ul");
      const olElements = doc.querySelectorAll("ol");

      if (ulElements.length > 0 || olElements.length > 0) {
        const listElement =
          ulElements.length > 0
            ? ulElements[ulElements.length - 1]
            : olElements[olElements.length - 1];
        const liTags = listElement.querySelectorAll("li");

        let nearestLiTag = liTags[liTags.length - 1];

        const emojiSpan = document.createElement("span");
        emojiSpan.innerText = emoji.native;

        if (!nearestLiTag) {
          nearestLiTag = document.createElement("li");
          nearestLiTag.appendChild(emojiSpan);
          listElement.appendChild(nearestLiTag);
        } else {
          nearestLiTag.appendChild(emojiSpan);
        }
      } else if (pTags.length > 0) {
        let nearestPTag = pTags[pTags.length - 1];

        const emojiSpan = document.createElement("span");
        emojiSpan.innerText = emoji.native;

        nearestPTag.appendChild(emojiSpan);
      } else {
        const newPTag = document.createElement("p");
        newPTag.innerHTML = emoji.native;
        doc.body.appendChild(newPTag);
      }

      const updatedHTML = new XMLSerializer().serializeToString(doc);

      // return updatedHTML;
      return {
        ...prevText,
        [selectedUserGroupId]: {
          text: updatedHTML,
          userId: selectedUserGroupId,
        },
      };
    });
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevShowEmojiPicker) => !prevShowEmojiPicker);
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessages();
    }
  };

  //Drawer
  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const handleClickAway = () => {
    setOpen(false);
  };

  const handleLeaveMember = (memberId) => {
    const memberIdArray = Array.isArray(memberId) ? memberId : [memberId];
    dispatch(editGroupMember(selectedUserGroupId, memberIdArray)).then((response) => {
      if (response.success === true) {
        toast.success(response.message);
        dispatch(allGroupMembers(selectedUserGroupId));
      }
    }).catch(() => {
      console.log("Error:", error);
      toast.error(error);
    })
  };


  //Popup
  const handleListMember = (memberId) => {
    openConfirmationDialogUpdateMember(memberId);
    setMemberId(memberId);
  };

  const openConfirmationDialogUpdateMember = () => {
    setIsConfirmationDialogOpenUpdate(true);
  };

  const closeConfirmationDialogUpdateMember = () => {
    setIsConfirmationDialogOpenUpdate(false);
    setOpen(true);
  };

  const openConfirmationDialogLeave = () => {
    setIsConfirmationDialogOpenLeave(true);
  };

  const closeConfirmationDialogLeave = () => {
    setIsConfirmationDialogOpenLeave(false);
    setOpen(true);
  };

  const openConfirmationDialogDelete = () => {
    setIsConfirmationDialogOpenDelete(true);
  };

  const closeConfirmationDialogDelete = () => {
    setIsConfirmationDialogOpenDelete(false);
    setOpen(true);
  };

  const confirmGroupDelete = () => {
    dispatch(deleteGroup(selectedUserGroupId)).then((response) => {
      if (response.success === true) {
        toast.success(response.message);
        closeConfirmationDialogDelete();
        setOpen(false);
        dispatch(groupUsers());
      }
    }).catch(() => {
      console.log("Error:", error);
      // toast.error(error);
    })
  };

  const confirmDelete = () => {
    handleLeaveMember(memberId);
    closeConfirmationDialogUpdateMember();
  };

  const confirmLeave = async () => {
    dispatch(leaveGroup(selectedUserGroupId)).then((response) => {
      if (response.success === true) {
        toast.success(response.message);
        closeConfirmationDialogLeave();
        setOpen(false);
        dispatch(groupUsers())
      }
    }).catch(() => {
      console.log("Error:", error);
      // toast.error(error);
    })
  }

  //Switch Toggle
  const handleSwitch = async (event, memberId) => {
    setLocalUserGroup((prevUserGroup) => {
      const updatedUserGroup = { ...prevUserGroup };

      const isAdmin = updatedUserGroup.groupAdmin.includes(memberId);

      if (isAdmin) {
        updatedUserGroup.groupAdmin = updatedUserGroup.groupAdmin.filter(
          (id) => id !== memberId
        );
        dispatch(groupAdminInfo(selectedUserGroupId, memberId)).then((response) => {
          toast.success(response.message);
          dispatch(allGroupMembers(selectedUserGroupId));
          dispatch(groupUsers());
        }).catch((error) => {
          toast.error("You Can't Remove Your Self as Admin");
        })
      } else {
        updatedUserGroup.groupAdmin = [...updatedUserGroup.groupAdmin, memberId];
        dispatch(groupAdminInfo(selectedUserGroupId, memberId)).then((response) => {
          toast.success(response.message);
          dispatch(allGroupMembers(selectedUserGroupId));
          dispatch(groupUsers());
        }).catch((error) => {
          toast.error("Only group admin can perform this action");
        })
      }

      return updatedUserGroup;
    });
  };

  const sortedParticipants = group && group.group?.participants.slice().sort((a, b) => {
    if (a._id === loginUser._id) return 1;
    if (b._id === loginUser._id) return -1;
    return 0;
  });

  const getDate = (createdAt) => {
    const messageDate = new Date(createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return messageDate.toLocaleDateString(undefined, options);
    }
  };

  const groupedMessages = {};

  messagess
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((message) => {
      const messageDate = getDate(message.createdAt);

      if (!groupedMessages[messageDate]) {
        groupedMessages[messageDate] = [];
      }

      groupedMessages[messageDate].push(message);
    });



  return (
    <div className={`chat-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className={`chat-header ${isDarkMode ? "dark-modeHeader" : ""}`}>
        <div className="user-info" onClick={handleDrawerOpen}>
          {userGroups.map((group) => (
            <>
              {selectedUserGroupId === group._id &&
                <>
                  <img src={group.groupAvatar.url} alt="User Avatar" />
                  <h3>{capitalizeFirstLetter(group.groupName)}</h3>
                </>
              }
            </>
          ))}
          {/* <h3>{group.group?.groupName ? capitalizeFirstLetter(group.group.groupName) : ''}</h3> */}

        </div>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={handleDrawerOpen}
          style={{ marginRight: "20px" }}
          sx={{ ...(open && { display: "none" }) }}
        >
          <MenuIcon />
        </IconButton>
      </div>
      <div className="emojiSetDiv">
        {showEmojiPicker && (
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="dark" />
        )}
      </div>

      <div className={`messages-container ${isDarkMode ? "dark-mode" : "light-mode"}`}
        onScroll={handleScroll}
      >
        <div className="messages" ref={messagesContainerRef}>
          {Object.entries(groupedMessages).map(([date, messagesGroup]) => (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '30px 0px' }}>
                <p className="dateHeader">{date}</p>
              </div>
              {messagesGroup.map((message) => (
                <div
                  key={message._id}
                  className={`message ${message.sender !== null && user._id === message.sender._id ? "sent" : "received"
                    }`}
                >
                  <div>
                    <div>
                      <div className="msg-group">
                        {message.sender !== null ? (<img
                          className="msg-profile-group"
                          src={message.sender.avatar.url}
                          alt="Profile"
                        />) : (
                          <img
                            className="msg-profile-group"
                            src={process.env.REACT_APP_DEFAULT_IMAGE_USER}
                            alt="Profile"
                          />
                        )}

                        {message.sender !== null ? (<><p className="messageText">
                          {extractURLFromText(message.sender.name)}</p></>) : (<>
                            <p className="messageText" style={{ fontStyle: 'italic', fontSize: '12px' }}>Deleted User</p></>)}
                      </div>
                    </div>
                    <div className="groupText">
                      <p className="messageText">
                        {extractURLFromText(message.text)}
                      </p>
                      <p className="timeText">
                        {convertTimeToCustomFormat(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ))}
        </div>

        {!loadings && totalMessagePages !== page && totalMessagePages > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={handleLoadMore}
                disabled={loadings}
                style={{ cursor: "pointer" }}
              >
                Load More Messages
              </Button>
            </div>
          </div>
        )}
      </div>

      {
        showScrollButton && page > 2 && (
          <div
            className={`${isDarkMode ? "dark-modeScroll" : "light-modeScroll"}`}
            onScroll={handleScroll}
          >
            <div
              style={{
                display: "flex",
                width: "3%",
                backgroundColor: "#007BFF",
                justifyContent: "center",
                padding: "5px",
                borderRadius: "100%",
                margin: "10px 0px",
              }}
            >
              <ArrowDownwardIcon
                onClick={scrollToBottom}
                style={{ cursor: "pointer", color: 'white' }}
              />
            </div>
          </div>
        )
      }

      <div className="chat-input">
        <div className="emojis">
          <button
            onClick={toggleEmojiPicker}
            className="emojiClass"
            style={{ cursor: "pointer" }}
          >
            😀
          </button>
        </div>

        <form onSubmit={submitHandler} autoComplete="off" className="form">
          <div className="inputDiv">
            <ReactQuill
              theme="snow"
              className={`dark ${isDarkMode ? "dark-mode" : "light-mode"}`}
              placeholder={`Type a Message`}
              // value={text}
              value={text[selectedUserGroupId]?.text || ''}
              onChange={handleEditorChange}
              onKeyDown={handleKeyDown}
              ref={quillRef}
            />

            {/* <input
              type="text"
              id="message-input"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              placeholder={`Message ${capitalizeFirstLetter(selectedUser.name)}`}
              style={{ width: '100%' }}
            /> */}
          </div>
        </form>
        <img
          src={sendImage}
          onClick={submitHandler}
          className="sendImage"
          alt="Send"
        />
      </div>

      <div>
        {open && (
          <ClickAwayListener onClickAway={open && handleClickAway}>
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                },
              }}
              variant="persistent"
              anchor="right"
              open={open}
            >
              <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === "rtl" ? (
                    <ChevronLeftIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </IconButton>
              </DrawerHeader>
              {userGroups.map((group) => (
                group._id === selectedUserGroupId &&
                <div className="GroupInfo">
                  <div className="avatarWrapper">
                    {image && (
                      <img src={URL.createObjectURL(image)} alt="Preview" className="GroupAvatar" />
                    )}
                    {!image && group.groupAvatar && (
                      <img
                        src={group.groupAvatar.url}
                        alt="groupAvatar" className="GroupAvatar"
                      />
                    )}
                    <input
                      id="file"
                      type={"file"}
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={changeImageHandler}
                    />
                    <IconButton
                      onClick={handleButtonClick}
                      style={{
                        backgroundColor: "#D3D0D0",
                        position: "absolute",
                        translate: "0% 130%",
                      }}
                    >
                      <AddAPhotoIcon style={{ fontSize: "20px" }} />
                    </IconButton>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isEditing ? (
                        <>
                          <TextField
                            variant="standard"
                            defaultValue={group.groupName}
                            id="outlined-controlled"
                            value={groupName}
                            onChange={handleTextFieldChange}
                            onBlur={() => handleTextFieldBlur(group._id)}
                          />
                        </>
                      ) : (
                        <h2 onClick={() => handleEditClick(group._id)}>{group.groupName ? capitalizeFirstLetter(group.groupName) : ''}</h2>
                      )}
                    </div>

                    {!isEditing && <ModeEditIcon style={{ cursor: 'pointer' }} onClick={handleEditClick} />}
                  </div>

                  <div id="editBtns" style={{ display: showEditBtns ? 'block' : 'none' }}>
                    <Button onClick={discard} style={{ fontFamily: "Manrope", marginRight: "15px" }}>
                      <DeleteIcon style={{ fontSize: "20px", marginRight: "5px" }} />
                      Discard
                    </Button>
                    {loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <Button style={{ fontFamily: "Manrope" }} onClick={handleGroupInfoSave}>
                        <DoneIcon style={{ fontSize: "20px", marginRight: "5px" }} />
                        Save
                      </Button>
                    )}
                  </div>

                </div>
              ))}
              <Divider />
              <h4 style={{ margin: "15px" }}>Participants</h4>
              <List>
                <div className="participantsDiv">
                  {sortedParticipants.map((member) => (
                    <>
                      <ListItem disablePadding>
                        <ListItemIcon>
                          <Avatar alt={member.name} src={member.avatar.url} />
                        </ListItemIcon>
                        <div className="memberContainer">
                          {member._id === loginUser._id ? (<h4 className="memberName">{"You"}</h4>) :
                            (<h4 className="memberName">{capitalizeFirstLetter(member.name)}</h4>)}
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="memberRole">
                              {group.group?.groupAdmin.some((admin) => admin._id === member._id) ? (
                                <span className="AdminSpan">Admin</span>
                              ) : (
                                group.group?.groupAdmin.some((admin) => admin._id === user._id) && (<Tooltip title="Remove">
                                  <CancelIcon style={{ cursor: "pointer", marginTop: "5px" }} onClick={() => handleListMember(member._id)} /></Tooltip>)
                              )}
                            </span>
                            {group.group?.groupAdmin.some((admin) => admin._id === user._id) &&
                              <Tooltip title={localUserGroup.groupAdmin.includes(member._id) ? 'Remove group admin' : 'Make group admin'}>
                                <Switch
                                  checked={localUserGroup.groupAdmin.includes(member._id)}
                                  onChange={(e) => handleSwitch(e, member._id)}
                                  disabled={member._id === loginUser._id}
                                />
                              </Tooltip>
                            }
                          </div>
                        </div>
                      </ListItem>

                      <Modal
                        open={openModal}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                      >
                        <Box sx={style}>
                          <>
                            <FormGroup style={{ margin: '10px 5px', overflow: "auto", display: "grid", maxHeight: "300px" }}>
                              <Typography style={{
                                padding: '0px', margin: '0px', fontFamily: 'Manrope', fontWeight: '600',
                                fontSize: '20px', textDecoration: 'underline'
                              }}>{"Add Patrticipants"}</Typography>
                              <TextField
                                style={{ width: "80%", margin: "10px 0px 10px 10px" }}
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
                                        style={{ color: "black" }}
                                      />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {searchQuery && (
                                        <IconButton
                                          edge="end"
                                          onClick={handleClearSearch}
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
                              {filteredDataList.map((user, index) => {
                                const isParticipant = group && group.group.participants.some(
                                  (participant) => participant._id === user._id
                                );
                                return (
                                  !isParticipant && (
                                    <FormControlLabel
                                      key={index}
                                      control={<Checkbox checked={checkedUsers.includes(user._id)}
                                        onChange={(e) => handleCheckboxChange(e, user._id)}
                                        value={checkedUsers} />}
                                      label={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <ListItemIcon>
                                            <Avatar alt={user.name} src={user.avatar.url} style={{ margin: '7px 5px' }} />
                                          </ListItemIcon>
                                          <Typography style={{ padding: '0px', margin: '0px', fontFamily: 'Manrope' }}>
                                            {capitalizeFirstLetter(user.name)}
                                          </Typography>
                                        </div>
                                      }
                                    />
                                  )
                                );
                              })}
                            </FormGroup>

                            <Box
                              sx={{
                                display: "flex", flexDirection: "row",
                                justifyContent: 'end', pt: 2
                              }}
                            >
                              {loading ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                <Button
                                  color="inherit"
                                  onClick={handleAddParticipants}
                                  sx={{ mr: 1 }}
                                >
                                  Add
                                </Button>
                              )}
                            </Box>
                          </>
                        </Box>
                      </Modal>
                    </>
                  ))}
                </div>
              </List>
              <Divider />
              <div className="DrawerBtn">
                {group.group?.groupAdmin.some((admin) => admin._id === user._id) &&
                  <>
                    <Button style={{ marginLeft: "15px", fontFamily: "Manrope" }} onClick={handleOpen}>
                      <AddIcon style={{ fontSize: "15px", marginRight: "5px" }} />
                      Add Participants
                    </Button>

                    <Button style={{ fontFamily: "Manrope" }} onClick={openConfirmationDialogDelete}>
                      <DeleteIcon style={{ fontSize: "15px", marginRight: "5px" }} />
                      Delete Group
                    </Button>
                  </>
                }
                {group.group?.groupAdmin.some((admin) => admin._id !== user._id) &&
                  <Button style={{ marginRight: "15px", fontFamily: "Manrope" }} onClick={openConfirmationDialogLeave}>
                    <ExitToAppIcon style={{ fontSize: "18px", marginRight: "5px" }} />
                    Leave Group
                  </Button>}

              </div>
            </Drawer>
          </ClickAwayListener>)}

        <Dialog
          open={isConfirmationDialogOpenUpdate}
          onClose={closeConfirmationDialogUpdateMember}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to remove this user ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmationDialogUpdateMember} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="primary" autoFocus>
              Remove
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isConfirmationDialogOpenLeave}
          onClose={closeConfirmationDialogLeave}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to leave this group ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmationDialogLeave} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmLeave} color="primary" autoFocus>
              Leave
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isConfirmationDialogOpenDelete}
          onClose={closeConfirmationDialogDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this group ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmationDialogDelete} color="primary">
              Cancel
            </Button>
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Button onClick={confirmGroupDelete} color="primary" autoFocus>
                Delete
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </div>
    </div >
  );
};

export default ChatareaGroup;
