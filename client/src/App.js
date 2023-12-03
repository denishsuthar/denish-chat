import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./Components/Chat/Chat";
import Chatarea from "./Components/Chat/Chatarea";
import Login from "./Components/Login/Login";
import { useDispatch, useSelector } from "react-redux";
import { allUsers, loadUser, updateUserStatus } from "./Redux/actions/userAction";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "protected-route-react";
import { io } from "socket.io-client";
import Profile from "./Components/Chat/Profile";
import Dashboard from "./Components/Chat/Dashboard";
import Register from "./Components/Register/Register";
import UpdateProfile from "./Components/Update Profile/UpdateProfile";
import ChangePassword from "./Components/Change Password/ChangePassword";
import Loader from "./Components/Loader/Loader"
import { serverSocket } from "./Redux/store";
import WifiOffIcon from '@mui/icons-material/WifiOff';

const OfflineNotice = () => (
  <div style={{ display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center', minHeight: "100vh", }}>
    <div>
      <WifiOffIcon style={{ fontSize: '150px' }} />
    </div>
    <div style={{ padding: '10px', textAlign: 'center', fontSize: "30px" }}>
      Oops ! No Internet Connection
    </div>
  </div>
);

function App() {
  const { isAuthenticated, message, error, loading } = useSelector(
    (state) => state.profile
  );

  const [isStatusOnline, setIsStatusOnline] = useState("");

  const user = useSelector((state) => state.profile.user);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const dispatch = useDispatch();

  const socket = io(`${serverSocket}`, {
    withCredentials: true,
  });

  useEffect(() => {
    const handleInternetOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleInternetOnlineStatus);
    window.addEventListener('offline', handleInternetOnlineStatus);

    return () => {
      window.removeEventListener('online', handleInternetOnlineStatus);
      window.removeEventListener('offline', handleInternetOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsStatusOnline("Online");
      window.location.reload();
    };
    const handleOfflineStatus = () => {
      setIsStatusOnline(new Date());
    };
    const handleUserActivity = () => {
      setIsStatusOnline("Online");
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        setIsStatusOnline(new Date());
      }, 90000);
    };
    const handleBeforeUnload = () => {
      setIsStatusOnline(new Date());
    };
    let inactivityTimeout;
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('beforeunload', handleBeforeUnload);
    // inactivityTimeout = setTimeout(() => {
    //   setIsStatusOnline(new Date());
    // }, 30000);
    const activityCheckInterval = setInterval(() => {
      if (Date.now() - lastActivityTimestamp > inactivityThreshold) {
        // setIsStatusOnline(new Date());
      }
    }, 90000);
    const cleanup = () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(activityCheckInterval);
    };
    window.addEventListener('beforeunload', cleanup);
    return cleanup;
  }, []);

  let lastActivityTimestamp = Date.now();
  const inactivityThreshold = 90000;


  useEffect(() => {
    dispatch(updateUserStatus(isStatusOnline));
  }, [isStatusOnline, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch({ type: "clearError" });
    }
    if (message) {
      toast.success(message);
      dispatch({ type: "clearMessage" });
    }
  }, [dispatch, error, message]);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
        }
      });
    }
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      // console.log('Socket.io connection opened');
    });

    socket.on("Messages", (data) => {
      if (data && data.messageData.receiver === user._id) {
        let plainText = removeHTMLStyling(data.messageData.text);
        showNotification(
          plainText,
          data.messageData.sender.avatar.url,
          data.messageData.sender.name,
          data.messageData.receiver
        );
      }
    });

    socket.on('disconnect', () => {
      // console.log('Socket.io connection closed');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    socket.on('connect', () => {
      // console.log('Socket.io connection opened');
    });

    socket.on("GroupMessages", (data) => {
      // console.log("data group messages==>", data);
      const receivers = data.groupMessage.receivers;

      {
        receivers.map((i) => {
          if (i !== data.groupMessage.sender._id && i === user._id) {
            let groupName = removeHTMLStyling(data.groupMessage.groupName);
            let plainText = removeHTMLStyling(data.groupMessage.text);
            showGroupNotification(
              plainText,
              data.groupMessage.sender.avatar.url,
              data.groupMessage.sender.name,
              groupName,
              i
            );
          }
        })
      }
    });

    let oldParticipants = [];
    socket.on("AddGroup", (data) => {
      const participants = data.group.participants;
      // console.log("participants==>", participants);
      const groupAdmins = data.group.groupAdmin;

      const newParticipants = participants.filter((i) => !oldParticipants.includes(i));
      // console.log("newParticipants===>", newParticipants);

      newParticipants.forEach((newParticipant) => {
        groupAdmins.forEach((admin) => {
          if (newParticipant !== admin && newParticipant === user._id) {
            let createGroupName = removeHTMLStyling(data.group.groupName);
            showCreateGroupNotification(
              data.group.groupAvatar.url,
              createGroupName,
              newParticipant
            );
          }
        });
      });

      oldParticipants = participants;
    });


    socket.on('disconnect', () => {
      // console.log('Socket.io connection closed');
    });

    return () => {
      socket.disconnect();
    };

  }, [socket]);

  function removeHTMLStyling(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return doc.body.textContent || "";
  }

  if (!isOnline) {
    return <OfflineNotice />;
  }

  const showNotification = (message, avatar, senderName) => {
    if (Notification.permission === "granted") {
      const notification = new Notification("New Message", {
        body: senderName + " " + " : " + " " + message,
        icon: avatar,
      });

      notification.onclick = () => {
        window.open(`${process.env.REACT_APP_FRONTEND_URL}/chat`);
      };
    }
  };

  const showGroupNotification = (message, avatar, senderName, groupName) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(`${groupName}`, {
        body: senderName + " " + " : " + " " + message,
        icon: avatar,
      });

      notification.onclick = () => {
        window.open(`${process.env.REACT_APP_FRONTEND_URL}/chat`);
      };
    }
  };

  const showCreateGroupNotification = (avatar, groupName) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(`You have added in ${groupName} Group`, {
        body: "GroupName" + " : " + groupName,
        icon: avatar,
      });

      notification.onclick = () => {
        window.open(`${process.env.REACT_APP_FRONTEND_URL}/chat`);
      };
    }
  };


  return (
    <BrowserRouter>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute
                  isAuthenticated={!isAuthenticated}
                  redirect="/chat"
                >
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} redirect="/">
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:userId"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} redirect="/">
                  <Chatarea />
                </ProtectedRoute>
              }
            />
            <Route
              path="/me"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} redirect="/">
                  <Profile user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/me/update"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} redirect="/">
                  <UpdateProfile user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/password/update"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} redirect="/">
                  <ChangePassword user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute
                  adminRoute={true}
                  isAuthenticated={isAuthenticated}
                  redirect="/"
                  isAdmin={user && user.role === "admin"}
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/add/user"
              element={
                <ProtectedRoute
                  adminRoute={true}
                  isAuthenticated={isAuthenticated}
                  redirect="/"
                  isAdmin={user && user.role === "admin"}
                >
                  <Register />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </>
      )}
    </BrowserRouter>
  );
}

export default App;
