// server.js
// Simple Express server to proxy Pinata API calls

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import multer from "multer";
import FormData from "form-data";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if Pinata JWT is available
if (!process.env.PINATA_JWT) {
  console.error(
    "PINATA_JWT environment variable is not set. Please set it in your .env file."
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to only allow requests from your frontend
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:8899"],
  })
);

// Parse JSON bodies
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "dist")));
}

// Proxy endpoint for pinning files to IPFS
app.post("/api/pin-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const formData = new FormData();
    // In Node.js, we can append the buffer directly with a filename
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Pinata file pin failed (${response.status}): ${errorText}`
      );
      return res
        .status(response.status)
        .json({ error: `Pinata file pin failed: ${errorText}` });
    }

    const result = await response.json();
    return res.json({ ipfsHash: result.IpfsHash });
  } catch (error) {
    console.error("Error pinning file to IPFS:", error);
    return res.status(500).json({ error: "Failed to pin file to IPFS" });
  }
});

// Proxy endpoint for pinning JSON to IPFS
app.post("/api/pin-json", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "No JSON provided" });
    }

    const data = {
      pinataContent: req.body,
      pinataMetadata: { name: "metadata.json" },
    };

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Pinata JSON pin failed (${response.status}): ${errorText}`
      );
      return res
        .status(response.status)
        .json({ error: `Pinata JSON pin failed: ${errorText}` });
    }

    const result = await response.json();
    return res.json({ ipfsHash: result.IpfsHash });
  } catch (error) {
    console.error("Error pinning JSON to IPFS:", error);
    return res.status(500).json({ error: "Failed to pin JSON to IPFS" });
  }
});

// Catch-all route to serve the frontend in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- POST /api/pin-file - Pin a file to IPFS`);
  console.log(`- POST /api/pin-json - Pin JSON to IPFS`);
});
