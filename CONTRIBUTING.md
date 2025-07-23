# Contributing to Ezra

First off, thank you for considering contributing to Ezra! It's people like you that will make Ezra an amazing tool for everyone.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Exact steps to reproduce the problem
- Expected behavior vs actual behavior
- Your environment details (OS, Node version, etc.)
- Relevant logs or error messages
- Screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear and descriptive title
- Detailed explanation of the proposed feature
- Use cases and examples
- Potential implementation approach
- Any UI/UX mockups if relevant

### Code Contributions

#### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/ezra.git
   cd ezra
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/original/ezra.git
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Setup

```bash
# Install dependencies
npm install

# Set up development environment
npm run setup:dev

# Run tests
npm test

# Start development server
npm run dev
```

#### Development Process

1. **Check existing work**: Look for related issues or PRs
2. **Discuss major changes**: Open an issue first for significant changes
3. **Follow the architecture**: Align with existing patterns and structure
4. **Write tests**: Add tests for new functionality
5. **Update documentation**: Keep docs in sync with code changes
6. **Follow code style**: Run linter before committing

#### Code Style Guidelines

##### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer functional programming patterns

##### File Organization
```typescript
// 1. Imports (external, then internal)
import { external } from 'package';
import { internal } from '@/module';

// 2. Types and interfaces
interface MyInterface {
  // ...
}

// 3. Constants
const MY_CONSTANT = 42;

// 4. Main code
export class MyClass {
  // ...
}

// 5. Helper functions
function helperFunction() {
  // ...
}
```

##### Naming Conventions
- Classes: PascalCase (`TaskManager`)
- Functions/Methods: camelCase (`createTask`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- Files: kebab-case (`task-manager.ts`)
- React components: PascalCase (`TaskList.tsx`)

#### Testing Guidelines

- Write unit tests for all business logic
- Add integration tests for API endpoints
- Include E2E tests for critical user flows
- Maintain >80% code coverage
- Use descriptive test names

Example test structure:
```typescript
describe('TaskManager', () => {
  describe('createTask', () => {
    it('should create a task with valid input', async () => {
      // Arrange
      const input = { title: 'Test Task' };
      
      // Act
      const result = await taskManager.createTask(input);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Test Task');
    });
    
    it('should throw error with invalid input', async () => {
      // Test error cases
    });
  });
});
```

#### Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(tasks): add task priority feature
fix(ui): resolve task list rendering issue
docs(api): update API documentation
```

#### Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**:
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changes you made and why
   - Include screenshots for UI changes
   - Ensure all tests pass
   - Request review from maintainers

4. **Address feedback**:
   - Respond to all review comments
   - Make requested changes
   - Push updates to the same branch
   - Re-request review when ready

#### PR Review Guidelines

For reviewers:
- Test the changes locally
- Check code quality and style
- Verify tests are adequate
- Ensure documentation is updated
- Provide constructive feedback
- Approve when satisfied

### Documentation Contributions

Documentation is crucial! You can help by:
- Improving existing documentation
- Adding examples and tutorials
- Translating documentation
- Creating video tutorials
- Writing blog posts about Ezra

### Community Contributions

Non-code contributions are equally valuable:
- Answer questions in discussions
- Help triage issues
- Review pull requests
- Share Ezra on social media
- Give talks about Ezra
- Organize local meetups

## Development Workflow

### Branch Strategy

- `main`: Stable, production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `fix/*`: Bug fix branches
- `release/*`: Release preparation branches

### Release Process

1. Features merged to `develop`
2. Release branch created from `develop`
3. Final testing and bug fixes
4. Merge to `main` and tag
5. Deploy and announce

## Project Structure

```
ezra/
├── src/                 # Source code
│   ├── core/           # Business logic
│   ├── ai/             # AI services
│   ├── interfaces/     # User interfaces
│   └── shared/         # Shared utilities
├── tests/              # Test files
├── docs/               # Documentation
├── scripts/            # Build and utility scripts
└── config/             # Configuration files
```

## Resources

### Useful Links
- [Project Board](https://github.com/original/ezra/projects)
- [Discussion Forum](https://github.com/original/ezra/discussions)
- [Discord Server](https://discord.gg/ezra)
- [Development Setup Video](https://youtube.com/ezra-setup)

### Learning Resources
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [AI Integration Guide](docs/development/ai-integration.md)

## Recognition

Contributors will be recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md) file
- Release notes
- Project website
- Annual contributor spotlight

## Questions?

Feel free to:
- Open a [discussion](https://github.com/original/ezra/discussions)
- Join our [Discord](https://discord.gg/ezra)
- Email: contributors@ezra-pm.com

Thank you for making Ezra better! 🎉