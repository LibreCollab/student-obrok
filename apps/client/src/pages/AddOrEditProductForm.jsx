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
import axios from "../api/axios";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import "../assets/quill.css";
import "../assets/quill-snow.css";

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

const AddOrEditProductForm = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const theme = createTheme();
  const params = useParams();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [product, setProduct] = useState({});
  const [vendors, setVendors] = useState([]);
  const [errorBag, setErrorBag] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [images, setImages] = useState([]);

  const handleChange = (event) => {
    if (event.target === undefined) {
      return setProduct((prev) => ({ ...prev, description: `${event}` }));
    }
    const { name, value } = event.target;
    if (name === "vendor") {
      setSelectedVendorId(value);
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        const response = await axiosPrivate(`/products/${params.productId}`, {
          signal: controller.signal,
        });
        if (isMounted) {
          setProduct(response.data);
          setIsEditing(true);
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

    const fetchVendors = async () => {
      try {
        const response = await axios.get("/vendors", {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        if (isMounted) setVendors(response.data);
      } catch (error) {
        console.error(error);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchVendors();

    if (params?.productId) {
      setIsLoading(true);
      fetchProduct();
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

  const onSelectFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axiosPrivate.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
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

    const productData = {};
    if (params?.productId) productData.id = params.productId;
    if (product.title) productData.title = product.title;
    if (product.description) productData.description = product.description;
    if (product.price) productData.price = product.price;
    if (selectedVendorId) productData.vendor = selectedVendorId;
    if (selectedImageId) productData.image = selectedImageId;

    try {
      if (params?.productId) {
        await axiosPrivate.put("/products", productData);
      } else {
        await axiosPrivate.post("/products", productData);
      }
      return navigate("/dashboard");
    } catch (error) {
      setErrorBag(error.response?.data?.message || "Error saving product");
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
                <ProductForm elevation={5}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    width="100%"
                  >
                    {/* Title */}
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
                        value={product?.title || ""}
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

                    {/* Price + Vendor */}
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
                          value={product?.price || ""}
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
                        {errorBag?.includes("Vendor") && (
                          <Typography sx={{ color: "crimson" }}>
                            {errorBag}
                          </Typography>
                        )}
                        <FormControl fullWidth>
                          <InputLabel
                            id="vendor-select-label"
                            sx={{ "&.Mui-focused": { color: "black" } }}
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
                                { borderColor: "black" },
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

                    {/* Selected Image Preview */}
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

                    {/* Image Upload (optional) */}
                    <Box width="100%">
                      <FileUploader
                        onSelectFile={onSelectFileHandler}
                        onDeleteFile={onDeleteFileHandler}
                        accept=".jpeg, .jpg, .png, .webp"
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
                        {selectedImageId && (
                          <Button
                            variant="text"
                            size="small"
                            onClick={onDeleteFileHandler}
                            sx={{ color: "crimson", textTransform: "none" }}
                          >
                            Remove image
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {/* Description */}
                    <Box width="100%">
                      {errorBag === "Description is required!" && (
                        <Typography sx={{ color: "crimson" }}>
                          {errorBag}
                        </Typography>
                      )}
                      <QuillWrapper>
                        <ReactQuill
                          value={product?.description || ""}
                          onChange={(event) => handleChange(event)}
                          theme="snow"
                          modules={modules}
                        />
                      </QuillWrapper>
                    </Box>
                  </Box>
                </ProductForm>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <CancelButton variant="text" onClick={handleCancel}>
                    <CloseIcon sx={{ marginRight: "5px" }} /> Cancel
                  </CancelButton>
                  <SubmitButton variant="contained" type="submit">
                    <SaveIcon sx={{ marginRight: "5px" }} /> Submit
                  </SubmitButton>
                </Box>
              </form>
            </Container>
          </Box>

          {/* Image Select Dialog */}
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

const ProductForm = styled(Paper)(({ theme }) => ({
  padding: 50,
  marginBottom: 25,
  [theme.breakpoints.down("sm")]: { padding: 25 },
}));

const SubmitButton = styled(Button)(() => ({
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

const QuillWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  "& .quill": { height: "100%", display: "flex", flexDirection: "column" },
  "& .ql-container": { flexGrow: 1, overflow: "auto" },
  height: "250px",
  marginBottom: "3vh",
  [theme.breakpoints.down("md")]: { height: "250px", marginBottom: "10vh" },
}));

export default AddOrEditProductForm;
