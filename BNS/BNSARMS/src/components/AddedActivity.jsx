/* eslint-disable react/prop-types */
// AddedActivity.jsx

import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  IconButton,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Popover, // Import Popover component
} from "@mui/material";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { deleteActivity, updateActivity } from "../functions/forActivities"; // Import the delete and update functions
import useActivityStore from "../stores/useActivityStore"; // Import the store
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useAuthStore from "../stores/authStore"; // Import useAuthStore to get the user role
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  Label,
  LabelList,
} from "recharts"; // Import Recharts components

const AddedActivity = ({
  title,
  activityId,
  description,
  activityDate,
  attendance,
  showTooltip = false, // Add a new prop with a default value
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Get the user from the auth store
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State to control the delete dialog visibility
  const [openEditDialog, setOpenEditDialog] = useState(false); // State to control the edit dialog visibility
  const [updatedTitle, setUpdatedTitle] = useState(title);
  const [updatedDescription, setUpdatedDescription] = useState(description);
  const [updatedDate, setUpdatedDate] = useState(dayjs(activityDate));
  const removeActivity = useActivityStore((state) => state.removeActivity);
  const updateActivityInStore = useActivityStore(
    (state) => state.updateActivity
  );

  const data = [
    { name: "Attended", value: attendance?.attended || 0 },
    {
      name: "Not Attended",
      value: attendance ? attendance.total - attendance.attended : 0,
    },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  // Popover state
  const [anchorEl, setAnchorEl] = useState(null);

  // This function navigates to the ViewActivity page with the specific activityId
  const handleView = () => {
    if (activityId) {
      navigate(`/app/activities/view/${activityId}`);
    } else {
      console.error("Activity ID is undefined");
    }
  };

  const handleDelete = async () => {
    const result = await deleteActivity(activityId);
    if (result) {
      removeActivity(activityId); // Remove the activity from the store
      setOpenDeleteDialog(false);
    }
  };

  const handleEditSave = async () => {
    const updatedData = {
      title: updatedTitle,
      description: updatedDescription,
      date: updatedDate.format("YYYY-MM-DD"),
    };

    const result = await updateActivity(activityId, updatedData);
    if (result) {
      updateActivityInStore({ id: activityId, ...updatedData });
      setOpenEditDialog(false);
    }
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Card
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
        height: "80px",
        borderRadius: "16px",
        boxShadow: 3,
        border: `3px solid green`,
        backgroundColor: "green",
        transition: "background-color 0.3s, box-shadow 0.3s, transform 0.2s",
        "&:hover": {
          backgroundColor: "green",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
          transform: "translateY(-2px)", // Subtle lift effect on hover
        },
      }}
      onMouseEnter={showTooltip ? handlePopoverOpen : null}
      onMouseLeave={showTooltip ? handlePopoverClose : null}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <AddTaskOutlinedIcon
          sx={{
            fontSize: 40,
            color: "white",
            marginRight: 2,
          }}
        />
        <Typography
          fontWeight="bold"
          variant="h4"
          sx={{ mb: "5px", color: "white", mt: 1 }}
        >
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ backgroundColor: "green", borderRadius: "16px" }}
        >
          {user?.role !== "1" && ( // Conditionally render the Edit button
            <IconButton
              aria-label="edit"
              size="large"
              sx={{ color: "white" }}
              onClick={() => setOpenEditDialog(true)}
            >
              <EditIcon />
            </IconButton>
          )}
          <IconButton
            aria-label="view"
            size="large"
            onClick={handleView}
            sx={{ color: "white" }}
          >
            <VisibilityIcon />
          </IconButton>
          {user?.role !== "1" && ( // Conditionally render the Delete button
            <IconButton
              aria-label="delete"
              size="large"
              onClick={() => setOpenDeleteDialog(true)} // Open dialog on delete button click
              sx={{ color: "white" }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Stack>
      </Box>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this activity?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            No
          </Button>
          <Button onClick={handleDelete} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Activity</DialogTitle>
        <DialogContent>
          <TextField
            label="Activity Name"
            value={updatedTitle}
            onChange={(e) => setUpdatedTitle(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={updatedDescription}
            multiline
            rows={4}
            onChange={(e) => setUpdatedDescription(e.target.value)}
            fullWidth
            margin="normal"
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={["year", "month", "day"]}
              label="Activity Date"
              value={updatedDate}
              onChange={setUpdatedDate}
              components={{
                textField: ({
                  inputRef,
                  inputProps,
                  InputProps,
                  ...others
                }) => (
                  <TextField
                    {...others}
                    inputProps={{ ...inputProps, placeholder: "MM/DD/YYYY" }}
                    InputProps={InputProps}
                    ref={inputRef}
                    fullWidth
                  />
                ),
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {showTooltip && (
        <Popover
          id="mouse-over-popover"
          sx={{
            pointerEvents: "none",
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Box sx={{ p: 1 }}>
            {attendance?.total === 0 ? (
              <Typography>There are no beneficiaries added</Typography>
            ) : (
              <PieChart width={200} height={200}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                  <Label
                    fill="black"
                    value={`Total: ${attendance.total}`}
                    position="center"
                  />
                  <LabelList dataKey="value" position="inside" />
                </Pie>
                <RechartsTooltip />
                <Legend
                  wrapperStyle={{ color: "lightgreen" }} // Change legend font color to light green
                />
              </PieChart>
            )}
          </Box>
        </Popover>
      )}
    </Card>
  );
};

export default AddedActivity;
