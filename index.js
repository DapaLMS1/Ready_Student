const axios = require('axios');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

// 1. Function to grab your API token from Secret Manager
async function getReadyStudentToken() {
    const name = 'projects/205993130602/secrets/READY_STUDENT_TOKEN/versions/latest';
    const [version] = await client.accessSecretVersion({ name });
    return version.payload.data.toString().trim();
}

// 2. The main "Bridge" function
exports.readyStudentBridge = async (req, res) => {
    // Enable CORS so you can test from a browser or GitHub page
    res.set('Access-Control-Allow-Origin', '*');
    
    // Get the ID from the URL (e.g., ?id=12345)
    const studentId = req.query.id;

    if (!studentId) {
        return res.status(400).send('Please provide a Student ID. Example: ?id=12345');
    }

    try {
        const token = await getReadyStudentToken();
        
        // Replace 'dapa' with your actual Ready Student subdomain if different
        const url = `https://dapa.jobreadyplus.com/api/parties/${studentId}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        // Ready Student usually returns "first_name" and "last_name"
        const student = response.data;
        const fullName = `${student.first_name} ${student.last_name}`;

        res.status(200).send(`Student ID ${studentId} is: ${fullName}`);

    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).send('Could not find student or API connection failed.');
    }
};
