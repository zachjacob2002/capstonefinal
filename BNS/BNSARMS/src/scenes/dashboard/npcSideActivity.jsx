// npcSideActivity.jsx

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AddedActivity from "../../components/AddedActivity";
import useActivityStore from "../../stores/useActivityStore";
import {
  fetchActivities,
  fetchAllUsers,
  fetchActivityBeneficiaries,
} from "../../functions/forActivities";
import useAuthStore from "../../stores/authStore";

const NpcSideActivity = () => {
  const { activities, setActivities } = useActivityStore((state) => ({
    activities: state.activities,
    setActivities: state.setActivities,
  }));
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(currentDate.getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showAll, setShowAll] = useState(true);
  const [showSelectedUserActivities, setShowSelectedUserActivities] =
    useState(false);
  const { user } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  const months = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  const years = Array.from({ length: 71 }, (_, i) => 2005 + i);

  useEffect(() => {
    if (user && user.user_id) {
      const fetchAllActivities = async () => {
        const activitiesData = await fetchActivities();
        const activitiesWithAttendance = await Promise.all(
          activitiesData.map(async (activity) => {
            const beneficiaries = await fetchActivityBeneficiaries(
              activity.activityId
            );
            const attendedCount = beneficiaries.filter(
              (b) => b.attended
            ).length;
            const attendance = {
              total: beneficiaries.length,
              attended: attendedCount,
            };
            return {
              ...activity,
              id: activity.activityId,
              attendance,
            };
          })
        );
        setActivities(
          activitiesWithAttendance.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      };

      const fetchUsers = async () => {
        const usersData = await fetchAllUsers();
        setAllUsers(usersData);
      };

      fetchAllActivities();
      fetchUsers();
    }
  }, [setActivities, user]);

  const handleShowAllChange = (e) => {
    setShowAll(e.target.checked);
    if (e.target.checked) {
      setShowSelectedUserActivities(false);
    }
  };

  const handleShowSelectedUserActivitiesChange = (e) => {
    setShowSelectedUserActivities(e.target.checked);
    if (e.target.checked) {
      setShowAll(false);
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (showAll) return true;
    if (showSelectedUserActivities)
      return activity.createdBy === parseInt(selectedUser);
    const activityDate = new Date(activity.activityDate);
    const matchesMonth =
      selectedMonth === "" ||
      activityDate.getMonth() + 1 === parseInt(selectedMonth);
    const matchesYear = activityDate.getFullYear() === selectedYear;
    const matchesUser =
      selectedUser === "" || activity.createdBy === parseInt(selectedUser);
    return matchesMonth && matchesYear && matchesUser;
  });

  return (
    <Box m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <FormControl
            variant="outlined"
            size="small"
            sx={{ mr: 2, minWidth: 200 }}
            disabled={showAll || showSelectedUserActivities}
          >
            <InputLabel id="select-user-label">Select BNS</InputLabel>
            <Select
              labelId="select-user-label"
              id="select-user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Select User"
              sx={{ bgcolor: "background.paper" }}
            >
              {allUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {`${user.firstName} ${user.lastName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ mr: 2, minWidth: 120 }}
            disabled={showAll || showSelectedUserActivities}
          >
            <InputLabel id="select-month-label">Select Month</InputLabel>
            <Select
              labelId="select-month-label"
              id="select-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Select Month"
              sx={{ bgcolor: "background.paper" }}
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ mr: 2, minWidth: 120 }}
            disabled={showAll || showSelectedUserActivities}
          >
            <InputLabel id="select-year-label">Select Year</InputLabel>
            <Select
              labelId="select-year-label"
              id="select-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Select Year"
              sx={{ bgcolor: "background.paper" }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={showAll}
                onChange={handleShowAllChange}
                color="primary"
              />
            }
            label="Show All Activities"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={showSelectedUserActivities}
                onChange={handleShowSelectedUserActivitiesChange}
                color="primary"
              />
            }
            label="Show All Activities by Selected User"
          />
        </Box>
      </Box>
      <Box
        mt={2}
        sx={{
          maxHeight: "calc(100vh - 250px)",
          overflowY: "auto",
          paddingRight: 2,
        }}
      >
        <Stack spacing={2}>
          {Array.isArray(filteredActivities) &&
          filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <AddedActivity
                key={activity.id}
                title={activity.title}
                activityId={activity.id}
                description={activity.description}
                activityDate={activity.activityDate}
                attendance={activity.attendance}
                showTooltip={true} // Ensure the popover appears
              />
            ))
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ height: "calc(100vh - 100px)" }}
            >
              <Typography variant="h6" color="textSecondary">
                No Activities Created
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default NpcSideActivity;
