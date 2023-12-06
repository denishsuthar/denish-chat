import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { allUsers } from "../../Redux/actions/userAction";
import "./Dashboard.css";
import axios from "axios";
import { server } from "../../Redux/store";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Link, useNavigate  } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { Tooltip } from "@mui/material";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector((state) => state.users.users);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);

  useEffect(() => {
    dispatch(allUsers());
  }, [dispatch]);

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "mobileNumber", headerName: "Mobile Number", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "delete",
      headerName: "Delete",
      flex: 1,
      renderCell: (user) => (
        <Tooltip title="Delete User">
        <DeleteOutlineIcon
          style={{ cursor: "pointer" }}
          onClick={() => handleDelete(user.row.id)}
        />
        </Tooltip>
      ),
    },
  ];

  const userRows =
    users && users.length > 0
      ? users.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          role: user.role,
        }))
      : [];

  const getRowId = (user) => user.id;

  const deleteUser = async (selectedUser) => {
    try {
      await axios.delete(`${server}/delete/${selectedUser}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error fetching messages: ", error);
    }
  };

  const openConfirmationDialog = (user) => {
    setSelectedUserToDelete(user);
    setIsConfirmationDialogOpen(true);
  };

  const closeConfirmationDialog = () => {
    setSelectedUserToDelete(null);
    setIsConfirmationDialogOpen(false);
  };

  const confirmDelete = () => {
    if (selectedUserToDelete) {
      deleteUser(selectedUserToDelete).then(() => {
        dispatch(allUsers());
      });
      closeConfirmationDialog();
    }
  };

  const handleDelete = (user) => {
    openConfirmationDialog(user);
  };

  const handlerAddUser = () =>{
    navigate("/admin/add/user")
  }

  return (
    <div className="dashboard-container">
      <div className="add-user">
        <div>
        <Link to="/chat">
          <Tooltip title="Go Home">
          <HomeIcon style={{ fontSize: "2.5rem" }} />
          </Tooltip>
        </Link>
        </div>
        <div>
        <h2>User Dashboard</h2>
        </div>
        <div>
        <Button onClick={handlerAddUser} style={{backgroundColor:"#007bff", padding:"10px 30px", color:"white", borderRadius:"30px"}}>+ Add User</Button>
        </div>
      </div>
      <div className="dataGridDiv">
      <div className="data-grid-container">
        <DataGrid style={{ background: "white", borderRadius:"10px" }} rows={userRows} columns={columns} getRowId={getRowId} />
      </div>
      </div>
      <Dialog
        open={isConfirmationDialogOpen}
        onClose={closeConfirmationDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this user ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmationDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
