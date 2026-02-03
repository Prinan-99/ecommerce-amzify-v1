import React from 'react';

// Added React import to satisfy namespace requirements for ReactNode
export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}