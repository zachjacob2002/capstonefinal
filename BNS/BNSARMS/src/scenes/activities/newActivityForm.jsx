import { useState, useEffect } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Header from "../../components/Header";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import useActivityStore from "../../stores/useActivityStore";
import { saveActivity, updateActivity } from "../../functions/forActivities";
import useAuthStore from "../../stores/authStore";

const NewActivityForm = () => {
  const location = useLocation();
  const editingActivity = location.state ? location.state.activity : null;
  const [activityName, setActivityName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const addActivity = useActivityStore((state) => state.addActivity);
  const updateActivityState = useActivityStore((state) => state.updateActivity);
  const setSnackbar = useActivityStore((state) => state.setSnackbar);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (editingActivity) {
      setActivityName(editingActivity.title);
      setDescription(editingActivity.description);
      setSelectedDate(dayjs(editingActivity.activityDate));
    }
  }, [editingActivity]);

  const handleSave = () => {
    const activityDetails = {
      id: editingActivity ? editingActivity.id : Date.now(), // Generate a unique ID using Date.now()
      title: activityName,
      description,
      date: selectedDate.format("YYYY-MM"),
      createdBy: user.user_id, // Assuming the user object has a user_id property
    };

    // Add to local state and save to server
    if (editingActivity) {
      updateActivity(editingActivity.activityId, activityDetails)
        .then((updatedActivity) => {
          console.log("Activity successfully updated:", updatedActivity);
          updateActivityState(updatedActivity);
          setSnackbar("Activity successfully updated", "success");
          navigate("/app/activities");
        })
        .catch((error) => {
          console.error("Failed to update activity to server: ", error);
          setSnackbar("Failed to update activity", "error");
        });
    } else {
      saveActivity(activityDetails)
        .then((savedActivity) => {
          console.log("Activity successfully added:", savedActivity);
          addActivity(savedActivity); // Ensure to add the saved activity with the returned ID
          setSnackbar("Activity successfully added", "success");
          navigate("/app/activities");
        })
        .catch((error) => {
          console.error("Failed to save activity to server: ", error);
          setSnackbar("Failed to add activity", "error");
        });
    }
  };

  const handleCancel = () => {
    navigate("/app/activities");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box m={2}>
        <Header
          title={editingActivity ? "Edit Activity" : "New Activity"}
          subtitle={
            editingActivity ? "Edit the activity details" : "Add a new activity"
          }
        />
        <Stack spacing={2}>
          <TextField
            label="Activity Name"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            multiline
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <DatePicker
            views={["year", "month"]}
            label="Month and Year"
            value={selectedDate}
            onChange={setSelectedDate}
            components={{
              textField: ({ inputRef, inputProps, InputProps, ...others }) => (
                <TextField
                  {...others}
                  inputProps={{ ...inputProps, placeholder: "MM/YYYY" }}
                  InputProps={InputProps}
                  ref={inputRef}
                  fullWidth
                />
              ),
            }}
          />
        </Stack>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={handleCancel} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            {editingActivity ? "Update" : "Save"}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default NewActivityForm;
