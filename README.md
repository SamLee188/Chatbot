# AI Chatbot

A modern, responsive chatbot application built with HTML, CSS, JavaScript frontend and Node.js backend that integrates with OpenAI's GPT API.

## Features

- 🤖 **AI-Powered Responses**: Uses OpenAI's GPT-3.5-turbo model for intelligent conversations
- 💬 **Real-time Chat Interface**: Modern, responsive chat UI with typing indicators
- 🎨 **Beautiful Design**: Clean, gradient-based design with smooth animations
- 📱 **Mobile Responsive**: Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Fast & Lightweight**: Optimized for performance and user experience
- 🔒 **Secure**: API key stored securely in environment variables

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- OpenAI API key

## Setup Instructions

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd Chatbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```
OPENAI_API_KEY=your_actual_openai_api_key_here
```

**Important**: Replace `your_actual_openai_api_key_here` with your real OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys).

### 4. Start the Server

For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

### 5. Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
Chatbot/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   └── script.js           # Frontend JavaScript
├── server.js               # Node.js backend server
├── package.json            # Dependencies and scripts
├── env.example             # Environment variables template
└── README.md               # This file
```

## API Endpoints

- `POST /api/chat` - Send a message to the chatbot
- `GET /api/health` - Check server status

## Customization

### Changing the AI Model

In `server.js`, you can modify the OpenAI model by changing the `model` parameter:

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-4", // Change to gpt-4 for more advanced responses
  // ... other parameters
});
```

### Adjusting Response Parameters

You can customize the AI responses by modifying these parameters in `server.js`:

- `max_tokens`: Maximum length of the response (default: 150)
- `temperature`: Controls randomness (0.0 = deterministic, 1.0 = very random)
- `system` message: Defines the AI's personality and behavior

### Styling Customization

The chatbot's appearance can be customized by editing `public/styles.css`. The design uses CSS custom properties and modern CSS features.

## Troubleshooting

### Common Issues

1. **"Cannot connect to server" error**
   - Make sure the Node.js server is running
   - Check if port 3000 is available
   - Verify the server started without errors

2. **"Failed to get response from OpenAI" error**
   - Verify your OpenAI API key is correct
   - Check if you have sufficient API credits
   - Ensure your API key has the necessary permissions

3. **CORS errors**
   - The server is configured with CORS enabled
   - If issues persist, check browser console for specific error messages

### Getting Help

If you encounter any issues:

1. Check the browser's developer console for error messages
2. Verify your OpenAI API key is valid and has credits
3. Ensure all dependencies are installed correctly
4. Check that the server is running on the correct port

## Security Notes

- Never commit your `.env` file to version control
- Keep your OpenAI API key secure and private
- Consider implementing rate limiting for production use
- Use HTTPS in production environments

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this chatbot application. 