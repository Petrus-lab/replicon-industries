# Replicon Local AI Runner Bootstrap Script
# -----------------------------------------
# This script assumes Node.js and npm are already installed.
# It prepares a local environment for ChatGPT-style automation with secure access to GitHub, Firebase, and Vercel.

# Step 1: Create a project folder
mkdir replicon-local-runner
cd replicon-local-runner

# Step 2: Initialize a Node.js project
npm init -y

# Step 3: Install OpenAI SDK, dotenv for env variables, and axios for HTTP
npm install openai dotenv axios

# Step 4: Create basic structure
mkdir src
touch src/runner.js .env .gitignore

# Step 5: Setup .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore

# Done. Now you'll place your OpenAI key and secrets in the .env file:
# Example .env:
# OPENAI_API_KEY=your-openai-key
# GITHUB_TOKEN=your-github-pat
# FIREBASE_ADMIN_KEY_JSON=stringified-json