# Ezra - AI Collaboration Guide

## Project Overview

Ezra is a personal LLM-powered project management tool designed to revolutionize how individuals manage their projects and tasks through natural language interaction and intelligent assistance.

### Vision
Create an intuitive, AI-first project management system that understands context, suggests actions, and helps users achieve their goals more efficiently than traditional task management tools.

### Core Principles
1. **Natural Language First**: All interactions should feel conversational
2. **Context-Aware**: The system learns from past interactions and project history
3. **Proactive Assistance**: AI suggests next steps, not just responds to commands
4. **Privacy-Focused**: Personal data stays local with optional cloud sync
5. **Extensible**: Easy to integrate with existing tools and workflows

## For AI Assistants

When working on Ezra, follow these guidelines:

### Understanding the Codebase
1. Always check existing patterns before implementing new features
2. Maintain consistency with established conventions
3. Prioritize user experience and simplicity
4. Consider performance implications of AI operations

### Key Components
- **Task Engine**: Core logic for managing projects and tasks
- **AI Interface**: Natural language processing and response generation
- **Data Layer**: Persistent storage for projects, tasks, and context
- **Integration Hub**: Connections to external services
- **Analytics Engine**: Progress tracking and insights generation

### Development Workflow
1. Read relevant documentation before making changes
2. Test AI interactions thoroughly
3. Document any new AI capabilities or prompts
4. Consider edge cases in natural language understanding
5. Maintain backward compatibility with existing data

### LLM Integration Guidelines
- Use streaming responses for better UX
- Implement proper error handling for API failures
- Cache frequent queries to reduce API costs
- Provide fallback options when AI is unavailable
- Keep prompts modular and testable

### Code Standards
- TypeScript for type safety
- Comprehensive error handling
- Clear naming conventions
- Modular architecture
- Extensive commenting for AI-specific logic

### Testing Approach
- Unit tests for core logic
- Integration tests for AI interactions
- End-to-end tests for user workflows
- Performance benchmarks for AI operations

### Security Considerations
- Never expose API keys in code
- Sanitize user inputs before AI processing
- Implement rate limiting for AI calls
- Secure storage for sensitive project data

## Project-Specific Instructions

### When Adding Features
1. Consider how it fits the natural language paradigm
2. Design for both CLI and GUI interfaces
3. Ensure offline functionality where possible
4. Add appropriate analytics tracking

### When Fixing Bugs
1. Check if it's an AI interpretation issue
2. Verify data consistency
3. Test across different LLM providers
4. Update relevant documentation

### When Optimizing
1. Profile AI response times
2. Minimize API calls through caching
3. Batch operations where possible
4. Consider local LLM options

## Communication Style
When generating responses or documentation:
- Be concise but comprehensive
- Use clear, accessible language
- Provide examples for complex concepts
- Maintain a helpful, professional tone

## Remember
Ezra is about empowering users through AI. Every line of code should contribute to making project management feel effortless and intelligent.