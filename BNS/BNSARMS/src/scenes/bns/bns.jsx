/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import ArchiveIcon from "@mui/icons-material/Archive";
import Header from "../../components/Header";
import NewBNS from "./newBNSForm";
import axios from "axios";
import useUserStore from "../../stores/useUserStore";

export const BNS = () => {
  const [searchText, setSearchText] = useState("");
  const [openNewBNSModal, setOpenNewBNSModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { users, setUsers, updateUser } = useUserStore((state) => ({
    users: state.users,
    setUsers: state.setUsers,
    updateUser: state.updateUser,
  }));
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/bns/")
      .then((response) => setUsers(response.data)) // Set users in the store
      .catch((error) => console.error("Error fetching users:", error));
  }, [setUsers]);

  const handleOpenNewBNSModal = (user) => {
    setCurrentUser(user);
    setOpenNewBNSModal(true);
  };
  const handleCloseNewBNSModal = () => setOpenNewBNSModal(false);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value.toLowerCase());
  };

  const confirmArchiveUser = (user) => {
    console.log("Preparing to archive user with ID:", user.id); // Log the ID to check correctness
    setUserToArchive(user);
    setOpenArchiveDialog(true);
  };

  const handleCloseArchiveDialog = () => {
    setOpenArchiveDialog(false);
    setUserToArchive(null);
  };

  const handleConfirmArchive = () => {
    if (!userToArchive) return;

    axios
      .patch(`http://localhost:3000/bns/archive/${userToArchive.id}`)
      .then(() => {
        updateUser({ ...userToArchive, isArchived: true });
        console.log("Archived User:", userToArchive);
        handleCloseArchiveDialog();
      })
      .catch((error) => {
        console.error("Archive error:", error.message);
        handleCloseArchiveDialog();
      });
  };

  const filteredUsers = useMemo(
    () =>
      users
        .filter(
          (user) =>
            user.firstName.toLowerCase().includes(searchText) ||
            user.lastName.toLowerCase().includes(searchText) ||
            user.username.toLowerCase().includes(searchText)
        )
        .sort((a, b) => a.firstName.localeCompare(b.firstName)),
    [users, searchText]
  );

  const columns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key={`archive-${params.id}`}
          icon={<ArchiveIcon />}
          label="Archive"
          onClick={() => confirmArchiveUser(params.row)}
        />,
      ],
    },
    { field: "id", headerName: "ID", width: 90, hide: true }, // Hide the ID field
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "username", headerName: "Username", width: 150 },
    {
      field: "password",
      headerName: "Password",
      width: 150,
      hide: true, // Hide the Password field
      valueGetter: () => "*******", // This line ensures the actual password is accessible programmatically, safely handling missing passwords
    },
    { field: "sex", headerName: "Sex", width: 120 },
    { field: "barangay", headerName: "Barangay", width: 130 },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="BNS" subtitle="View Users" />
        <Box display="flex">
          <TextField
            label="Search BNS"
            variant="outlined"
            size="small"
            sx={{ mr: 2 }}
            value={searchText}
            onChange={handleSearchChange}
          />
          <Button
            variant="contained"
            sx={{ bgcolor: "green" }}
            onClick={() => handleOpenNewBNSModal(null)} // Open modal to add user
          >
            Add BNS
          </Button>
        </Box>
      </Box>
      <Box m="20px">
        <div style={{ height: 400, width: "100%", marginTop: 20 }}>
          <DataGrid
            rows={filteredUsers.map((u, index) => ({ id: index, ...u }))}
            columns={columns}
            pageSize={5}
            onRowClick={(params) => handleOpenNewBNSModal(params.row)} // Row becomes clickable
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
            }}
          />
        </div>
      </Box>
      {openNewBNSModal && (
        <NewBNS
          open={openNewBNSModal}
          handleClose={handleCloseNewBNSModal}
          user={currentUser} // Check how currentUser is set
        />
      )}
      <Dialog
        open={openArchiveDialog}
        onClose={handleCloseArchiveDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Archiving"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to archive this BNS?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArchiveDialog} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmArchive} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
