# Ezra - AI Collaboration Guide

## Project Overview

Ezra is a personal project management tool designed to help individuals manage their projects and tasks efficiently. The tool is built with core functionality first, with AI-powered enhancements added as optional features in later phases.

### Vision
Create an intuitive project management system that works excellently on its own, with optional AI enhancements that understand context, suggest actions, and help users achieve their goals more efficiently.

### Development Approach
**Core First, AI Later**: We're building Ezra in phases:
- **Phase 1-3**: Complete project management functionality without any AI dependencies
- **Phase 4+**: Optional AI enhancements that improve but never replace core features

### Core Principles
1. **Functionality First**: Core features must work perfectly without AI
2. **Progressive Enhancement**: AI features are always optional add-ons
3. **Privacy-Focused**: Personal data stays local with optional cloud sync
4. **Extensible**: Easy to integrate with existing tools and workflows
5. **User Control**: All AI features can be completely disabled

## For AI Assistants

When working on Ezra, follow these guidelines:

### Current Development Phase
**Important**: We are currently in the core development phase (Phases 1-3). Do not implement AI features until Phase 4. Focus on:
- Structured command parsing
- Core CRUD operations
- Local data persistence
- Traditional project management features

### Understanding the Codebase
1. Always check existing patterns before implementing new features
2. Maintain consistency with established conventions
3. Prioritize user experience and simplicity
4. Ensure all features work without AI

### Key Components
- **Task Engine**: Core logic for managing projects and tasks (no AI required)
- **Command Parser**: Structured command parsing (Phase 1-3)
- **AI Interface**: Natural language processing (Phase 4+ only)
- **Data Layer**: Persistent storage for projects, tasks, and context
- **Integration Hub**: Connections to external services
- **Analytics Engine**: Progress tracking and insights (works without AI)

### Development Workflow
1. Read relevant documentation before making changes
2. Test core functionality thoroughly
3. Document all features clearly
4. Ensure structured commands work perfectly
5. Maintain backward compatibility with existing data

### Phase-Specific Guidelines

#### Phases 1-3 (Current Focus)
- Build complete functionality without AI
- Use structured commands only
- Focus on reliability and performance
- Create comprehensive tests for all features
- Document all CLI commands clearly

#### Phase 4+ (Future AI Enhancement)
When we reach Phase 4, AI features should:
- Never break existing functionality
- Provide fallbacks to structured commands
- Be completely optional
- Enhance but not replace core features

### LLM Integration Guidelines (Phase 4+)
When AI is eventually added:
- Use streaming responses for better UX
- Implement proper error handling for API failures
- Cache frequent queries to reduce API costs
- Provide fallback options when AI is unavailable
- Keep prompts modular and testable
- Always maintain structured command alternatives

### Code Standards
- TypeScript for type safety
- Comprehensive error handling
- Clear naming conventions
- Modular architecture
- Clear separation between core and AI logic

### Testing Approach
- Unit tests for all core logic
- Integration tests for complete workflows
- E2E tests for user journeys
- Performance benchmarks for all operations
- (Phase 4+) Separate tests for AI enhancements

### Security Considerations
- Input validation for all commands
- SQL injection prevention
- Secure storage for sensitive data
- (Phase 4+) API key management for AI services

## Project-Specific Instructions

### When Adding Features
1. Ensure it works without AI first
2. Design for both CLI and GUI interfaces
3. Ensure offline functionality
4. Add appropriate analytics tracking
5. (Phase 4+) Consider AI enhancement possibilities

### When Fixing Bugs
1. Check core logic first
2. Verify data consistency
3. Test with various inputs
4. Update relevant documentation
5. Ensure fix doesn't break existing features

### When Optimizing
1. Profile operation performance
2. Optimize database queries
3. Implement efficient algorithms
4. Add caching where appropriate
5. Target < 100ms response times

## Phase Transition Guidelines

### Moving from Phase 3 to Phase 4
When core development is complete and we begin adding AI:
1. Core functionality must be 100% stable
2. All tests must pass
3. Documentation must be complete
4. Performance targets must be met
5. User feedback incorporated

### AI Integration Pattern
```typescript
// Example of how AI will be added in Phase 4
class TaskService {
  // Core method (Phases 1-3)
  createTask(params: CreateTaskParams): Promise<Task> {
    // Core logic that always works
  }
  
  // Enhanced method (Phase 4+)
  createTaskNatural?(input: string): Promise<Task> {
    // AI parsing with fallback to structured
  }
}
```

## Communication Style
When generating responses or documentation:
- Be concise but comprehensive
- Use clear, accessible language
- Provide examples for complex concepts
- Focus on practical implementation

## Remember
Ezra is about building a solid, reliable project management tool first. AI enhancements will make it even better, but the core must stand on its own. Every line of code should contribute to making project management efficient and reliable, with or without AI.