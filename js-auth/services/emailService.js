// services/emailService.js
require('dotenv').config(); // Ensure environment variables are loaded
const msal = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch'); // Required polyfill for Microsoft Graph client

const HttpsProxyAgent = require('https-proxy-agent');

const clientId = process.env.MICROSOFT_CLIENT_ID;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
const tenantId = process.env.MICROSOFT_TENANT_ID;
const emailSenderAddress = process.env.EMAIL_SENDER_ADDRESS;

if (!clientId || !clientSecret || !tenantId || !emailSenderAddress) {
    console.error('Email service: Missing one or more required environment variables (MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID, EMAIL_SENDER_ADDRESS)');
}

const msalConfig = {
    auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        clientSecret: clientSecret,
    }
};

const confidentialClientApplication = new msal.ConfidentialClientApplication(msalConfig);

// Function to acquire an access token
async function getGraphAccessToken() {
    const clientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default'], // .default scope for client credentials flow
    };
    try {
        const response = await confidentialClientApplication.acquireTokenByClientCredential(clientCredentialRequest);
        return response.accessToken;
    } catch (error) {
        console.error('Error acquiring Graph API access token:', error.errorCode, error.errorMessage, error.subError, error.correlationId);
        throw error;
    }
}

// Function to get an authenticated Graph client
async function getAuthenticatedClient() {
    const accessToken = await getGraphAccessToken();

    // Configure options for the graph client.
    // If you are behind a proxy, you need to configure the HttpsProxyAgent
    const agent = process.env.HTTPS_PROXY ? new HttpsProxyAgent(process.env.HTTPS_PROXY) : undefined;

    const client = Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
        // Configure the fetchOptions if you are behind a proxy
        fetchOptions: {
            agent: agent
        }
    });
    return client;
}

const sendPasswordResetEmail = async (toEmail, resetLink) => {
    if (!clientId || !clientSecret || !tenantId || !emailSenderAddress) {
        console.error("Email sending is disabled due to missing Microsoft Graph API credentials or sender address in .env");
        return false;
    }

    const subject = 'Password Reset Request';
    const bodyContent = `<p>Hello,</p>
                         <p>You requested a password reset. Click the link below to reset your password:</p>
                         <p><a href="${resetLink}">${resetLink}</a></p>
                         <p>If you did not request this, please ignore this email.</p>
                         <p>This link will expire in 1 hour.</p>
                         <p>Thanks,<br/>The ${process.env.APP_NAME || 'Application'} Team</p>`;

    const mail = {
        subject: subject,
        toRecipients: [{
            emailAddress: {
                address: toEmail,
            },
        }],
        body: {
            contentType: 'HTML', // Or 'Text'
            content: bodyContent,
        },
        // The 'from' field is sometimes optional if the service principal has a mailbox or
        // if the Mail.Send permission implies sending as the application itself from a default address.
        // However, to ensure it's sent from a specific address authorized for the app:
        from: {
            emailAddress: {
                address: emailSenderAddress
            }
        },
        // If your application needs to send "on behalf of" another user,
        // you would use 'sender' and require 'Mail.Send.Shared' permission.
        // For sending directly as the application (using Mail.Send application permission)
        // from a specific mailbox the app has rights to, 'from' is appropriate.
    };

    try {
        const client = await getAuthenticatedClient();
        // The user ID in sendMail is the user whose mailbox is used.
        // For application permissions, you might send mail as any user
        // if broadly permissioned, or you specify the sender.
        // Using 'emailSenderAddress' as the user ID assumes this is the mailbox the app is sending from.
        await client.api(`/users/${emailSenderAddress}/sendMail`).post({ message: mail });

        console.log('Password reset email sent via MS Graph API to:', toEmail);
        return true;
    } catch (error) {
        console.error('Error sending email via MS Graph API:');
        if (error.body) { // Graph API errors often have more details in the body
            try {
                const errorBody = JSON.parse(error.body);
                console.error('Error Code:', errorBody.error?.code);
                console.error('Error Message:', errorBody.error?.message);
            } catch (e) {
                console.error('Raw Error Body:', error.body);
            }
        } else {
            console.error(error);
        }
        return false;
    }
};

module.exports = {
    sendPasswordResetEmail,
};