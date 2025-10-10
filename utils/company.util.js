import mongoose from "mongoose";
import Company from '../models/company.model.js';

export const companyCreator = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Input validation
        if (!name) {
            return res.status(400).json({ error: "Company name is required" });
        }

        const company = await Company.create({ name: name });
        
        res.status(201).json({ 
            message: "Company created successfully", 
            company 
        });
        
    } catch (error) {
        console.error("Error creating company:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};