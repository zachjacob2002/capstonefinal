// InsertAttachment.jsx
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material";
import AttachmentIcon from "@mui/icons-material/Attachment";
import PropTypes from "prop-types";
import { tokens } from "../theme";

const InsertAttachment = ({ onFileSelect }) => {
  // theming
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  // This function simulates a click on the hidden file input element
  const handleAttachmentClick = () => {
    document.getElementById("file-input").click();
  };

  return (
    <>
      <input
        type="file"
        id="file-input"
        style={{ display: "none" }} // Hide the input element
        onChange={onFileSelect} // Propagate the file select event to the parent component
      />
      <Button
        startIcon={<AttachmentIcon />}
        variant="outlined"
        onClick={handleAttachmentClick}
        sx={{ color: colors.greenAccent[400] }} // Fix the syntax error by replacing curly braces with parentheses
      >
        Add Attachment
      </Button>
    </>
  );
};

InsertAttachment.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
};

export default InsertAttachment;
