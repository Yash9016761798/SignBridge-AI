# Contributing to SignBridge AI

Thank you for your interest in contributing to SignBridge AI! This document provides guidelines and
information for contributors.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

See [docs/Setup.md](docs/Setup.md) for detailed setup instructions.

## Pull Request Process

1. **Create a feature branch** from `develop`
2. **Make your changes** following the coding standards
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run quality checks**:
   ```bash
   make quality
   ```
6. **Submit a pull request** with a clear description

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(module): add new feature
fix(module): resolve bug
docs(module): update documentation
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Coding Standards

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use meaningful variable names
- Avoid `any` type
- Use interfaces for object shapes

### React/Next.js

- Use functional components
- Use hooks for state and effects
- Keep components small and focused
- Use TypeScript for props

### NestJS

- Follow NestJS conventions
- Use dependency injection
- Keep controllers thin
- Use services for business logic

### Python

- Follow PEP 8
- Use type hints
- Write docstrings
- Use virtual environments

## Testing

- Write unit tests for business logic
- Write integration tests for APIs
- Aim for meaningful coverage
- Test edge cases

## Documentation

- Update README if adding features
- Add JSDoc comments to public APIs
- Update API documentation (Swagger)
- Add inline comments for complex logic

## Questions?

If you have questions, feel free to:

- Open a discussion on GitHub
- Ask in our Discord community
- Email the maintainers

Thank you for contributing!
