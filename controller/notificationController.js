const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const path = require("path");

const serviceAccountPath = path.resolve(__dirname, "../serviceAccount.json");

const projectId = "photoesapp-ab3d1";

async function getAccessToken() {
  try {
    const client = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const authClient = await client.getClient();
    const tokenResponse = await authClient.getAccessToken();
    return tokenResponse.token || tokenResponse; // ensure token string
  } catch (error) {
    console.error('Error generating access token:', error.message);
    throw new Error('Failed to generate access token');
  }
}

exports.sendNotifications = async (req, res) => {
    console.log(serviceAccountPath,"ERrrer-->")
  try {
    const { tokens, title, body } = req.body;

     if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'No device tokens provided' });
    }

    const message = {
      message: {
        token: tokens[0], // HTTP v1 supports one token per message. For multiple, loop through tokens.
        notification: {
          title,
          body,
        },
      },
    };

    const accessToken = await getAccessToken();
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const response = await axios.post(url, message, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json({
      message: "Notification sent successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("FCM Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send notification" });
  }
};
