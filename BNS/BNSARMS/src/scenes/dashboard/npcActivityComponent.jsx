// scenes/dashboard/npcActivityComponent.jsx

import { Paper } from "@mui/material";
import NpcSideActivity from "./npcSideActivity"; // Import NpcSideActivity component

const NPCActivityComponent = () => {
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
      <NpcSideActivity /> {/* Embed NpcSideActivity here */}
    </Paper>
  );
};

export default NPCActivityComponent;
