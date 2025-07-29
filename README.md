# AI Chatbot

A simple, modern chatbot website built with HTML, CSS, JavaScript frontend and Node.js backend that integrates with OpenAI's GPT API.

## Features

- 🎨 Modern, responsive UI with beautiful gradient design
- 🤖 Real-time chat with OpenAI GPT-3.5-turbo
- 💬 Smooth animations and typing indicators
- 📱 Mobile-friendly responsive design
- 🔒 Secure API key management with environment variables
- ⚡ Fast and lightweight

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- OpenAI API key

## Setup Instructions

### 1. Clone or Download the Project

Make sure you have all the files in your project directory:
- `index.html`
- `styles.css`
- `script.js`
- `server.js`
- `package.json`
- `.env`

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Edit the `.env` file and replace `your_openai_api_key_here` with your actual API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3000
```

### 4. Start the Server

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
Chatbot/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # Frontend JavaScript
├── server.js           # Node.js backend server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (API key)
└── README.md          # This file
```

## API Endpoints

- `GET /` - Serves the main HTML page
- `POST /api/chat` - Handles chat messages and returns AI responses
- `GET /api/health` - Health check endpoint

## Customization

### Changing the AI Model

In `server.js`, you can modify the OpenAI model by changing the `model` parameter:

```javascript
model: "gpt-4", // or "gpt-3.5-turbo", "gpt-4-turbo-preview", etc.
```

### Adjusting Response Parameters

You can modify the AI response behavior by changing these parameters in `server.js`:

```javascript
max_tokens: 500,    // Maximum response length
temperature: 0.7,   // Creativity level (0.0 = very focused, 1.0 = very creative)
```

### Styling Customization

The chatbot appearance can be customized by modifying `styles.css`. The design uses CSS custom properties and modern CSS features.

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Make sure your OpenAI API key is correctly set in the `.env` file
   - Verify the API key is valid and has sufficient credits

2. **"Cannot connect to server" error**
   - Ensure the Node.js server is running (`npm start`)
   - Check if port 3000 is available

3. **CORS errors**
   - The server includes CORS middleware, but if you're accessing from a different domain, you may need to configure it

### API Quota Issues

If you encounter quota exceeded errors:
- Check your OpenAI account usage at https://platform.openai.com/usage
- Consider upgrading your plan or waiting for quota reset

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore` to prevent accidental commits
- Keep your OpenAI API key secure and don't share it publicly

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **AI**: OpenAI GPT API
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Font Awesome

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork this project and submit pull requests for improvements! 