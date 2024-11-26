import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import authMiddleware from "../middleware/auth.middleware";

require("dotenv").config();

const authRouter = express.Router();

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: "Provide email, password and name" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Provide a valid email address." });
      return;
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
      });
      return;
    }

    const foundUser = await prisma.user.findFirst({ where: { email } });
    if (foundUser) {
      console.log(foundUser);
      res.status(400).json({ message: "User already exists." });
      return;
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const createdUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    res.status(201).json(createdUser);
  } catch (error) {
    console.log(error);
  }
});

authRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        res.status(400).json({ message: "Provide email and password." });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Provide a valid email address." });
        return;
      }

      const foundUser = await prisma.user.findFirst({ where: { email } });
      if (!foundUser) {
        res.status(400).json({ message: "Wrong credentials." });
        return;
      }

      const isPasswordMatch = bcrypt.compareSync(password, foundUser.password);
      if (!isPasswordMatch) {
        res.status(400).json({ message: "Wrong credentials." });
        return;
      }

      const { id, name } = foundUser;
      const payload = { id, email, name };

      if (!process.env.TOKEN_SECRET) {
        throw new Error("TOKEN_SECRET environment variable is not defined");
      }

      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });

      res.status(200).json({ authToken: authToken, id });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

authRouter.get("/verify", authMiddleware, (req, res: Response, next) => {
  try {
    res.status(200).json({ loggedIn: true });
  } catch (error) {
    console.log(error);
  }
});

authRouter.get(
  "/user",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userPayload = (req as any).user; // Cast req as any to access custom fields
      if (
        !userPayload ||
        typeof userPayload !== "object" ||
        !("id" in userPayload)
      ) {
        res.status(401).json({ message: "Unauthorized access." }); // Call res, don't return it
        return; // Make sure to return after sending the response
      }

      const user = await prisma.user.findUnique({
        where: { id: userPayload.id },
        include: {
          library: true, // Include the user's library data
          books: true, // Optionally include books if needed
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found." }); // Call res, don't return it
        return; // Make sure to return after sending the response
      }

      // Send the response but don't return it
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      next(error); // Pass error to the next middleware
    }
  }
);

authRouter;

module.exports = authRouter;
