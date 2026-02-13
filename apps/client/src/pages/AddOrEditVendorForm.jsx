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
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { Container } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "longitude") {
      setVendor({ ...vendor, location: [vendor?.location?.[0] || "", value] });
    } else if (name === "latitude") {
      setVendor({ ...vendor, location: [value, vendor?.location?.[1] || ""] });
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
        isMounted && setVendor(response.data);
        setIsLoading(false);
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
      setIsLoading(false);
    };
  }, []);

  const handleCancel = () => navigate("/dashboard");

  const transformVendorData = () => {
    let vendorData = {};
    if (params?.vendorId) vendorData.id = params.vendorId;
    if (vendor.name) vendorData.name = vendor.name;
    if (vendor.location) vendorData.location = vendor.location;
    if (vendor.image) vendorData.image = vendor.image;
    if (vendor.imageTitle) vendorData.imageTitle = vendor.imageTitle;
    return vendorData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const transformedData = transformVendorData();

    try {
      if (params?.vendorId) {
        await axiosPrivate.put("/vendors", transformedData);
      } else {
        await axiosPrivate.post("/vendors", transformedData);
      }
      return navigate("/dashboard");
    } catch (error) {
      setErrorBag(error.response?.data?.message || "Error saving vendor");
    }
  };

  const onSelectFileHandler = async (e) => {
    const file = e.target.files[0];
    const fileName = file.name;
    const convertedImage = await convertToBase64(file);
    setVendor({ ...vendor, image: convertedImage, imageTitle: fileName });
  };

  const onDeleteFileHandler = () => {
    setVendor({ ...vendor, image: "", imageTitle: "" });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
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
                            "&.Mui-focused fieldset": { borderColor: "black" },
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
                              sx={{ color: "crimson", whiteSpace: "nowrap" }}
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
                    {vendor?.imageTitle && (
                      <Box width="100%">
                        <TextField
                          label="Cover Image"
                          variant="outlined"
                          value={vendor?.imageTitle || ""}
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
                    </Box>
                  </Box>
                </VendorForm>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
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

export default AddOrEditVendorForm;
