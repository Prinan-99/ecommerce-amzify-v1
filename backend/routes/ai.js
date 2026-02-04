import express from 'express';
const router = express.Router();

// AI routes - currently using client-side template generation

export default router;

Generate only the description text, no additional formatting or labels.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ success: true, text });
  } catch (error) {
    console.error('AI Description Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate short description
router.post('/generate-short-description', async (req, res) => {
  try {
    const { productName, category } = req.body;
    
    const prompt = `Create a brief, catchy one-liner product description (max 15 words) for:

Product: ${productName}
${category ? `Category: ${category}` : ''}

Make it compelling and highlight the main benefit. Return only the short description.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    res.json({ success: true, text });
  } catch (error) {
    console.error('AI Short Description Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate SEO content
router.post('/generate-seo', async (req, res) => {
  try {
    const { productName, description } = req.body;
    
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
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const seoContent = JSON.parse(jsonMatch[0]);
      res.json({ success: true, ...seoContent });
    } else {
      res.json({ 
        success: true, 
        title: productName, 
        description: description.substring(0, 160) 
      });
    }
  } catch (error) {
    console.error('AI SEO Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Improve description
router.post('/improve-description', async (req, res) => {
  try {
    const { currentDescription, tone = 'professional' } = req.body;
    
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
    
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ success: true, text });
  } catch (error) {
    console.error('AI Improve Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Note: AI routes disabled - using client-side template AI instead
// Install with: npm install @anthropic-ai/sdk

export default router;
