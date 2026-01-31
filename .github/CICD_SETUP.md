# CI/CD Pipeline Setup Guide

This document explains the CI/CD pipeline setup for Studium AI and how to configure branch protection rules.

## 🚀 Pipeline Overview

The CI/CD pipeline runs automatically on every Pull Request and includes:

### ✅ **Step 1: Backend Tests**
- Runs all unit tests
- Generates test coverage reports
- **Requirement**: All tests must pass
- **Coverage Threshold**: 75% for branches, functions, lines, and statements

### ✅ **Step 2: Frontend Checks**
- Builds the frontend application
- Runs ESLint for code quality
- Ensures no build errors

### ✅ **Step 3: Code Quality**
- Checks for new TODO/FIXME comments (warning only)
- Verifies no `console.log` in production code
- Ensures code quality standards

## 📋 Requirements for Pull Requests

Before a PR can be merged, it must:

1. ✅ **All unit tests pass** - No failing tests allowed
2. ✅ **Test coverage ≥ 75%** - New code must maintain 75% coverage
3. ✅ **Frontend builds successfully** - No build errors
4. ✅ **Linting passes** - Code follows style guidelines
5. ✅ **No console.logs** - Production code must be clean

## 🔒 Setting Up Branch Protection Rules

To enforce these checks, set up branch protection on GitHub:

### Step 1: Go to Repository Settings
1. Navigate to your repository on GitHub
2. Click **Settings** → **Branches**
3. Under "Branch protection rules", click **Add rule**

### Step 2: Configure Protection for `main` Branch

**Branch name pattern**: `main`

Enable the following settings:

#### ✅ Require Status Checks
- [x] **Require status checks to pass before merging**
- [x] **Require branches to be up to date before merging**

**Required Status Checks** (select all):
- `Backend Tests & Coverage`
- `Frontend Tests & Coverage`
- `Code Quality Checks`
- `All Checks Passed`

#### ✅ Other Recommended Settings
- [x] **Require a pull request before merging**
  - Required approvals: 1 (or more for team projects)
- [x] **Require conversation resolution before merging**
- [x] **Do not allow bypassing the above settings**
- [x] **Require linear history** (optional but recommended)

### Step 3: Save Rules
Click **Create** or **Save changes** at the bottom.

---

## 🧪 Testing Requirements

### Writing Tests for New Features

When adding new functionality:

```typescript
// ✅ Good - Comprehensive test coverage
describe('MyNewFeature', () => {
  it('should handle valid input', () => {
    // Test happy path
  });

  it('should handle invalid input', () => {
    // Test error cases
  });

  it('should handle edge cases', () => {
    // Test boundaries
  });
});
```

### Test Coverage Requirements

- **Global Coverage**: 75% minimum for all metrics
  - Branches: 75%
  - Functions: 75%
  - Lines: 75%
  - Statements: 75%

### Running Tests Locally

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run with coverage report

# Frontend linting
cd frontend
npm run lint               # Run ESLint
npm run build             # Test build
```

---

## 📊 Coverage Reports

After each PR, coverage reports are:
1. **Commented on the PR** - See coverage changes directly
2. **Uploaded to Codecov** (if configured)
3. **Available in workflow artifacts**

### Viewing Coverage Locally

```bash
cd backend
npm run test:coverage
open coverage/lcov-report/index.html  # macOS
```

---

## 🔧 Troubleshooting

### PR Check Failing: "Coverage below threshold"

**Solution**: Add more tests to reach 75% coverage

```bash
# Check current coverage
npm run test:coverage

# View detailed report
open coverage/lcov-report/index.html
```

### PR Check Failing: "console.log found"

**Solution**: Remove console.log statements from production code

```bash
# Search for console.logs
git diff origin/main...HEAD | grep "console.log"

# Use proper logging instead
import { logger } from './utils/logger';
logger.info('Message');  // ✅ Good
console.log('Message');   // ❌ Bad in production
```

### PR Check Failing: "Tests failed"

**Solution**: Fix failing tests before pushing

```bash
# Run tests locally
npm test

# Run specific test file
npm test -- path/to/test.test.ts

# Update snapshots if needed (carefully!)
npm test -- -u
```

---

## 🎯 Best Practices

### 1. Write Tests First (TDD)
```typescript
// 1. Write the test
it('should create a new note', async () => {
  const note = await createNote({ title: 'Test', content: 'Content' });
  expect(note).toBeDefined();
});

// 2. Implement the feature
// 3. Test passes ✅
```

### 2. Keep Tests Isolated
```typescript
// ✅ Good - Each test is independent
describe('User API', () => {
  beforeEach(async () => {
    await clearDatabase();  // Clean slate
  });

  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});
```

### 3. Test Edge Cases
```typescript
describe('Password validation', () => {
  it('should accept valid password', () => { /* ... */ });
  it('should reject short password', () => { /* ... */ });
  it('should reject empty password', () => { /* ... */ });
  it('should reject null password', () => { /* ... */ });
  it('should handle special characters', () => { /* ... */ });
});
```

### 4. Mock External Dependencies
```typescript
// ✅ Good - Mock external services
jest.mock('../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Coverage Configuration](https://jestjs.io/docs/configuration#coveragethreshold-object)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

---

## 🆘 Need Help?

If you encounter issues with the CI/CD pipeline:

1. Check the workflow logs in GitHub Actions tab
2. Run tests locally to reproduce the issue
3. Review this documentation
4. Ask the team for help

**Remember**: The pipeline is here to help maintain code quality and catch issues early! 🚀
