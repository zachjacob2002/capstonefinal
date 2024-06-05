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
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { fetchAllTypes } from "../../functions/forTypes";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ArchiveIcon from "@mui/icons-material/Archive"; // Changed the icon to ArchiveIcon

export const ViewTypes = () => {
  const [searchText, setSearchText] = useState("");
  const [types, setTypes] = useState([]);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [typeToArchive, setTypeToArchive] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await fetchAllTypes();
        setTypes(data);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    };

    fetchTypes();
  }, []);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value.toLowerCase());
  };

  const confirmArchiveType = (type) => {
    setTypeToArchive(type);
    setOpenArchiveDialog(true);
  };

  const handleCloseArchiveDialog = () => {
    setOpenArchiveDialog(false);
    setTypeToArchive(null);
  };

  const handleConfirmArchive = () => {
    if (!typeToArchive) return;

    axios
      .patch(`http://localhost:3000/types/types/${typeToArchive.typeId}`)
      .then(() => {
        setTypes((prevTypes) =>
          prevTypes.filter((t) => t.typeId !== typeToArchive.typeId)
        );
        setSnackbarMessage("Type successfully archived");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleCloseArchiveDialog();
      })
      .catch((error) => {
        console.error("Archive error:", error.message);
        setSnackbarMessage("Failed to archive type");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        handleCloseArchiveDialog();
      });
  };

  const handleRowClick = (params) => {
    navigate("/app/managetypes", { state: { type: params.row } });
  };

  const filteredTypes = useMemo(() => {
    const sortedTypes = [...types].sort((a, b) => {
      if (a.typeCategory === "Secondary" && b.typeCategory !== "Secondary") {
        return -1;
      }
      if (a.typeCategory !== "Secondary" && b.typeCategory === "Secondary") {
        return 1;
      }
      return a.typeName.localeCompare(b.typeName);
    });

    return sortedTypes.filter(
      (type) =>
        type.typeName.toLowerCase().includes(searchText) ||
        type.typeCategory.toLowerCase().includes(searchText)
    );
  }, [types, searchText]);

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            confirmArchiveType(params.row);
          }}
        >
          <ArchiveIcon />
        </IconButton>
      ),
    },
    { field: "typeId", headerName: "ID", width: 90, hide: true },
    { field: "typeName", headerName: "Type Name", width: 150 },
    { field: "typeCategory", headerName: "Type Category", width: 150 },
    {
      field: "primaryTypes",
      headerName: "Age Group Referenced",
      width: 200,
      valueGetter: (params) =>
        params.row.primaryTypes.length > 0
          ? params.row.primaryTypes
              .map((pt) => pt.primaryType.typeName)
              .join(", ")
          : "N/A",
    },
    { field: "sex", headerName: "Sex", width: 120 },
    {
      field: "parentType",
      headerName: "Secondary Type Referenced",
      width: 150,
      valueGetter: (params) =>
        params.row.parentType ? params.row.parentType.typeName : "N/A",
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Beneficiary Types" subtitle="Manage Beneficiary Types" />
        <Box display="flex">
          <TextField
            label="Search Types"
            variant="outlined"
            size="small"
            sx={{ mr: 2 }}
            value={searchText}
            onChange={handleSearchChange}
          />
          <Button
            variant="contained"
            sx={{ bgcolor: "green" }}
            onClick={() => navigate("/app/managetypes")} // Navigate to manage types page
          >
            Add Beneficiary Type
          </Button>
        </Box>
      </Box>
      <Box m="20px">
        <div style={{ height: 400, width: "100%", marginTop: 20 }}>
          <DataGrid
            rows={filteredTypes}
            columns={columns}
            pageSize={5}
            getRowId={(row) => row.typeId}
            onRowClick={handleRowClick}
          />
        </div>
      </Box>
      <Dialog
        open={openArchiveDialog}
        onClose={handleCloseArchiveDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Archive"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to archive this type?
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewTypes;
