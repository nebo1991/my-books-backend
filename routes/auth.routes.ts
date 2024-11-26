const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const authMiddleware = require("../middleware/auth.middleware");
require("dotenv").config();

const authRouter = express.Router();

require("dotenv").config();
