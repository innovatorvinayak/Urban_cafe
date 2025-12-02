import { RequestHandler } from "express";
import { query } from "../db/connection";

// Simple login (in production, use JWT and bcrypt for password hashing)
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = await query(
      "SELECT id, email, name, role, is_active FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = (users as any[])[0];

    if (!user.is_active) {
      return res.status(403).json({ error: "User account is inactive" });
    }

    // In production, generate JWT token here
    res.json({
      token: `token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get current user (verify token in production)
export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    // In production, verify JWT token from Authorization header
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const users = await query(
      "SELECT id, email, name, role, is_active FROM users WHERE id = ?",
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = (users as any[])[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

