const express = require('express');
const axios = require('axios');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
const client = new SecretManagerServiceClient();

// Helper to get secret
async function getSecret() {
    // I updated the name below to match your "READY_STUDENT_SECRET"
    const name = 'projects/205993130602/secrets/READY_STUDENT_SECRET/versions/latest';
    
    try {
        const [version] = await client.accessSecretVersion({ name });
        return version.payload.data.toString().trim();
    } catch (err) {
        console.error("FAILED TO FETCH SECRET:", err.message);
        throw err; // This will show up in your Cloud Run logs
    }
}

// THE MAIN LOGIC
app.get('/', async (req, res) => {
    const studentId = req.query.id;
    if (!studentId) return res.send("Bridge is Active. Please provide an ID like ?id=123");

    try {
        const token = await getSecret();
        const response = await axios.get(`https://dapa.jobreadyplus.com/api/parties/${studentId}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

// CRITICAL: Cloud Run needs the server to listen on the port Google provides
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Bridge listening on port ${port}`);
});
