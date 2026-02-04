import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude API client
const apiKey = (import.meta as any).env?.VITE_CLAUDE_API_KEY || '';
console.log('🔑 Claude API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
const anthropic = new Anthropic({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Allow client-side usage
});

export const generateProductDescription = async (productName: string, category?: string, shortDescription?: string) => {
  try {
    console.log('Starting AI description generation for:', productName);
    
    const prompt = `Generate a compelling, professional product description for an e-commerce product.

Product Name: ${productName}
${category ? `Category: ${category}` : ''}
${shortDescription ? `Brief Info: ${shortDescription}` : ''}

Requirements:
- 3-4 paragraphs (150-200 words total)
- Highlight key features and benefits
- Use persuasive, engaging language
- Focus on customer value
- SEO-friendly
- Professional tone

Generate only the description text, no additional formatting or labels.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    
    return message.content[0].type === 'text' ? message.content[0].text : '';
  } catch (error: any) {
    console.error("Gemini Description Generation Error:", error);
    throw new Error(error?.message || 'Failed to generate description');
  }
};

export const generateSEOContent = async (productName: string, description: string) => {
  try {
    const prompt = `Generate SEO-optimized content for this product:

Product Name: ${productName}
Description: ${description}

Generate:
1. SEO Title (50-60 characters, compelling and keyword-rich)
2. Meta Description (150-160 characters, persuasive with call-to-action)

Format your response as JSON:
{
  "title": "...",
  "description": "..."
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      title: productName,
      description: description.substring(0, 160)
    };
  } catch (error: any) {
    console.error("Gemini SEO Generation Error:", error);
    throw new Error(error?.message || 'Failed to generate SEO content');
  }
};

export const improveDescription = async (currentDescription: string, tone: 'professional' | 'casual' | 'luxury' = 'professional') => {
  try {
    const toneGuides = {
      professional: 'formal, business-oriented, authoritative',
      casual: 'friendly, conversational, approachable',
      luxury: 'elegant, premium, sophisticated'
    };
    
    const prompt = `Improve this product description with a ${tone} tone (${toneGuides[tone]}):

Current Description:
${currentDescription}

Make it more engaging, persuasive, and ${tone}. Maintain similar length (150-200 words).
Return only the improved description, no labels or formatting.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content[0].type === 'text' ? message.content[0].text : '';
  } catch (error: any) {
    console.error("Gemini Description Improvement Error:", error);
    throw new Error(error?.message || 'Failed to improve description');
  }
};

export const generateShortDescription = async (productName: string, category?: string) => {
  try {
    console.log('🤖 Starting AI short description for:', productName);
    
    const prompt = `Create a brief, catchy one-liner product description (max 15 words) for:

Product: ${productName}
${category ? `Category: ${category}` : ''}

Make it compelling and highlight the main benefit. Return only the short description.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
  } catch (error: any) {
    console.error("Gemini Short Description Error:", error);
    throw new Error(error?.message || 'Failed to generate short description');
  }
};

// Social Media AI Functions
export const generateSocialMediaPost = async (
  productName: string, 
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube',
  productInfo?: string
) => {
  try {
    const platformGuidelines = {
      facebook: 'Conversational, friendly, 2-3 short paragraphs, use emojis moderately',
      instagram: 'Visual-focused, trendy language, use relevant emojis, include line breaks for readability',
      twitter: 'Concise (under 280 characters), punchy, use 1-2 hashtags',
      linkedin: 'Professional, business-focused, educational tone, 2-3 paragraphs',
      youtube: 'Engaging, video description style, include call-to-action, 3-4 paragraphs'
    };
    
    const prompt = `Create an engaging ${platform} post for this product:

Product: ${productName}
${productInfo ? `Details: ${productInfo}` : ''}

Platform Guidelines: ${platformGuidelines[platform]}

Requirements:
- Platform-optimized format and tone
- Engaging and authentic
- Include relevant emojis
- Do NOT include hashtags (they'll be generated separately)
- Ready to post immediately

Return only the post content, no labels or extra formatting.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
  } catch (error: any) {
    console.error("Gemini Social Post Generation Error:", error);
    throw new Error(error?.message || 'Failed to generate social media post');
  }
};

export const generateHashtags = async (productName: string, category?: string, postContent?: string) => {
  try {
    const prompt = `Generate 8-12 relevant, trending hashtags for this social media post:

Product: ${productName}
${category ? `Category: ${category}` : ''}
${postContent ? `Post Content: ${postContent}` : ''}

Requirements:
- Mix of popular and niche hashtags
- Relevant to the product
- No spaces in hashtags
- Return as comma-separated list
- Include # symbol

Example format: #ProductLaunch, #TechGadgets, #Innovation`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
  } catch (error: any) {
    console.error("Gemini Hashtag Generation Error:", error);
    throw new Error(error?.message || 'Failed to generate hashtags');
  }
};

export const improveSocialPost = async (currentPost: string, platform: string, tone: 'engaging' | 'professional' | 'casual' = 'engaging') => {
  try {
    const prompt = `Improve this ${platform} post to make it more ${tone}:

Current Post:
${currentPost}

Make it more compelling, ${tone}, and platform-appropriate for ${platform}.
Keep similar length. Return only the improved post.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
  } catch (error: any) {
    console.error("Gemini Post Improvement Error:", error);
    throw new Error(error?.message || 'Failed to improve social post');
  }
};
