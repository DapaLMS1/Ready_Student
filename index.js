const express = require('express');
const axios = require('axios');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
const client = new SecretManagerServiceClient();

// Helper to get secret - wrap in try/catch so it doesn't crash the whole app
async function getSecret() {
    const name = 'projects/205993130602/secrets/READY_STUDENT_SECRET/versions/latest';
    try {
        const [version] = await client.accessSecretVersion({ name });
        return version.payload.data.toString().trim();
    } catch (err) {
        console.error("SECRET ERROR:", err.message);
        throw new Error("Could not retrieve API token from Secret Manager.");
    }
}

app.get('/', async (req, res) => {
    const studentId = req.query.id;
    
    // Status Check
    if (!studentId) {
        return res.status(200).send("Bridge is Online. Usage: ?id=12345");
    }

    try {
        const token = await getSecret();
        const response = await axios.get(`https://dapa.jobreadyplus.com/api/parties/${studentId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Accept': 'application/json' 
            }
        });
        res.json(response.data);
    } catch (err) {
        console.error("APP ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// CRITICAL: Start listening IMMEDIATELY
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Bridge server is running on port ${port}`);
});
