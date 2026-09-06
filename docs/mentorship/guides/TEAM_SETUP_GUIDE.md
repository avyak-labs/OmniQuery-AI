# Local AI Automation Setup Guide: Google Sheets to WhatsApp

Follow these steps to replicate the AI task notification system on your local machine.

## Prerequisites
- **Node.js:** v18+ installed.
- **Homebrew:** (For Mac users) to install Ollama.
- **Google Account:** To access Sheets and Cloud Console.
- **Twilio Account:** Free trial for WhatsApp Sandbox.

---

## Step 1: Install & Start n8n (Automation Engine)
n8n will run locally and orchestrate the workflow.

1.  **Install n8n globally:**
    ```bash
    npm install -g n8n
    ```
2.  **Start n8n:**
    ```bash
    npx n8n
    ```
3.  **Access n8n:** Open [http://localhost:5678](http://localhost:5678) and create your owner account.

---

## Step 2: Install & Start Ollama (Local AI)
This allows you to run Llama 3 locally for free.

1.  **Download Ollama:** From [ollama.com](https://ollama.com/).
2.  **Download Llama 3:** Open a terminal and run:
    ```bash
    ollama run llama3
    ```
3.  **Start with External Access:** Stop the previous command (Ctrl+C) and restart it to allow n8n to connect:
    ```bash
    OLLAMA_ORIGINS="*" ollama serve
    ```

---

## Step 3: Expose n8n to the Internet (Localtunnel)
Google Sheets needs a public URL to send data back to your laptop.

1.  **Start the tunnel:**
    ```bash
    npx localtunnel --port 5678
    ```
2.  **Note your URL:** It will look like `https://xxxx-xxxx-xxxx.loca.lt`.
3.  **Important:** Use this URL in your Google Cloud OAuth settings.

---

## Step 4: Google Cloud Configuration
1.  **Create a Project:** In [Google Cloud Console](https://console.cloud.google.com/).
2.  **Enable APIs:** Enable both **Google Sheets API** AND **Google Drive API**.
3.  **OAuth Consent Screen:** 
    - Set to "External".
    - Add your email as a **Test User**.
4.  **Create Credentials:** 
    - Create "OAuth Client ID" (Web Application).
    - **Redirect URI:** Use `https://YOUR_TUNNEL_URL/rest/oauth2-credential/callback`.
    - Copy your **Client ID** and **Client Secret**.

---

## Step 5: Twilio WhatsApp Sandbox
1.  **Sign up:** At [twilio.com](https://www.twilio.com/).
2.  **Join Sandbox:** 
    - Go to "Messaging > Try it out > Send a WhatsApp message".
    - Send the "join <code-name>" message from your phone to the Twilio number.
3.  **Credentials:** Copy your **Account SID** and **Auth Token**.

---

## Step 6: Import the n8n Workflow
1.  In n8n, create a new workflow.
2.  Copy the JSON from the `n8n_multi_tab_workflow.json` file in this repository.
3.  Paste it onto the n8n canvas.
4.  **Connect Credentials:**
    - **Ollama:** Use `http://127.0.0.1:11434`.
    - **Google Sheets:** Paste your Client ID/Secret and sign in.
    - **Twilio:** Paste your SID/Auth Token.

---

## Troubleshooting Tips
- **Empty Output in n8n:** If you don't see data, click the "Fetch Test Event" button in the Google Sheets Trigger node.
- **Ollama Connection Refused:** Ensure you are using `127.0.0.1` instead of `localhost` in the n8n credential settings.
- **Failed WhatsApps:** Ensure the recipient has sent the "join" code to the Twilio number in the last 24 hours.
