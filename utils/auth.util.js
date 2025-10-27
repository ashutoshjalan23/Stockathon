

import mongoose from "mongoose";
import Auth from "../models/auth.model.js";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export const authLogin = async (req, res, next) => {
    try {
        const { name, password } = req.query; // Use req.query for GET requests
        const auth = await Auth.findOne({ name });

        if (auth && password === auth.password) {
            // Generate JWT
            const token = jwt.sign({ userId: auth._id, role: auth.role }, JWT_SECRET, {
                expiresIn: '1h',
            });

            console.log("Admin logged in");
            // Send token and user info back
            res.status(200).json({
                message: 'Admin logged in successfully',
                token,
                user: { 
                    _id: auth._id,
                    name: auth.name, 
                    role: auth.role 
                },
            });
        } else {
            // Handle invalid credentials
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const authCreate = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { name, password } = req.body;
        const auth = await Auth.create([{ name, password }], { session });
        console.log(auth);
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ message: "Admin created", auth: auth[0] });

    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Auth.find().select('name _id role');
        
        if(admins) {
            res.status(200).json({
                message: "Admins retrieved successfully",
                admins: admins
            });
        } else {
            res.status(404).json({ message: "No admins found" });
        }
    } catch(error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: "Error fetching admins", error: error.message });
    }
};