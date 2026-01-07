# Contributing to Cozi API Client

Thank you for your interest in contributing to the Cozi API Client! This guide will help you get started.

## ⚠️ Important Note

This is an **unofficial** client library based on reverse engineering. Any contributions should:
- Respect Cozi's terms of service
- Not encourage abuse or rate limiting violations
- Include proper error handling and documentation

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- TypeScript knowledge

### Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/cozi-api-client.git
cd cozi-api-client
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

## Development Workflow

### Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes
3. Add/update tests
4. Run tests to ensure everything works:
```bash
npm test
```

5. Build to ensure no TypeScript errors:
```bash
npm run build
```

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Include examples in documentation

### Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting PR
- Aim for good test coverage:
```bash
npm run test:coverage
```

### Commit Messages

Use clear, descriptive commit messages:
- `feat: add support for calendar events`
- `fix: handle authentication timeout`
- `docs: update README with new examples`
- `test: add tests for item operations`

## Pull Request Process

1. Update README.md if you've added new features
2. Update CHANGELOG.md with your changes
3. Ensure all tests pass
4. Update type definitions if needed
5. Submit PR with clear description of changes

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated
- [ ] Type definitions updated if needed
- [ ] Examples added/updated if relevant

## Reporting Issues

When reporting issues, please include:
- Node.js version
- Package version
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Any error messages

## Feature Requests

We welcome feature requests! Please:
- Check existing issues first
- Provide clear use case
- Explain why it would be useful
- Consider if it fits the scope of this library

## Code of Conduct

- Be respectful and constructive
- Help others learn
- Focus on what's best for the project
- Use welcoming and inclusive language

## Questions?

- Open an issue for bugs or features
- Use discussions for questions and ideas
- Check existing documentation first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
