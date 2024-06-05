import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useBeneficiaryStore from "../../stores/useBeneficiaryStore";
import PropTypes from "prop-types";

const SelectBeneficiaryModal = ({ isOpen, onClose, onSave }) => {
  const beneficiaries = useBeneficiaryStore((state) => state.beneficiaries);
  const [selectionModel, setSelectionModel] = useState([]);

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "type", headerName: "Type", width: 130 },
    { field: "barangay", headerName: "Barangay", width: 130 },
    { field: "purok", headerName: "Purok", width: 130 },
    { field: "sex", headerName: "Sex", width: 120 },
    { field: "job", headerName: "Job", width: 130 },
    { field: "birthdate", headerName: "Birthdate", width: 130 },
  ];

  // Enhanced handleSave function
  const handleSave = () => {
    if (selectionModel.length > 0) {
      console.log("Selected beneficiaries successfully saved:", selectionModel);
    } else {
      console.log("No beneficiaries selected.");
    }
    onSave(selectionModel); // Trigger the onSave callback with the selected IDs
    onClose(); // Close the modal
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Beneficiaries</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={beneficiaries.map((b) => ({ ...b, id: b.id.toString() }))}
            columns={columns}
            pageSize={5}
            checkboxSelection
            onSelectionModelChange={(newSelection) =>
              setSelectionModel(newSelection)
            }
            selectionModel={selectionModel}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

SelectBeneficiaryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default SelectBeneficiaryModal;
