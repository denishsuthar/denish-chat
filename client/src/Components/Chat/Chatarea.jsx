import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Chatarea.css";
import io from "socket.io-client";
import axios from "axios";
import { server, serverSocket } from "../../Redux/store";
import sendImage from "../../send-message.png";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import "./Messages.css";

import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import CollectionsIcon from "@mui/icons-material/Collections";
import {
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  Modal,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { styled, useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { allUsers, editProfile, lastSeenUsers } from "../../Redux/actions/userAction";
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';


const drawerWidth = 500;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

const Chatarea = ({ selectedUser, selectedUserId, isDarkMode }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const allUser = useSelector((state) => state.users.users);
  // console.log(allUser);

  // const [openModal, setOpenModal] = React.useState(true);
  // const handleClose = () => {
  //   setOpenModal(false);
  // };

  const quillRef = useRef();
  const fileInputRef = useRef();
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(true);

  const users = useSelector((state) => state.lastSeenUsers);

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

  const [lastSeendata, setLastSeendata] = useState([]);
  const [imgSrc, setImgSrc] = useState(null);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.profile.user);
  const [text, setText] = useState("");

  const handleEditorChange = (content, editor) => {
    // setText(content);
    setText((prevTextState) => ({
      ...prevTextState,
      [selectedUserId]: {
        text: content,
        userId: selectedUserId,
      },
    }));
  };

  const socket = io(`${serverSocket}`, {
    withCredentials: true,
  });

  // const receiveMessages = async () => {
  //   setLoading(true);
  //   try {
  //     // const response = await axios.get(`${server}/message/${selectedUserId}`, {
  //     //   headers: {
  //     //     "Content-Type": "application/json",
  //     //   },
  //     //   withCredentials: true,
  //     // });
  //     // const userMessages = response.data.userMessages;
  //     // setUserMessages(userMessages);
  //     const response = await axios.get(`${server}/message/${selectedUserId}?page=${page}`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       withCredentials: true,
  //     });
  //     setUserMessages((prevMessages) => (page === 1 ? response.data.userMessages : [...prevMessages, ...response.data.userMessages]));
  //   } catch (error) {
  //     console.error("Error fetching messages: ", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const [messagess, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [loadings, setLoading] = useState(false);

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

  const [totalMessagePages, setTotalMessagePages] = useState(0);

  const receiveMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${server}/message/${selectedUserId}?page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setTotalMessagePages(response.data.totalPages);
      const newMessages = response.data.userMessages;
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
    if (selectedUserId && quillRef.current) {
      quillRef.current.focus();
    }
  }, [selectedUserId]);

  useEffect(() => {
    dispatch(lastSeenUsers());
  }, []);

  useEffect(() => {
    receiveMessages();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedUserId]);

  useEffect(() => {
    receiveMessages();
  }, [selectedUserId, text, page]);

  useEffect(() => {
    socket.on("connect", () => {
      // console.log('Socket.io connection opened');
    });

    socket.on("Messages", (data) => {
      if (data) {
        setPage(1);
        receiveMessages();
        scrollToBottom();
      }
    });

    socket.on("disconnect", () => {
      // console.log('Socket.io connection closed');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, dispatch, selectedUserId, page]);

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

    socket.on("disconnect", () => {
      // console.log('Socket.io connection closed');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, dispatch]);

  useEffect(() => {
    dispatch(allUsers());
  }, [])

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
  //       receiver: selectedUserId,
  //       text: trimmedText,
  //     };

  //     await axios
  //       .post(`${server}/send`, bodyData, {
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
    if (text[selectedUserId]) {
      const trimmedText = text[selectedUserId].text.replace(/<p><br><\/p>|<li><br><\/li>/g, "");

      if (forbiddenTags.includes(trimmedText)) {
        toast.error("Please Enter Message!!");
      } else if (trimmedText.trim() === "") {
        toast.error("Please Enter Message!!");
      } else {
        const bodyData = {
          receiver: selectedUserId,
          text: trimmedText,
        };

        await axios
          .post(`${server}/send`, bodyData, {
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
              [selectedUserId]: {
                ...prevTextState[selectedUserId],
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

  // const handleEmojiSelect = (emoji) => {
  //   setText((prevText) => console.log("ckhednvcj====>", prevText, emoji.native, prevText + emoji.native));
  // };

  const handleEmojiSelect = (emoji) => {
    setText((prevText) => {
      const selectedUserText = prevText[selectedUserId]?.text || '';
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

        // Create a new <span> element to hold the emoji
        const emojiSpan = document.createElement("span");
        emojiSpan.innerText = emoji.native;

        if (!nearestLiTag) {
          // If there are no <li> tags, create a new <li> tag and add the emoji
          nearestLiTag = document.createElement("li");
          nearestLiTag.appendChild(emojiSpan);
          listElement.appendChild(nearestLiTag);
        } else {
          // Insert the emoji <span> into the nearest <li> tag
          nearestLiTag.appendChild(emojiSpan);
        }
      } else if (pTags.length > 0) {
        let nearestPTag = pTags[pTags.length - 1];

        // Create a new <span> element to hold the emoji
        const emojiSpan = document.createElement("span");
        emojiSpan.innerText = emoji.native;

        // Insert the emoji <span> into the nearest <p> tag
        nearestPTag.appendChild(emojiSpan);
      } else {
        // If there are no <p>, <ul>, or <ol> tags, create a new <p> tag and add the emoji
        const newPTag = document.createElement("p");
        newPTag.innerHTML = emoji.native;
        doc.body.appendChild(newPTag);
      }

      // Convert the updated HTML back to a string
      const updatedHTML = new XMLSerializer().serializeToString(doc);

      // return updatedHTML;
      return {
        ...prevText,
        [selectedUserId]: {
          text: updatedHTML,
          userId: selectedUserId,
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

  function formatTextWithLinks(inputText) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return inputText.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessages();
    }
  };

  const handleInputImageChange = (event) => {
    const reader = new FileReader();
    const { files } = event.target;
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result);
      reader.readAsDataURL(files[0]);
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

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);

    const day = date.getDate();
    const suffix =
      day >= 11 && day <= 13
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][
        day % 10
        ];

    const formattedDate = date.toLocaleString("en-US", options);

    return `${formattedDate.split(",")[1]}${suffix}, ${formattedDate.split(",")[2]
      }`;
  };

  function convertTimestampToLastSeen(timestamp) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const date = new Date(timestamp);
    const day = date.getDate();
    const suffix =
      day >= 11 && day <= 13
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][
        day % 10
        ];

    if (timestamp === 'Online') {
      return 'Online';
    } else {
      const now = new Date();
      const lastSeenDate = new Date(timestamp);

      if (
        now.getDate() === lastSeenDate.getDate() &&
        now.getMonth() === lastSeenDate.getMonth() &&
        now.getFullYear() === lastSeenDate.getFullYear()
      ) {
        const formattedTime = lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `Last Seen Today at ${formattedTime}`;
      } else {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = daysOfWeek[lastSeenDate.getDay()];
        const formattedTime = lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedDate = lastSeenDate.toLocaleString("en-US", options);
        return `Last Seen on ${formattedDate.split(",")[1]}${suffix}, ${formattedDate.split(",")[2]} at ${formattedTime}`;
      }
    }
  }


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


  return (
    <div className={`chat-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className={`chat-header ${isDarkMode ? "dark-modeHeader" : ""}`}>
        <div className="user-info" onClick={handleDrawerOpen} style={{ margin: '10px 10px' }}>
          {allUser.map((user) => (
            <>
              {user._id === selectedUserId &&
                <>
                  <img src={user.avatar.url} alt="User Avatar" />
                  <div style={{ margin: '5px 0px' }}>
                    <h3 style={{ margin: '0px' }}>{capitalizeFirstLetter(user.name)}</h3>
                    {selectedUser && users && users.users?.map((seen) => (
                      selectedUserId && seen.lastSeen && selectedUserId === seen._id && <span>{convertTimestampToLastSeen(seen.lastSeen)}</span>
                    ))}
                  </div>
                </>
              }
            </>
          ))}
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

      <div
        className={`messages-container ${isDarkMode ? "dark-mode" : "light-mode"}`}
        onScroll={handleScroll}
      >
        <div className="messages" ref={messagesContainerRef}>
          {Object.entries(groupedMessages).map(([date, messagesGroup]) => (
            <>
              <div style={{ display: 'flex', height: '0px', alignItems: 'center', justifyContent: 'center', margin: '30px 0px' }}>
                <p className="dateHeader">{date}</p>
              </div>
              {messagesGroup.map((message) => (
                <div key={message._id} className={`message ${user._id === message.sender._id ? "sent" : "received"}`}>
                  <div style={{ display: 'flex', alignItems: 'end', flexWrap: 'nowrap' }}>
                    <div style={{ padding: '5px 0px' }}>
                      <p className="messageText">{extractURLFromText(message.text)}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <p className="timeText">{convertTimeToCustomFormat(message.createdAt)}</p>
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

      {showScrollButton && page > 2 && (
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
      )}

      {/* <Messages messages={userMessages} loading={loading} page={page} selectedUserId={selectedUserId} isDarkMode={isDarkMode} /> */}

      <div className="chat-input">
        <div className="emojis">
          <button
            onClick={toggleEmojiPicker}
            className="emojiClass"
            style={{ cursor: "pointer" }}
          >
            😀
          </button>
          {/* <CollectionsIcon
            onClick={() => fileInputRef.current.click()}
            style={{ cursor: "pointer" }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleInputImageChange}
          /> */}
        </div>

        {/* {imgSrc && <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <div><img src={imgSrc} alt="User Avatar" /></div>
          </Box>
        </Modal>} */}

        <form onSubmit={submitHandler} autoComplete="off" className="form">
          <div className="inputDiv">
            <ReactQuill
              theme="snow"
              className={`dark ${isDarkMode ? "dark-mode" : "light-mode"}`}
              placeholder={`Type a Message`}
              // value={text}
              value={text[selectedUserId]?.text || ''}
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

              {allUser.map((user) => (
                <>
                  {user._id === selectedUserId &&
                    <>
                      <div className="GroupInfo">
                        <img
                          src={user.avatar.url}
                          alt="groupAvatar"
                          className="GroupAvatar"
                        />
                        <h2>{user.name}</h2>
                      </div>
                      <Divider />
                      <h4 style={{ margin: "15px" }}>{user.name} Details</h4>
                      <ListItem>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <h4 style={{ display: "flex", alignItems: "center" }}>
                            <LocalPhoneIcon style={{ marginRight: "15px" }} />
                            {user.mobileNumber}
                          </h4>
                          <h4 style={{ display: "flex", alignItems: "center" }}>
                            <EmailIcon style={{ marginRight: "15px" }} />
                            {user.email}
                          </h4>
                          <h4 style={{ display: "flex", alignItems: "center" }}>
                            <AccessTimeIcon style={{ marginRight: "15px" }} />
                            Created on {formatDate(user.createdAt)}
                          </h4>
                        </div>
                      </ListItem>
                    </>
                  }
                </>
              ))}
            </Drawer>
          </ClickAwayListener>
        )}
      </div>
    </div>
  );
};

export default Chatarea;
