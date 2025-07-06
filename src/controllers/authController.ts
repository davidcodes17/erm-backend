import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { loginSchema, signupSchema } from "../schema/auth-schema";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const { email, password } = value;

    const admin = await prisma.admin.findUnique({ where: { email : email } });
    if (!admin) {
      res.status(404).json({ message: "Admin not found", success: false });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid Password", success: false });
      return;
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Sign In Successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
      success: true,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", success: false });
    return;
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const { fullName, email, password, role } = value;


    const isPresent = await prisma.admin.findUnique({
      where: {
        email: email,
      },
    });

    if (isPresent) {
      res.status(400).json({ message: "User Already Exsists", success: false });
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        fullName: fullName,
        email: email,
        password: encryptedPassword,
        role: role,
      },
    });

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Account Created Successfully",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
      success: true,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};
