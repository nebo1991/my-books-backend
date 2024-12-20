// auth.middleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend the Request interface to include `user`
export interface AuthenticatedRequest extends Request {
  user?: string | jwt.JwtPayload; // This could be your JWT payload or the user object
}

const authMiddleware = async (
  req: AuthenticatedRequest, // Use the extended Request type here
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const payload = jwt.verify(token, process.env.TOKEN_SECRET as string);
    console.log("payload: ", payload);

    req.user = payload; // Attach the payload to the request object

    next(); // Pass control to the next middleware
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
