import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

require("dotenv").config();

const authRouter = express.Router();

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

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

authRouter;

module.exports = authRouter;
