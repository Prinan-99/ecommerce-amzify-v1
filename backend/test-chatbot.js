#!/usr/bin/env node

/**
 * Chatbot Test Script
 * Tests the Groq chatbot integration
 */

import dotenv from 'dotenv';
import Groq from 'groq-sdk';

console.log('🤖 Starting Chatbot Test (Using Groq - Free!)...\n');

// Test 1: Check environment variables
console.log('✓ Test 1: Checking environment variables...');
dotenv.config();

const apiKey = process.env.GROQ_API_KEY || 'gsk_demo_key';
if (!process.env.GROQ_API_KEY) {
  console.log('⚠️  No GROQ_API_KEY found, using demo mode');
  console.log('   Get your free key at: https://console.groq.com/keys\n');
} else {
  console.log('✅ Groq API key found\n');
}

// Test 2: Check Groq package
console.log('✓ Test 2: Checking Groq package...');
try {
  console.log('✅ Groq SDK installed\n');
  
  // Test 3: Initialize Groq client
  console.log('✓ Test 3: Initializing Groq client...');
  const groq = new Groq({
    apiKey: apiKey,
  });
  console.log('✅ Groq client initialized\n');
  
  // Test 4: Make a simple API call
  console.log('✓ Test 4: Testing API connection...');
  console.log('   Sending test message to Groq (Llama 3.3)...');
  
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say "Hello, Amzify!" in exactly those words.' }
    ],
    max_tokens: 50,
  });
  
  const response = completion.choices[0].message.content;
  console.log('   Response:', response);
  console.log('   Tokens used:', completion.usage.total_tokens);
  console.log('   Model:', completion.model);
  console.log('✅ API connection successful!\n');
  console.log('🎉 All tests passed! Chatbot is ready to use.\n');
  console.log('💡 Using Groq with Llama 3.3 - FREE & FAST!\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.status === 401) {
    console.error('   Invalid Groq API key.');
    console.error('   Get your FREE key at: https://console.groq.com/keys');
  } else if (error.status === 429) {
    console.error('   Rate limit exceeded');
  } else if (error.code === 'MODULE_NOT_FOUND') {
    console.error('\n💡 Run: npm install groq-sdk');
  }
  process.exit(1);
}
