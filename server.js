// server.js
// Simple Express server to proxy Pinata API calls

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import multer from "multer";
import { Readable } from "stream";

// Try to import formdata-node, but provide fallbacks if it's not available
let FormData, File, Blob;
try {
  const formdataModule = await import("formdata-node");
  FormData = formdataModule.FormData;
  File = formdataModule.File;
  Blob = formdataModule.Blob;
} catch (error) {
  console.warn(
    "formdata-node not available, using global FormData, File, and Blob"
  );
  // Use global FormData, File, and Blob if available
  FormData =
    global.FormData ||
    class FormData {
      append() {}
    };
  File = global.File || class File {};
  Blob = global.Blob || class Blob {};
}

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

// Configure CORS to allow requests from your frontend
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://signature-opal.vercel.app",
            "https://signature-opal.netlify.app", // Add Netlify domain
            /\.vercel\.app$/,
            /\.netlify\.app$/, // Add Netlify subdomain pattern
            /\.zora\.co$/,
            process.env.FRONTEND_URL, // Allow the frontend URL from environment variable
          ].filter(Boolean) // Remove undefined values
        : ["http://localhost:8899", "http://localhost:3000"],
    credentials: true,
  })
);

// Add a pre-flight route handler for CORS
app.options("*", cors());

// Add CORS headers to all responses
app.use((req, res, next) => {
  // Allow requests from any origin
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

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

    // Log JWT details for debugging
    const jwt = process.env.PINATA_JWT;
    console.log("Using Pinata JWT:");
    console.log(`- Length: ${jwt ? jwt.length : "N/A"} characters`);
    console.log(`- Segments: ${jwt ? jwt.split(".").length : "N/A"}`);
    console.log(
      `- First 10 chars: ${jwt ? jwt.substring(0, 10) + "..." : "N/A"}`
    );

    // Check for common JWT issues
    if (jwt) {
      if (jwt.trim() !== jwt) {
        console.warn("Warning: JWT has leading/trailing whitespace");
      }
      if (jwt.includes("\n") || jwt.includes("\r")) {
        console.warn("Warning: JWT contains newline characters");
      }
      if (jwt.includes('"') || jwt.includes("'")) {
        console.warn("Warning: JWT contains quote characters");
      }
    }

    // Create a Blob from the buffer
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });

    // Create a File object from the Blob
    const file = new File([blob], req.file.originalname, {
      type: req.file.mimetype,
    });

    // Create a FormData object and append the file
    const formData = new FormData();
    formData.append("file", file);

    // Use a clean version of the JWT (trim whitespace)
    const cleanJWT = jwt ? jwt.trim() : "";
    console.log("Making request to Pinata API...");

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cleanJWT}`,
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

    // Log JWT details for debugging
    const jwt = process.env.PINATA_JWT;
    console.log("Using Pinata JWT for JSON pinning:");
    console.log(`- Length: ${jwt ? jwt.length : "N/A"} characters`);
    console.log(`- Segments: ${jwt ? jwt.split(".").length : "N/A"}`);

    // Use a clean version of the JWT (trim whitespace)
    const cleanJWT = jwt ? jwt.trim() : "";

    const data = {
      pinataContent: req.body,
      pinataMetadata: { name: "metadata.json" },
    };

    console.log("Making JSON pin request to Pinata API...");
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanJWT}`,
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  // Set explicit CORS headers for the health check endpoint
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  res.json({
    status: "ok",
    message: "Proxy server is running",
    cors: "enabled",
    timestamp: new Date().toISOString(),
  });
});

