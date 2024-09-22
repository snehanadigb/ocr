const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();  // Prisma client instance

// POST route for Aadhaar verification
router.post('/verify', async (req, res) => {
    const { aadharNumber } = req.body;
    try {
        const user = await prisma.aadharUser.findUnique({
            where: { aadharNumber }
        });
        if (user) {
            console.log("verified");
            res.status(200).json({
                success: true,
                message: 'Aadhaar number verified',
                userDetails: user,
                status: 'verified'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Aadhaar number not found',
                status: 'not_verified'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error: ${error.message}`
        });
    }
});

module.exports = router;
