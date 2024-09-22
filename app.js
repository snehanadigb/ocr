const express = require('express');
const path = require('path');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const verifyRoutes = require('./routes/verify');  // Aadhaar verification route

const app = express();
app.use(express.json());  // Ensure JSON body parsing

// Serve verification routes
app.use('/api', verifyRoutes);  // `/api/verify` is now the correct route for verification

app.post('/extract', (req, res) => {
    const { filePath } = req.body;
    if (!filePath) {
        return res.status(400).json({ success: false, message: 'No file path provided' });
    }

    Tesseract.recognize(
        path.resolve(filePath),
        'eng',
        {}
    )
    .then(({ data: { text } }) => {
        const aadharNumber = text.match(/\d{4}\s\d{4}\s\d{4}/);
        if (aadharNumber) {
            const extractedAadhar = aadharNumber[0].replace(/\s/g, '');
            return axios.post('http://localhost:5009/api/verify', {
                aadharNumber: extractedAadhar
            })
            .then(response => {
                res.status(200).json({
                    success: true,
                    message: 'Aadhaar number extracted and verified',
                    verificationResponse: response.data
                });
            });
        } else {
            // Log the absence of Aadhaar number and respond
            console.log('No Aadhaar number found in the image');
            return res.status(200).json({
                success: false,
                message: 'No Aadhaar number found in the image'
            });
        }
    })
    .catch(err => {
        console.error(`Error extracting Aadhaar number: ${err.message}`);
        res.status(500).json({ success: false, message: `Error extracting Aadhaar number: ${err.message}` });
    });
});



app.listen(5009, () => {
    console.log('Aadhaar verification service running on http://localhost:5009');
});