// IPFS content fetch endpoint
app.get("/api/ipfs/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash) {
      return res.status(400).json({ error: "No IPFS hash provided" });
    }

    console.log(`Server fetching IPFS content for hash: ${hash}`);

    // Try multiple gateways
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://ipfs.io/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`,
      `https://ipfs.fleek.co/ipfs/${hash}`,
      `https://w3s.link/ipfs/${hash}`,
    ];

    let content = null;
    let lastError = null;
    let successGateway = null;

    for (const gateway of gateways) {
      try {
        console.log(`Trying to fetch from ${gateway}...`);
        const response = await fetch(gateway);

        if (!response.ok) {
          throw new Error(
            `Gateway returned ${response.status}: ${response.statusText}`
          );
        }

        const contentType = response.headers.get("content-type");
        const text = await response.text();

        // If it's JSON, parse it to validate
        if (contentType && contentType.includes("application/json")) {
          try {
            content = JSON.parse(text);
          } catch (parseError) {
            throw new Error(`Invalid JSON: ${parseError.message}`);
          }
        } else {
          // For non-JSON content, just return the text
          content = text;
        }

        successGateway = gateway;
        console.log(`Successfully fetched from ${gateway}`);
        break;
      } catch (error) {
        console.log(`Failed to fetch from ${gateway}: ${error.message}`);
        lastError = error;
      }
    }

    if (!content) {
      return res.status(404).json({
        error: `Failed to fetch IPFS content from any gateway: ${
          lastError?.message || "Unknown error"
        }`,
      });
    }

    // Return the content with appropriate headers
    res.json({
      content,
      source: successGateway,
    });
  } catch (error) {
    console.error("Error fetching IPFS content:", error);
    res
      .status(500)
      .json({ error: `Failed to fetch IPFS content: ${error.message}` });
  }
});

// Metadata validation endpoint
app.post("/api/validate-metadata", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "No metadata provided" });
    }

    const metadata = req.body;

    // Basic validation
    if (!metadata.name || typeof metadata.name !== "string") {
      return res
        .status(400)
        .json({ error: "Metadata must include a name as a string" });
    }

    if (!metadata.description || typeof metadata.description !== "string") {
      return res
        .status(400)
        .json({ error: "Metadata must include a description as a string" });
    }

    if (!metadata.image || typeof metadata.image !== "string") {
      return res
        .status(400)
        .json({ error: "Metadata must include an image URL as a string" });
    }

    if (
      !metadata.image.startsWith("ipfs://") &&
      !metadata.image.startsWith("http")
    ) {
      return res
        .status(400)
        .json({ error: "Image URL must start with ipfs:// or http(s)://" });
    }

    // Check if the image is accessible
    if (metadata.image.startsWith("ipfs://")) {
      const ipfsHash = metadata.image.replace("ipfs://", "");
      const ipfsGatewayUrl = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;

      try {
        // Add a delay to allow IPFS to propagate
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Try multiple gateways
        const gateways = [
          `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
          `https://ipfs.io/ipfs/${ipfsHash}`,
          `https://dweb.link/ipfs/${ipfsHash}`,
          `https://ipfs.fleek.co/ipfs/${ipfsHash}`,
        ];

        let success = false;
        let lastError = null;

        for (const gateway of gateways) {
          try {
            const response = await fetch(gateway, { method: "HEAD" });
            if (response.ok) {
              success = true;
              break;
            }
          } catch (err) {
            lastError = err;
            console.log(`Failed to access ${gateway}: ${err.message}`);
          }
        }

        if (!success) {
          return res.status(400).json({
            error: `Image not accessible via any IPFS gateway: ${
              lastError?.message || "Unknown error"
            }`,
          });
        }
      } catch (error) {
        return res
          .status(400)
          .json({ error: `Failed to access image: ${error.message}` });
      }
    }

    return res.json({ valid: true, metadata });
  } catch (error) {
    console.error("Error validating metadata:", error);
    return res.status(500).json({ error: "Failed to validate metadata" });
  }
});

// Catch-all route to serve the frontend in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}

// Start the server (for both local development and production)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- GET /api/health - Health check endpoint`);
  console.log(`- GET /api/ipfs/:hash - Fetch IPFS content`);
  console.log(`- POST /api/pin-file - Pin a file to IPFS`);
  console.log(`- POST /api/pin-json - Pin JSON to IPFS`);
  console.log(`- POST /api/validate-metadata - Validate metadata JSON`);
  console.log(
    `\nPinata JWT status: ${
      process.env.PINATA_JWT ? "Configured ✅" : "Missing ❌"
    }`
  );
  console.log(`\nEnvironment: ${process.env.NODE_ENV || "development"}`);
});

// For Vercel serverless deployment (not used in Northflank)
export default app;
