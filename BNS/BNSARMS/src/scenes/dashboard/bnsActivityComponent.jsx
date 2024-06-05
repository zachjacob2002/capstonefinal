// scenes/dashboard/bnsActivityComponent.jsx

import { Paper } from "@mui/material";
import BnsSideActivity from "./bnsSideActivity"; // Import NpcSideActivity component

const BNSActivityComponent = () => {
  return (
    <Paper
      elevation={1}
      sx={{
        width: "94%",
        borderRadius: 2,
        padding: "20px",
        margin: "10px",
        height: "auto", // Adjust height to accommodate content
        boxShadow: "2px 0 10px rgba(0,0,0,0.1), -3px 0 10px rgba(0,0,0,0.1)",
        "&:hover": {
          boxShadow: "5px 0 15px rgba(0,0,0,0.2), -5px 0 15px rgba(0,0,0,0.2)",
        },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <BnsSideActivity /> {/* Embed NpcSideActivity here */}
    </Paper>
  );
};

export default BNSActivityComponent;
