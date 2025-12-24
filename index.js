const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const axios = require('axios');

const client = new SecretManagerServiceClient();

async function getSecret() {
  // Replace with your actual secret name/path from Google Cloud
  const [version] = await client.accessSecretVersion({
    name: 'projects/205993130602/secrets/READY_STUDENT_TOKEN/versions/latest',
  });
  return version.payload.data.toString();
}

exports.readyStudentBridge = async (req, res) => {
  // Set CORS headers so your GitHub HTML form can talk to this URL
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  const studentId = req.query.id || (req.body && req.body.id);

  if (!studentId) {
    return res.status(400).send('Missing Student ID');
  }

  try {
    const apiToken = await getSecret();
    
    // Ready Student API endpoint for a single Party (Student)
    const response = await axios.get(`https://dapa.jobreadyplus.com/api/parties/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Ready Student usually returns "first_name" and "last_name"
    const { first_name, last_name } = response.data;
    res.status(200).json({ 
      name: `${first_name} ${last_name}`,
      id: studentId 
    });

  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching student data');
  }
};
