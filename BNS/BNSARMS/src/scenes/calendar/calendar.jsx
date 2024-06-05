/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  Button,
  Modal,
  TextField,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { formatDate } from "@fullcalendar/core";
import axiosInstance from "./axiosInstance"; // Import the axios instance
import useAuthStore from "../../stores/authStore"; // Import the auth store

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openArchiveModal, setOpenArchiveModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user } = useAuthStore(); // Get the user info
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("Fetching events...");
        const response = await axiosInstance.get("/calendar");
        console.log("Events fetched:", response.data);
        if (Array.isArray(response.data)) {
          setCurrentEvents(response.data);
        } else {
          console.error(
            "Fetched events are not in array format",
            response.data
          );
          setCurrentEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events", error);
        setCurrentEvents([]);
      }
    };

    fetchEvents();
  }, []);

  const handleDateClick = (selected) => {
    if (user.role !== "2") {
      setSelectedDate(selected);
      setOpenAddModal(true);
    }
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewEventTitle("");
    setSelectedDate(null);
  };

  const handleAddEvent = async () => {
    const calendarApi = selectedDate.view.calendar;
    calendarApi.unselect();

    if (newEventTitle) {
      const newEvent = {
        title: newEventTitle,
        start: selectedDate.startStr,
        end: selectedDate.endStr,
        allDay: selectedDate.allDay,
        createdBy: user.user_id, // Use the logged-in user id
      };

      try {
        console.log("Adding event:", newEvent);
        const response = await axiosInstance.post("/calendar", newEvent);
        console.log("Event added:", response.data);
        calendarApi.addEvent(response.data);
        setCurrentEvents([...currentEvents, response.data]);
        setSnackbarMessage("Event successfully created");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error adding event", error);
        setSnackbarMessage("Failed to create event");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }

    handleCloseAddModal();
  };

  const handleEventClick = (selected) => {
    if (user.role !== "2") {
      setSelectedEvent(selected.event);
      setOpenArchiveModal(true);
    }
  };

  const handleCloseArchiveModal = () => {
    setOpenArchiveModal(false);
    setSelectedEvent(null);
  };

  const handleArchiveEvent = async () => {
    if (selectedEvent) {
      try {
        await axiosInstance.patch(
          `/calendar/archive/${selectedEvent.extendedProps.eventId}`
        );
        selectedEvent.remove();
        setCurrentEvents(
          currentEvents.filter(
            (event) => event.eventId !== selectedEvent.extendedProps.eventId
          )
        );
        setSnackbarMessage("Event successfully archived");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error archiving event", error);
        setSnackbarMessage("Failed to archive event");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
    handleCloseArchiveModal();
  };

  return (
    <Box m="20px">
      <Header title="Event Calendar" subtitle="BNS Event Calendar" />

      <Box display="flex" justifyContent="space-between">
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
        >
          <Typography variant="h5">Events</Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem
                key={event.eventId || Math.random()} // Ensure a unique key
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  margin: "10px 0",
                  borderRadius: "2px",
                }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Typography>
                      {formatDate(event.start, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={user.role !== "2"} // Disable editing for role "2"
            selectable={user.role !== "2"} // Disable selection for role "2"
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            events={currentEvents}
          />
        </Box>
      </Box>

      <Modal open={openAddModal} onClose={handleCloseAddModal}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="h2">
            Add Event
          </Typography>
          <TextField
            label="Event Title"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddEvent}
            sx={{ mt: 2 }}
          >
            Add Event
          </Button>
        </Paper>
      </Modal>

      <Modal open={openArchiveModal} onClose={handleCloseArchiveModal}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="h2">
            Archive Event
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to archive the event '{selectedEvent?.title}'?
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleArchiveEvent}
          >
            Archive Event
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCloseArchiveModal}
            sx={{ mt: 1 }}
          >
            Cancel
          </Button>
        </Paper>
      </Modal>

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

export default Calendar;
