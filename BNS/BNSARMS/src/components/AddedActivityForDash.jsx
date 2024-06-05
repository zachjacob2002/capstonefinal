/* eslint-disable react/prop-types */
// AddedActivityForDash.jsx

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  IconButton,
  Stack,
  Popover,
} from "@mui/material";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  Label,
  LabelList,
} from "recharts";
import { fetchActivityBeneficiaries } from "../functions/forActivities";

const AddedActivityForDash = ({ title, activityId, showTooltip = true }) => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState({ attended: 0, total: 0 });

  useEffect(() => {
    const getAttendanceData = async () => {
      const beneficiaries = await fetchActivityBeneficiaries(activityId);
      const attendedCount = beneficiaries.filter((b) => b.attended).length;
      setAttendance({
        attended: attendedCount,
        total: beneficiaries.length,
      });
    };
    getAttendanceData();
  }, [activityId]);

  const data = [
    { name: "Attended", value: attendance.attended },
    { name: "Not Attended", value: attendance.total - attendance.attended },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  const [anchorEl, setAnchorEl] = useState(null);

  const handleView = () => {
    if (activityId) {
      navigate(`/app/activities/view/${activityId}`);
    } else {
      console.error("Activity ID is undefined");
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
        width: "100%",
        borderRadius: "16px",
        boxShadow: 3,
        border: `3px solid green`,
        backgroundColor: "green",
        transition: "background-color 0.3s, box-shadow 0.3s, transform 0.2s",
        "&:hover": {
          backgroundColor: "green",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
          transform: "translateY(-2px)",
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
          <IconButton
            aria-label="view"
            size="large"
            onClick={handleView}
            sx={{ color: "white" }}
          >
            <VisibilityIcon />
          </IconButton>
        </Stack>
      </Box>
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
            {attendance.total === 0 ? (
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
                <Legend wrapperStyle={{ color: "lightgreen" }} />
              </PieChart>
            )}
          </Box>
        </Popover>
      )}
    </Card>
  );
};

export default AddedActivityForDash;
