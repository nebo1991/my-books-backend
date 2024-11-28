import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import authMiddleware, {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

require("dotenv").config();

const libraryRouter = express.Router();

libraryRouter.post(
  "/libraries",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId =
        typeof req.user === "object" && "id" in req.user
          ? (req.user as { id: number }).id
          : null;

      if (!userId) {
        res.status(403).json({ message: "Unauthorized - invalid user" });
        return;
      }

      // Check if a library already exists for the user
      const existingLibrary = await prisma.library.findFirst({
        where: { createdById: userId },
      });

      if (existingLibrary) {
        res.status(400).json({ message: "You already have a library" });
        return;
      }

      // Create a new library
      const newLibrary = await prisma.library.create({
        data: {
          name: req.body.name,
          createdById: userId,
          books: {
            connect: (req.body.books || []).map((bookId: number) => ({
              id: bookId,
            })),
          },
        },
      });

      console.log("New Library Created:", newLibrary);

      // Return the newly created library
      res.status(201).json(newLibrary);
    } catch (error: unknown) {
      console.error("Error creating library:", error);

      if (error instanceof Error) {
        res.status(400).json({
          message: error.message || "Error creating library",
        });
      } else {
        res.status(400).json({
          message: "Unknown error occurred",
        });
      }
    }
  }
);

libraryRouter.get(
  "/libraries",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Fetch all libraries with their associated books
      const foundLibraries = await prisma.library.findMany({
        include: {
          books: true, // Include related books
        },
      });

      res.status(200).json(foundLibraries);
    } catch (error: unknown) {
      console.error("Error when fetching the libraries:", error);

      if (error instanceof Error) {
        res.status(400).json({
          message: "Error when fetching the libraries",
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

libraryRouter.get(
  "/libraries/:libraryId",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const libraryId = parseInt(req.params.libraryId, 10);

      const library = await prisma.library.findUnique({
        where: { id: libraryId },
        include: {
          books: true, // Include books if you want them to show up
        },
      });

      if (!library) {
        res.status(404).json({ message: "Library not found" });
        return;
      }

      res.status(200).json(library);
    } catch (error: unknown) {
      res.status(400).json({ message: "Error fetching library details" });
    }
  }
);

libraryRouter.put(
  "/libraries/:id",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { bookId } = req.body;

    // Check if `req.user` is undefined or if it doesn't have `id` (type guard)
    if (!req.user || typeof req.user === "string" || !req.user.id) {
      res.status(400).json({ message: "Invalid or missing user data" });
      return; // `return` ensures the function exits early
    }

    const userId = req.user.id; // It's now safe to access `id` because we've confirmed it's not undefined or a string.

    try {
      // Validate Library ID
      const libraryId = parseInt(id, 10);
      if (isNaN(libraryId)) {
        res.status(400).json({ message: "Invalid Library ID" });
        return; // Exit the function if the ID is invalid
      }

      // Fetch the library by ID
      const library = await prisma.library.findUnique({
        where: { id: libraryId },
        include: { books: true }, // Include related books
      });

      if (!library) {
        res.status(404).json({ message: "Library not found" });
        return; // Exit if the library is not found
      }

      // Check ownership
      if (library.createdById !== userId) {
        res.status(403).json({
          message:
            "Unauthorized - you can only update libraries you have created",
        });
        return; // Exit if the user is not authorized
      }

      // Ensure `bookId` is provided
      if (!bookId) {
        res.status(400).json({ message: "No bookId provided" });
        return; // Exit if no bookId is provided
      }

      // Check if the book already exists in the library
      const isBookAlreadyInLibrary = library.books.some(
        (book) => book.id === parseInt(bookId, 10)
      );
      if (isBookAlreadyInLibrary) {
        res.status(400).json({ message: "The book is already in the library" });
        return; // Exit if the book is already in the library
      }

      // Add the book to the library
      const updatedLibrary = await prisma.library.update({
        where: { id: libraryId },
        data: {
          books: {
            connect: { id: parseInt(bookId, 10) }, // Connect the book by its ID
          },
        },
        include: { books: true }, // Include related books in the updated response
      });

      res.status(200).json(updatedLibrary); // Send the updated library
    } catch (error: unknown) {
      console.error("Error while updating the library:", error);

      if (error instanceof Error) {
        res.status(400).json({
          message: "Error while updating the library",
          error: error.message,
        });
      } else {
        res.status(400).json({ message: "Unknown error occurred" });
      }
    }
  }
);

libraryRouter.put(
  "/libraries/:id/remove-book",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { bookId } = req.body;

    // Check if `req.user` is undefined or if it doesn't have `id` (type guard)
    if (!req.user || typeof req.user === "string" || !req.user.id) {
      res.status(400).json({ message: "Invalid or missing user data" });
      return; // Exit early if user data is invalid
    }

    const userId = req.user.id; // It's now safe to access `id` because we've confirmed it's not undefined or a string.

    try {
      // Validate Library ID
      const libraryId = parseInt(id, 10);
      if (isNaN(libraryId)) {
        res.status(400).json({ message: "Invalid Library ID" });
        return; // Exit if the ID is invalid
      }

      // Fetch the library by ID
      const library = await prisma.library.findUnique({
        where: { id: libraryId },
        include: { books: true }, // Include related books
      });

      if (!library) {
        res.status(404).json({ message: "Library not found" });
        return; // Exit if the library is not found
      }

      // Check ownership
      if (library.createdById !== userId) {
        res.status(403).json({
          message:
            "Unauthorized - you can only update libraries you have created",
        });
        return; // Exit if the user is not authorized
      }

      // Ensure `bookId` is provided
      if (!bookId) {
        res.status(400).json({ message: "No bookId provided" });
        return; // Exit if no bookId is provided
      }

      // Check if the book exists in the library
      const isBookInLibrary = library.books.some(
        (book) => book.id === parseInt(bookId, 10)
      );
      if (!isBookInLibrary) {
        res.status(400).json({ message: "The book is not in the library" });
        return; // Exit if the book is not in the library
      }

      // Remove the book from the library
      const updatedLibrary = await prisma.library.update({
        where: { id: libraryId },
        data: {
          books: {
            disconnect: { id: parseInt(bookId, 10) }, // Disconnect the book by its ID
          },
        },
        include: { books: true }, // Include related books in the updated response
      });

      res.status(200).json(updatedLibrary); // Send the updated library
    } catch (error: unknown) {
      console.error("Error while removing the book from the library:", error);

      if (error instanceof Error) {
        res.status(400).json({
          message: "Error while removing the book from the library",
          error: error.message,
        });
      } else {
        res.status(400).json({ message: "Unknown error occurred" });
      }
    }
  }
);

libraryRouter;

module.exports = libraryRouter;
