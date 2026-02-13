import { IconButton, Box } from "@mui/material";
import React, { useRef, useState } from "react";
import AttachmentIcon from "@mui/icons-material/Attachment";
import DeleteIcon from "@mui/icons-material/Delete";

const FileUploader = ({ accept, onSelectFile, onDeleteFile, disabled }) => {
  const hiddenFileInput = useRef(null);
  const [file, setFile] = useState(null);

  const handleClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onSelectFile(event);
    }
  };

  const onDeleteFileHandler = () => {
    setFile(null);
    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = "";
    }
    onDeleteFile();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        border: disabled
          ? "1px solid rgba(0, 0, 0, 0.12)"
          : "1px solid rgba(0, 0, 0, 0.23)",
        borderRadius: "4px",
        padding: "10px 14px",
        backgroundColor: disabled ? "rgba(0, 0, 0, 0.04)" : "transparent",
        cursor: disabled ? "not-allowed" : "default",
        "&:hover": {
          borderColor: disabled ? "rgba(0, 0, 0, 0.12)" : "rgba(0, 0, 0, 0.87)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
        <AttachmentIcon
          sx={{
            marginRight: 1,
            color: disabled ? "rgba(0, 0, 0, 0.26)" : "rgba(0, 0, 0, 0.54)",
          }}
        />
        <Box
          component="span"
          sx={{
            color: file
              ? disabled
                ? "rgba(0, 0, 0, 0.38)"
                : "rgba(0, 0, 0, 0.87)"
              : "rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "1rem",
            width: "100%",
            textAlign: "left",
          }}
          onClick={disabled ? undefined : handleClick}
        >
          {file ? file.name : "Choose file *"}
        </Box>
        <input
          type="file"
          accept={accept}
          ref={hiddenFileInput}
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={disabled}
          data-testid="file-upload-input"
        />
      </Box>
      <IconButton
        aria-label="delete"
        disabled={disabled || !file}
        sx={{
          color: "rgba(0, 0, 0, 0.54)",
          marginLeft: 1,
        }}
        onClick={onDeleteFileHandler}
        size="small"
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default FileUploader;
