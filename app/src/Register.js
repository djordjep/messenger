import React, { useState } from "react";
import {
  Alert,
  Container,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  Snackbar,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // can be 'error', 'warning', 'info', or 'success'
  });
  const navigate = useNavigate();

  const generateEncryptionKeys = async () => {
    let keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_DOMAIN}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Registration successful!",
          severity: "success",
        });
        generateEncryptionKeys();
        setTimeout(() => navigate("/login"), 3000);
      } else {
        // Handle errors (e.g., show an error message)
        console.log(data);
        setSnackbar({
          open: true,
          message: data.message,
          severity: "error",
        });
      }
    } catch (error) {
      // Handle network errors
      console.log(error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {/* <TextField label="Email" variant="outlined" fullWidth margin="normal" /> */}
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: 16 }}
          >
            Register
          </Button>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
      <hr style={{ margin: "16px 0" }} />
      <Typography variant="body2">
        Already have an account? &nbsp;
        <Link component={RouterLink} to="/login">
          Login here
        </Link>
      </Typography>
    </Container>
  );
}

export default RegisterForm;
