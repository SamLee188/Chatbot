# Deployment Guide

This guide will help you deploy both the frontend and backend of your intelligent chatbot to production.

## 🚀 Quick Deployment Steps

### 1. Deploy Backend to Vercel

1. **Create a new repository for the backend** (or use a subdirectory)
2. **Copy backend files**:
   - `server.js`
   - `package.json`
   - `vercel.json`
   - `.env` (with your OpenAI API key)

3. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

4. **Set environment variables in Vercel**:
   - Go to your Vercel dashboard
   - Add `OPENAI_API_KEY` with your actual API key

5. **Get your backend URL** (e.g., `https://your-backend-name.vercel.app`)

### 2. Update Frontend Backend URL

1. **Update the backend URL** in `public/script.js`:
   ```javascript
   // Replace this line in the getBackendUrl() function
   return 'https://your-actual-backend-url.vercel.app';
   ```

2. **Deploy frontend to Vercel**:
   ```bash
   # Deploy frontend
   vercel
   ```

## 📁 File Structure for Deployment

### Backend Repository
```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── vercel.json        # Vercel configuration
└── .env              # Environment variables
```

### Frontend Repository
```
frontend/
├── public/
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styles
│   └── script.js      # JavaScript (updated with backend URL)
└── package.json       # Dependencies
```

## 🔧 Environment Variables

### Backend (.env)
```env
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
```

### Vercel Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: production

## 🌐 CORS Configuration

The backend is already configured to allow requests from:
- `https://*.vercel.app`
- `https://*.netlify.app`
- `https://*.herokuapp.com`
- `https://*.railway.app`
- `https://*.render.com`

## 📝 Step-by-Step Deployment

### Step 1: Prepare Backend

1. **Create a new directory for backend**:
   ```bash
   mkdir chatbot-backend
   cd chatbot-backend
   ```

2. **Copy backend files**:
   ```bash
   cp ../server.js .
   cp ../package.json .
   cp ../vercel.json .
   cp ../.env .
   ```

3. **Initialize git**:
   ```bash
   git init
   git add .
   git commit -m "Initial backend commit"
   ```

### Step 2: Deploy Backend

1. **Deploy to Vercel**:
   ```bash
   vercel
   ```

2. **Follow the prompts**:
   - Link to existing project: No
   - Project name: chatbot-backend
   - Directory: ./
   - Override settings: No

3. **Set environment variables**:
   ```bash
   vercel env add OPENAI_API_KEY
   # Enter your OpenAI API key when prompted
   ```

4. **Redeploy with environment variables**:
   ```bash
   vercel --prod
   ```

### Step 3: Update Frontend

1. **Update backend URL** in `public/script.js`:
   ```javascript
   // Find this line in getBackendUrl() function
   return 'https://your-backend-name.vercel.app';
   ```

2. **Test locally**:
   ```bash
   npm run frontend
   ```

### Step 4: Deploy Frontend

1. **Deploy to Vercel**:
   ```bash
   vercel
   ```

2. **Follow the prompts**:
   - Link to existing project: No
   - Project name: chatbot-frontend
   - Directory: ./
   - Override settings: No

## 🔍 Testing Deployment

1. **Test backend health**:
   ```bash
   curl https://your-backend-url.vercel.app/api/health
   ```

2. **Test frontend**:
   - Open your frontend URL
   - Check if it connects to backend
   - Try sending a message

## 🛠️ Troubleshooting

### CORS Errors
- Ensure your backend URL is correct in frontend
- Check that CORS is properly configured in `server.js`
- Verify environment variables are set in Vercel

### API Key Issues
- Check that `OPENAI_API_KEY` is set in Vercel environment variables
- Ensure the API key is valid and has credits

### Connection Issues
- Verify both frontend and backend URLs are accessible
- Check browser console for specific error messages
- Ensure backend is responding to health checks

## 📊 Monitoring

### Backend Health Check
```bash
curl https://your-backend-url.vercel.app/api/health
```

### Frontend Health Check
```bash
curl https://your-frontend-url.vercel.app/api/frontend-health
```

## 🔄 Updates and Maintenance

### Update Backend
1. Make changes to `server.js`
2. Commit and push to git
3. Deploy: `vercel --prod`

### Update Frontend
1. Make changes to frontend files
2. Update backend URL if needed
3. Deploy: `vercel --prod`

## 🎯 Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] OpenAI API key working
- [ ] Chat functionality tested
- [ ] Error handling working
- [ ] Performance optimized

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors
5. Ensure all dependencies are installed 