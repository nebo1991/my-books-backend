import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import authMiddleware, {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

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

bookRouter.post(
  "/books",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user || typeof req.user === "string" || !req.user.id) {
      res
        .status(400)
        .json({ message: "User not authenticated or invalid token" });
      return;
    }

    try {
      const newBook = await prisma.book.create({
        data: {
          title: req.body.title,
          author: req.body.author,
          description: req.body.description,
          pages: req.body.pages,
          image: req.body.image,
          createdBy: {
            connect: { id: req.user.id }, // Correct relation syntax
          },
        },
      });

      res.status(201).json(newBook);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res
          .status(400)
          .json({ message: "Error creating book", error: error.message });
      } else {
        res
          .status(400)
          .json({ message: "Error creating book", error: "Unknown error" });
      }
    }
  }
);

bookRouter.get(
  "/books/:id",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // Extract the book ID from the URL params

    try {
      // Use Prisma to find the book by its ID
      const book = await prisma.book.findUnique({
        where: { id: parseInt(id, 10) }, // Ensure the ID is parsed as an integer
      });

      if (!book) {
        res.status(404).json({ message: "Book not found" });
        return; // Stop further execution after sending a response
      }

      res.status(200).json(book);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({
          message: "Error while fetching the book",
          error: error.message,
        });
      } else {
        res.status(400).json({
          message: "Error while fetching the book",
          error: "Unknown error",
        });
      }
    }
  }
);

bookRouter.delete(
  "/books/:id",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // Safely cast `req.user` to an object with an `id` property
      const userId =
        typeof req.user === "object" && "id" in req.user
          ? (req.user as { id: number }).id
          : null;

      if (!userId) {
        res.status(403).json({ message: "Unauthorized - invalid user" });
        return;
      }

      // Find the book by ID
      const book = await prisma.book.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!book) {
        res.status(404).json({ message: "Book not found" });
        return;
      }

      // Check if the authenticated user is the creator of the book
      if (book.createdById !== userId) {
        res.status(403).json({
          message: "Unauthorized - you can only delete books you've created",
        });
        return;
      }

      // Delete the book
      await prisma.book.delete({
        where: { id: parseInt(id, 10) },
      });

      res.json({ message: "Book successfully deleted" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({
          message: "Error deleting book",
          error: error.message,
        });
      } else {
        res.status(400).json({
          message: "Error deleting book",
          error: "Unknown error",
        });
      }
    }
  }
);

bookRouter;

module.exports = bookRouter;
