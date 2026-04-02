import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";

dotenv.config();

// Load Firebase Config
import firebaseConfig from "./firebase-applet-config.json";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(firebaseApp);

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Email configuration missing. Skipping email send.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Vignan's LARA Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

// Bootstrap Admin User and Config
async function bootstrapAdmin() {
  const adminEmail = "narasimhakala4@gmail.com";
  const defaultPassword = "admin123"; // User can change this in Firestore later

  try {
    // Try to sign in as admin
    await signInWithEmailAndPassword(auth, adminEmail, defaultPassword);
    console.log("Admin logged in successfully");
  } catch (error: any) {
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
      try {
        // Create admin user if not exists
        await createUserWithEmailAndPassword(auth, adminEmail, defaultPassword);
        console.log("Admin user created successfully");
      } catch (createError) {
        console.error("Failed to create admin user:", createError);
      }
    } else {
      console.error("Admin login error:", error);
    }
  }

  // Ensure admin config exists in Firestore
  try {
    const configDoc = await getDoc(doc(db, "config", "admin"));
    if (!configDoc.exists()) {
      await setDoc(doc(db, "config", "admin"), {
        adminPassword: defaultPassword
      });
      console.log("Admin config bootstrapped in Firestore");
    }
  } catch (error) {
    console.error("Error bootstrapping admin config:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Bootstrap Firebase Admin
  await bootstrapAdmin();

  // --- API Routes ---

  // Register a new user
  app.post("/api/register", async (req, res) => {
    const { name, email, reason } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    try {
      // Check if email already exists in Firestore
      const q = query(collection(db, "requests"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const newUser = {
        name,
        email,
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "requests"), newUser);
      const userWithId = { ...newUser, id: docRef.id };

      // Notify Admin
      if (process.env.ADMIN_EMAIL) {
        await sendEmail(
          process.env.ADMIN_EMAIL,
          "New Verification Request: " + name,
          `New registration request from ${name} (${email}). Reason: ${reason}`,
          `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #F27D26;">New Verification Request</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p>Log in to the admin panel to approve or reject this request.</p>
              <a href="${process.env.APP_URL || '#'}" style="display: inline-block; padding: 10px 20px; background: #F27D26; color: white; text-decoration: none; border-radius: 5px;">Go to Admin Panel</a>
            </div>
          `
        );
      }

      res.json(userWithId);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  // Check user status
  app.get("/api/status/:email", async (req, res) => {
    try {
      const q = query(collection(db, "requests"), where("email", "==", req.params.email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return res.status(404).json({ error: "User not found" });
      }
      const doc = querySnapshot.docs[0];
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ error: "Failed to check status" });
    }
  });

  // Admin Login
  app.post("/api/admin/login", async (req, res) => {
    const { password } = req.body;
    try {
      const configDoc = await getDoc(doc(db, "config", "admin"));
      if (configDoc.exists() && password === configDoc.data().adminPassword) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get all users (Admin only)
  app.get("/api/admin/users", async (req, res) => {
    try {
      const querySnapshot = await getDocs(collection(db, "requests"));
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(users);
    } catch (error) {
      console.error("Fetch users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Delete a request (Admin only)
  app.delete("/api/admin/delete-request/:userId", async (req, res) => {
    try {
      await deleteDoc(doc(db, "requests", req.params.userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete request error:", error);
      res.status(500).json({ error: "Failed to delete request" });
    }
  });

  // Update user status (Admin only)
  app.post("/api/admin/update-status", async (req, res) => {
    const { userId, status } = req.body;
    try {
      const userRef = doc(db, "requests", userId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return res.status(404).json({ error: "User not found" });

      const userData = userDoc.data();
      const updateData: any = { status };

      // Generate unique Student ID if approved and doesn't have one
      if (status === "approved" && !userData.studentId) {
        const year = new Date().getFullYear();
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        updateData.studentId = `LARA-${year}-${randomPart}`;
      }

      await updateDoc(userRef, updateData);
      const updatedUser = { ...userData, ...updateData, id: userId };

      // Notify User
      const subject = status === "approved" ? "Access Granted: Vignan's LARA Portal" : "Access Request Update: Vignan's LARA Portal";
      const message = status === "approved" 
        ? `Hello ${userData.name}, your request for access to the Vignan's LARA student portal has been APPROVED. You can now log in and explore the portal.`
        : `Hello ${userData.name}, we regret to inform you that your request for access to the Vignan's LARA student portal has been REJECTED at this time.`;

      await sendEmail(
        userData.email,
        subject,
        message,
        `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: ${status === 'approved' ? '#10B981' : '#EF4444'};">Access Request ${status.toUpperCase()}</h2>
            <p>Hello <strong>${userData.name}</strong>,</p>
            <p>${message}</p>
            ${status === 'approved' ? `
              <div style="margin-top: 20px;">
                <a href="${process.env.APP_URL || '#'}" style="display: inline-block; padding: 10px 20px; background: #F27D26; color: white; text-decoration: none; border-radius: 5px;">Enter Student Portal</a>
              </div>
            ` : ''}
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated message from Vignan's LARA Digital Identity Portal.</p>
          </div>
        `
      );

      res.json(updatedUser);
    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
