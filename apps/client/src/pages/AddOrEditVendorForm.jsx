import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  createTheme,
  ThemeProvider,
  InputAdornment,
  useMediaQuery,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { Container } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import CheckIcon from "@mui/icons-material/Check";
import DashboardHeader from "../components/DashboardHeader";
import { useNavigate, useParams } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";

const AddOrEditVendorForm = () => {
  const axiosPrivate = useAxiosPrivate();
  const theme = createTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const params = useParams();

  const [vendor, setVendor] = useState({});
  const [errorBag, setErrorBag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "longitude") {
      setVendor({
        ...vendor,
        location: [vendor?.location?.[0] || "", value],
      });
    } else if (name === "latitude") {
      setVendor({
        ...vendor,
        location: [value, vendor?.location?.[1] || ""],
      });
    } else {
      setVendor({ ...vendor, [name]: value });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchVendor = async () => {
      try {
        const response = await axiosPrivate(`/vendors/${params.vendorId}`, {
          signal: controller.signal,
        });
        if (isMounted) {
          setVendor(response.data);
          if (response.data?.image) {
            setSelectedImageId(response.data.image._id);
            setSelectedImageTitle(response.data.image.title);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    if (params?.vendorId) {
      setIsLoading(true);
      fetchVendor();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axiosPrivate("/images");
      setImages(response.data || []);
    } catch (err) {
      console.error(err);
      setImages([]);
    }
  };

  const handleOpenImageDialog = async () => {
    await fetchImages();
    setImageDialogOpen(true);
  };

  const handleSelectImage = (image) => {
    setSelectedImageId(image._id);
    setSelectedImageTitle(image.title);
    setImageDialogOpen(false);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const onSelectFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      const response = await axiosPrivate.post("/images", {
        title: file.name,
        data: base64,
        mimeType: file.type,
      });

      setSelectedImageId(response.data._id);
      setSelectedImageTitle(response.data.title);
    } catch (err) {
      console.error(err);
      setErrorBag("Failed to upload image.");
    }
  };

  const onDeleteFileHandler = () => {
    setSelectedImageId("");
    setSelectedImageTitle("");
  };

  const handleCancel = () => navigate("/dashboard");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const vendorData = {};
    if (params?.vendorId) vendorData.id = params.vendorId;
    if (vendor.name) vendorData.name = vendor.name;
    if (vendor.location) vendorData.location = vendor.location;
    if (selectedImageId) vendorData.image = selectedImageId;

    try {
      if (params?.vendorId) {
        await axiosPrivate.put("/vendors", vendorData);
      } else {
        await axiosPrivate.post("/vendors", vendorData);
      }
      return navigate("/dashboard");
    } catch (error) {
      setErrorBag(error.response?.data?.message || "Error saving vendor");
    }
  };

  return (
    <>
      {isLoading ? (
        <GlobalLoadingProgress />
      ) : (
        <ThemeProvider theme={theme}>
          <DashboardHeader theme={theme} />
          <Box
            display="flex"
            flexDirection="column"
            justifyContent={isSmallScreen ? "flex-start" : "center"}
            alignItems="center"
            minHeight={isSmallScreen ? "65vh" : "85vh"}
            paddingY={5}
          >
            <Container maxWidth="md">
              <form autoComplete="off" onSubmit={handleSubmit}>
                <VendorForm elevation={5}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    width="100%"
                  >
                    <Box width="100%">
                      {errorBag === "Name is required!" && (
                        <Typography sx={{ color: "crimson" }}>
                          {errorBag}
                        </Typography>
                      )}
                      <TextField
                        name="name"
                        label="Name"
                        variant="outlined"
                        fullWidth
                        value={vendor?.name || ""}
                        onChange={handleChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                              borderColor: "black",
                            },
                          },
                          "& label.Mui-focused": { color: "black" },
                        }}
                      />
                    </Box>
                    <Box
                      display="flex"
                      gap={3}
                      width="100%"
                      sx={{ flexDirection: { xs: "column", sm: "row" } }}
                    >
                      <Box flex={1}>
                        {errorBag === "Location coordinates are required!" && (
                          <Box sx={{ height: 24, marginBottom: 1 }}>
                            <Typography
                              sx={{
                                color: "crimson",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {errorBag}
                            </Typography>
                          </Box>
                        )}
                        <TextField
                          name="latitude"
                          label="Latitude"
                          variant="outlined"
                          type="number"
                          fullWidth
                          value={vendor?.location?.[0] || ""}
                          onChange={handleChange}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "&.Mui-focused fieldset": {
                                borderColor: "black",
                              },
                            },
                            "& label.Mui-focused": { color: "black" },
                          }}
                        />
                      </Box>
                      <Box flex={1}>
                        {errorBag === "Location coordinates are required!" && (
                          <Box sx={{ height: 24, marginBottom: 1 }} />
                        )}
                        <TextField
                          name="longitude"
                          label="Longitude"
                          variant="outlined"
                          type="number"
                          fullWidth
                          value={vendor?.location?.[1] || ""}
                          onChange={handleChange}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "&.Mui-focused fieldset": {
                                borderColor: "black",
                              },
                            },
                            "& label.Mui-focused": { color: "black" },
                          }}
                        />
                      </Box>
                    </Box>
                    {selectedImageTitle && (
                      <Box width="100%">
                        <TextField
                          label="Selected Image"
                          variant="outlined"
                          value={selectedImageTitle}
                          fullWidth
                          disabled
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ImageIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    )}
                    <Box width="100%">
                      {errorBag === "Cover image is required!" && (
                        <Typography sx={{ color: "crimson" }}>
                          {errorBag}
                        </Typography>
                      )}
                      <FileUploader
                        onSelectFile={onSelectFileHandler}
                        onDeleteFile={onDeleteFileHandler}
                        accept={".jpeg, .jpg, .png, .webp"}
                      />
                      <Box
                        display="flex"
                        gap={2}
                        alignItems="center"
                        flexWrap="wrap"
                        mt={2}
                      >
                        <Typography
                          sx={{ color: "text.secondary", fontSize: 14 }}
                        >
                          or select an existing one:
                        </Typography>
                        <SelectImageButton
                          variant="outlined"
                          onClick={handleOpenImageDialog}
                          startIcon={<PhotoLibraryIcon />}
                        >
                          Select Image
                        </SelectImageButton>
                      </Box>
                    </Box>
                  </Box>
                </VendorForm>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                  }}
                >
                  <CancelButton variant="text" onClick={handleCancel}>
                    <CloseIcon sx={{ marginRight: "5px" }} /> Cancel
                  </CancelButton>
                  <AddVendorButton variant="contained" type="submit">
                    <SaveIcon sx={{ marginRight: "5px" }} /> Submit
                  </AddVendorButton>
                </Box>
              </form>
            </Container>
          </Box>
          <Dialog
            open={imageDialogOpen}
            onClose={() => setImageDialogOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Select an Image</DialogTitle>
            <DialogContent dividers>
              {images.length === 0 ? (
                <Typography color="text.secondary">
                  No images uploaded yet. Upload one first.
                </Typography>
              ) : (
                <List>
                  {images.map((img) => (
                    <ListItemButton
                      key={img._id}
                      selected={selectedImageId === img._id}
                      onClick={() => handleSelectImage(img)}
                    >
                      <ListItemIcon>
                        {selectedImageId === img._id ? (
                          <CheckIcon />
                        ) : (
                          <ImageIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={img.title}
                        secondary={img.mimeType}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setImageDialogOpen(false)}
                sx={{ color: "black", textTransform: "none" }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </ThemeProvider>
      )}
    </>
  );
};

const VendorForm = styled(Paper)(({ theme }) => ({
  padding: 50,
  marginBottom: 25,
  [theme.breakpoints.down("sm")]: { padding: 25 },
}));

const AddVendorButton = styled(Button)(() => ({
  textTransform: "none",
  backgroundColor: "black",
  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
}));

const CancelButton = styled(Button)(() => ({
  color: "black",
  textTransform: "none",
}));

const SelectImageButton = styled(Button)(() => ({
  textTransform: "none",
  color: "black",
  borderColor: "black",
  "&:hover": { borderColor: "rgba(0,0,0,0.8)" },
}));

export default AddOrEditVendorForm;
