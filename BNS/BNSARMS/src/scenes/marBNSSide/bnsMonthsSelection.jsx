/* eslint-disable react/prop-types */
// bnsMonthsSelection.jsx
import { Card, CardActionArea, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getMonthlyAccomplishmentReportDetails,
  getSubmissionCount,
} from "../../functions/reportSubmit";
import useAuthStore from "../../stores/authStore";

const currentMonth = new Date().getMonth(); // January is 0, December is 11

const MonthSelection = ({ month, year, isNPC }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [reportStatus, setReportStatus] = useState("No Submission");
  const [submissionCount, setSubmissionCount] = useState(0);
  const [isLate, setIsLate] = useState(false);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = months.indexOf(month);
  const nextMonth = months[(monthIndex + 1) % 12];

  useEffect(() => {
    if (user && monthIndex <= currentMonth) {
      if (isNPC) {
        const fetchSubmissionCount = async () => {
          const countDetails = await getSubmissionCount(month, year);
          if (countDetails && countDetails.count) {
            setReportStatus(`${countDetails.count} Submissions`);
            setSubmissionCount(countDetails.count);
          } else {
            setReportStatus("No Submissions");
          }
        };
        fetchSubmissionCount();
      } else {
        const fetchReportDetails = async () => {
          const details = await getMonthlyAccomplishmentReportDetails(
            month,
            year,
            user?.user_id
          );
          if (details && details.status) {
            setReportStatus(details.status);
            const dueDate = new Date(`${year}-${(monthIndex + 2) % 12}-05`); // Due date is the 5th of the next month
            if (new Date(details.submissionDate) > dueDate) {
              setIsLate(true);
            } else {
              setIsLate(false);
            }
          } else {
            setReportStatus("No Submission");
          }
        };
        fetchReportDetails();
      }
    }
  }, [month, year, monthIndex, user, isNPC]);

  const handleCardClick = () => {
    if (user && monthIndex <= currentMonth) {
      if (user.role == 2) {
        navigate(`/app/bns-submissions/${month}/${year}`);
      } else if (user.role == 1) {
        navigate(`/app/reports/${month}/${year}`);
      }
    }
  };

  const cardColor = isNPC
    ? submissionCount > 0
      ? "green"
      : "#8bc34a"
    : reportStatus !== "No Submission"
    ? "green"
    : "#8bc34a";

  return (
    <Card
      sx={{
        width: 315,
        height: 115,
        m: 1,
        boxShadow: "none",
        border: 2,
        borderColor: cardColor,
        borderRadius: "22px 22px 16px 16px",
        backgroundColor: cardColor,
        opacity: monthIndex > currentMonth ? 0.5 : 1,
        pointerEvents: monthIndex > currentMonth ? "none" : "auto",
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
        "&:hover": {
          boxShadow:
            monthIndex <= currentMonth
              ? "0 4px 20px rgba(0, 0, 0, 0.2)"
              : "none",
          transform: monthIndex <= currentMonth ? "translateY(-4px)" : "none",
        },
      }}
      onClick={handleCardClick}
    >
      <CardActionArea
        disabled={monthIndex > currentMonth}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: 115,
            p: 2,
          }}
        >
          <Typography
            variant="h5"
            color="common.white"
            noWrap
            sx={{ fontSize: 20, paddingLeft: 1 }}
          >
            {month}
          </Typography>
          <Box
            sx={{
              bgcolor:
                isNPC && submissionCount > 0
                  ? "#8bc34a"
                  : reportStatus === "Needs Revision"
                  ? "#d32f2f"
                  : reportStatus === "Completed"
                  ? "#8bc34a"
                  : reportStatus === "Submitted"
                  ? "grey"
                  : "green",
              borderRadius: "18px",
              p: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "30px",
            }}
          >
            <Typography variant="h6" color="common.white" sx={{ fontSize: 12 }}>
              {isNPC
                ? submissionCount > 0
                  ? `${submissionCount} Submissions`
                  : "No Submissions"
                : reportStatus}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            p: 2,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "background.paper",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <Typography sx={{ fontSize: 10 }}>
            {isNPC ? "View BNS Submissions" : `View your ${month} submission`}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isLate && (
              <Typography sx={{ fontSize: 10, color: "red", mr: 1 }}>
                Late ~
              </Typography>
            )}
            <Typography
              variant="h6"
              color="common.white"
              sx={{ fontSize: 10, color: "grey" }}
            >
              Due Date: {nextMonth} 5
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default MonthSelection;
