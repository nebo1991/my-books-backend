import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import authMiddleware, {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

require("dotenv").config();

const noteRouter = express.Router();

noteRouter.post(
  "/notes",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Safely extract user ID from req.user
      const userId =
        typeof req.user === "object" && "id" in req.user
          ? (req.user as { id: number }).id
          : null;

      if (!userId) {
        res.status(403).json({ message: "Unauthorized - invalid user" });
        return;
      }

      // Create a new library
      const newNote = await prisma.note.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          createdById: userId,
        },
      });

      console.log("New Note created:", newNote);
      res.status(201).json(newNote);
    } catch (error: unknown) {
      console.error("Error creating note:", error);

      if (error instanceof Error) {
        res.status(400).json({
          message: error.message || "Error creating note",
        });
      } else {
        res.status(400).json({
          message: "Unknown error occurred",
        });
      }
    }
  }
);

noteRouter.get(
  "/notes",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Extract user ID from the authenticated request
      const userId =
        typeof req.user === "object" && "id" in req.user
          ? (req.user as { id: number }).id
          : null;

      if (!userId) {
        res.status(403).json({ message: "Unauthorized - invalid user" });
        return;
      }

      // Fetch all notes created by the authenticated user
      const userNotes = await prisma.note.findMany({
        where: {
          createdById: userId, // Filter notes by the user's ID
        },
      });

      res.status(200).json(userNotes);
    } catch (error: unknown) {
      console.error("Error when fetching the user's notes:", error);

      if (error instanceof Error) {
        res.status(400).json({
          message: "Error when fetching the user's notes",
          error: error.message,
        });
      } else {
        res.status(400).json({
          message: "Unknown error occurred",
        });
      }
    }
  }
);

noteRouter.get(
  "/notes/:id",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // Parse the ID as an integer (assuming your database uses numeric IDs)
      const noteId = parseInt(id, 10);
      if (isNaN(noteId)) {
        res.status(400).json({ message: "Invalid library ID" });
        return;
      }

      // Fetch the library by ID and include related books
      const foundNote = await prisma.note.findUnique({
        where: {
          id: noteId,
        },
      });

      // Handle case where the library is not found
      if (!foundNote) {
        res.status(404).json({ message: "Library not found" });
        return;
      }

      res.status(200).json(foundNote);
    } catch (error: unknown) {
      console.error("Error when fetching the library:", error);

      if (error instanceof Error) {
        res.status(400).json({
          message: "Error when fetching the library",
          error: error.message,
        });
      } else {
        res.status(400).json({
          message: "Unknown error occurred",
        });
      }
    }
  }
);

noteRouter.delete(
  "/notes/:id",
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
      const note = await prisma.note.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!note) {
        res.status(404).json({ message: "Book not found" });
        return;
      }

      // Check if the authenticated user is the creator of the book
      if (note.createdById !== userId) {
        res.status(403).json({
          message: "Unauthorized - you can only delete books you've created",
        });
        return;
      }

      // Delete the book
      await prisma.note.delete({
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

noteRouter;

module.exports = noteRouter;
