import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import axios from "../api/axios";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import "../assets/quill.css";
import "../assets/quill-snow.css";

const AddOrEditDealForm = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const theme = createTheme();
  const params = useParams();
  const [deal, setDeal] = useState({});
  const [vendors, setVendors] = useState([]);
  const [errorBag, setErrorBag] = useState("");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
      ["clean"],
    ],
  };

  const handleChange = (event) => {
    if (event.target === undefined) {
      return setDeal({ ...deal, description: `${event}` });
    }
    const { name, value } = event.target;
    if (name === "vendor") {
      setSelectedVendorId(value);
    } else {
      setDeal({ ...deal, [name]: value });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchDeal = async () => {
      try {
        const response = await axiosPrivate(`/deals/${params.dealId}`, {
          signal: controller.signal,
        });
        isMounted && setDeal(response.data);
        isMounted && setIsEditing(true);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    const fetchVendors = async () => {
      try {
        const response = await axios.get("/vendors", {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        isMounted && setVendors(response.data);
      } catch (error) {
        console.error(error);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchVendors();

    if (params?.dealId) {
      setIsLoading(true);
      fetchDeal();
    }

    return () => {
      isMounted = false;
      controller.abort();
      setIsLoading(false);
    };
  }, []);

  const handleCancel = () => navigate("/dashboard");

  const transformDealData = () => {
    let dealData = {};
    if (params?.dealId) dealData.id = params.dealId;
    if (deal.title) dealData.title = deal.title;
    if (deal.description) dealData.description = deal.description;
    if (deal.price) dealData.price = deal.price;
    if (deal?.image) dealData.image = deal.image;
    if (deal?.imageTitle) dealData.imageTitle = deal.imageTitle;
    return dealData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const transformedData = transformDealData();
    if (selectedVendorId) transformedData.vendor = selectedVendorId;

    try {
      if (params?.dealId) {
        await axiosPrivate.put("/deals", transformedData);
      } else {
        await axiosPrivate.post("/deals", transformedData);
      }
      return navigate("/dashboard");
    } catch (error) {
      setErrorBag(error.response?.data?.message || "Error saving deal");
    }
  };

  const onSelectFileHandler = async (e) => {
    const file = e.target.files[0];
    const fileName = file.name;
    const convertedImage = await convertToBase64(file);
    setDeal({ ...deal, image: convertedImage, imageTitle: fileName });
  };

  const onDeleteFileHandler = () => {
    setDeal({ ...deal, image: "", imageTitle: "" });
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
                <DealForm elevation={5}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    width="100%"
                  >
                    <Box width="100%">
                      {errorBag === "Title is required!" && (
                        <Typography sx={{ color: "crimson" }}>
                          {errorBag}
                        </Typography>
                      )}
                      <TextField
                        name="title"
                        label="Title"
                        variant="outlined"
                        fullWidth
                        value={deal?.title || ""}
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
                        {errorBag === "Price is required!" && (
                          <Typography sx={{ color: "crimson" }}>
                            {errorBag}
                          </Typography>
                        )}
                        <TextField
                          name="price"
                          label="Price"
                          variant="outlined"
                          type="number"
                          fullWidth
                          value={deal?.price || ""}
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
                        {errorBag &&
                          (errorBag.includes("Vendor") ? (
                            <Typography sx={{ color: "crimson" }}>
                              {errorBag}
                            </Typography>
                          ) : null)}
                        <FormControl fullWidth>
                          <InputLabel
                            id="vendor-select-label"
                            sx={{
                              "&.Mui-focused": { color: "black" },
                            }}
                          >
                            Vendor
                          </InputLabel>
                          <Select
                            labelId="vendor-select-label"
                            name="vendor"
                            value={selectedVendorId || ""}
                            label="Vendor"
                            onChange={handleChange}
                            disabled={isEditing}
                            fullWidth
                            sx={{
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "black",
                                },
                            }}
                          >
                            {vendors.map((vendor) => (
                              <MenuItem key={vendor._id} value={vendor._id}>
                                {vendor.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {deal?.imageTitle && (
                      <Box width="100%">
                        <TextField
                          label="Cover Image"
                          variant="outlined"
                          value={deal?.imageTitle || ""}
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
                    <Box width="100%">
                      {errorBag === "Description is required!" && (
                        <Typography sx={{ color: "crimson" }}>
                          {errorBag}
                        </Typography>
                      )}
                      <QuillWrapper>
                        <ReactQuill
                          value={deal?.description || ""}
                          onChange={(event) => handleChange(event)}
                          theme="snow"
                          modules={modules}
                        />
                      </QuillWrapper>
                    </Box>
                  </Box>
                </DealForm>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <CancelButton variant="text" onClick={handleCancel}>
                    <CloseIcon sx={{ marginRight: "5px" }} /> Cancel
                  </CancelButton>
                  <AddDealButton variant="contained" type="submit">
                    <SaveIcon sx={{ marginRight: "5px" }} /> Submit
                  </AddDealButton>
                </Box>
              </form>
            </Container>
          </Box>
        </ThemeProvider>
      )}
    </>
  );
};

const DealForm = styled(Paper)(({ theme }) => ({
  padding: 50,
  marginBottom: 25,
  [theme.breakpoints.down("sm")]: { padding: 25 },
}));

const AddDealButton = styled(Button)(() => ({
  textTransform: "none",
  backgroundColor: "black",
  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
}));

const CancelButton = styled(Button)(() => ({
  color: "black",
  textTransform: "none",
}));

const QuillWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  "& .quill": {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  "& .ql-container": {
    flexGrow: 1,
    overflow: "auto",
  },
  height: "250px",
  marginBottom: "3vh",
  [theme.breakpoints.down("md")]: {
    height: "250px",
    marginBottom: "10vh",
  },
  "@media (min-width: 375px) and (max-width: 375px) and (min-height: 667px) and (max-height: 667px)":
    {
      height: "250px",
      marginBottom: "10vh",
    },
  "@media (min-width: 360px) and (max-width: 360px) and (min-height: 740px) and (max-height: 740px)":
    {
      height: "250px",
      marginBottom: "12vh",
    },
  "@media (min-width: 768px) and (max-width: 768px) and (min-height: 1024px) and (max-height: 1024px)":
    {
      height: "250px",
      marginBottom: "5vh",
    },
}));

export default AddOrEditDealForm;
