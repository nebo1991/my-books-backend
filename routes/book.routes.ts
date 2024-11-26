import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import authMiddleware from "../middleware/auth.middleware";

require("dotenv").config();

const bookRouter = express.Router();

bookRouter.get("/books", async (req: Request, res: Response) => {
  try {
    const foundBooks = await prisma.book.findMany({});
    res.status(201).json(foundBooks);
  } catch (error) {
    res.json({ message: "No books found" }).send();
  }
});

bookRouter;

module.exports = bookRouter;
