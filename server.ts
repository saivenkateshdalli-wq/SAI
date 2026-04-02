import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const DATA_FILE = path.join(process.cwd(), "data.json");

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], adminPassword: "admin123" }, null, 2));
}

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to read/write data
  const getData = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const saveData = (data: any) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  // --- API Routes ---

  // Register a new user
  app.post("/api/register", async (req, res) => {
    const { name, email, reason } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    const data = getData();
    const existingUser = data.users.find((u: any) => u.email === email);
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    saveData(data);

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

    res.json(newUser);
  });

  // Check user status
  app.get("/api/status/:email", (req, res) => {
    const data = getData();
    const user = data.users.find((u: any) => u.email === req.params.email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const data = getData();
    if (password === data.adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  // Get all users (Admin only)
  app.get("/api/admin/users", (req, res) => {
    const data = getData();
    res.json(data.users);
  });

  // Update user status (Admin only)
  app.post("/api/admin/update-status", async (req, res) => {
    const { userId, status } = req.body;
    const data = getData();
    const userIndex = data.users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    const user = data.users[userIndex];
    user.status = status;
    
    // Generate unique Student ID if approved and doesn't have one
    if (status === "approved" && !user.studentId) {
      const year = new Date().getFullYear();
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      user.studentId = `LARA-${year}-${randomPart}`;
    }
    
    saveData(data);

    // Notify User
    const subject = status === "approved" ? "Access Granted: Vignan's LARA Portal" : "Access Request Update: Vignan's LARA Portal";
    const message = status === "approved" 
      ? `Hello ${user.name}, your request for access to the Vignan's LARA student portal has been APPROVED. You can now log in and explore the portal.`
      : `Hello ${user.name}, we regret to inform you that your request for access to the Vignan's LARA student portal has been REJECTED at this time.`;

    await sendEmail(
      user.email,
      subject,
      message,
      `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: ${status === 'approved' ? '#10B981' : '#EF4444'};">Access Request ${status.toUpperCase()}</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
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

    res.json(user);
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
