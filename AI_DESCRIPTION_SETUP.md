# AI Description Writer Setup Guide

## Getting Started with Google Gemini AI

Your seller panel now has AI-powered description generation! Here's how to set it up:

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key (starts with `AIza...`)

### Step 2: Configure Your Seller Panel

1. Open the file: `amzify-seller-panel/.env`
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=AIzaSyD...your_actual_key_here
   ```
3. Save the file

### Step 3: Restart Your Seller Panel

```bash
cd amzify-seller-panel
npm run dev
```

## Features Available

### 1. **AI Short Description** (Basic Info Tab)
- Click the **"AI Generate"** button next to "Short Description"
- Creates a catchy one-liner (max 15 words)
- Perfect for product cards and quick previews

### 2. **AI Full Description** (Basic Info Tab)
- Click **"AI Write"** button to generate complete product description
- 150-200 words of compelling, SEO-friendly content
- Highlights key features and benefits

### 3. **AI Tone Adjustment** (Basic Info Tab)
- **Pro** - Professional, business-oriented tone
- **Casual** - Friendly, conversational tone
- **Luxury** - Elegant, premium tone
- Click after generating description to refine the style

### 4. **AI SEO Content** (SEO Tab)
- Click **"Generate SEO"** button
- Creates optimized SEO title (50-60 characters)
- Generates meta description (150-160 characters)
- Includes keywords and call-to-action

## How to Use

1. **Enter Product Name** (required)
2. **Select Category** (recommended for better AI results)
3. **Optional**: Add short description for more context
4. Click the purple **AI buttons** to generate content
5. Edit the AI-generated text as needed
6. Save your product!

## Tips for Best Results

- ✅ Always fill in product name first
- ✅ Select a category for better context
- ✅ You can regenerate multiple times
- ✅ Edit AI text to match your brand voice
- ✅ Combine AI generation with manual edits

## Troubleshooting

**"Failed to generate description"**
- Check that your API key is correct in `.env`
- Ensure you've restarted the dev server
- Verify your API key has quota remaining

**AI content doesn't match expectations**
- Try different tone buttons (Pro/Casual/Luxury)
- Add more context in product name or short description
- Generate multiple times for variations

## API Usage & Limits

- Free tier: 60 requests per minute
- Each generation counts as 1 request
- Short descriptions use fewer tokens than full descriptions

## Need Help?

If AI generation isn't working:
1. Check browser console for errors (F12)
2. Verify `.env` file has correct API key
3. Make sure you restarted the server after adding the key
4. Test your API key at https://makersuite.google.com/

---

**Enjoy AI-powered product descriptions! 🚀✨**
