# Template: Testing

## Overview

This document provides the template for "Testing" documentation. It defines the testing philosophy, implementation practices, and standards for ensuring code quality through automated testing.

---

## Template Structure

### Frontmatter

```yaml
---
title: Testing
description: Testing philosophy, practices, and standards
last_updated: {{DATE}}
owner: {{TEAM_NAME}}
status: living
applies_to: all contributors
related:
  - writing-software.md
  - standards.md
  - code-review.md
---
```

### Document Outline

```markdown
# Testing

> **Purpose**: This document defines how we test software in {{PROJECT_NAME}}. It covers what we test, how we test it, and the standards we follow to ensure our code is reliable and maintainable.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [What We Test](#what-we-test)
3. [Testing Pyramid](#testing-pyramid)
4. [Testing Implementation](#testing-implementation)
5. [Test Organization](#test-organization)
6. [Writing Good Tests](#writing-good-tests)
7. [Testing Patterns](#testing-patterns)
8. [Running Tests](#running-tests)
9. [CI/CD Integration](#cicd-integration)
10. [Coverage and Metrics](#coverage-and-metrics)
11. [Troubleshooting Tests](#troubleshooting-tests)

---

## Testing Philosophy

### Why We Test

Tests serve multiple purposes:

1. **Verify correctness** - Ensure code works as expected
2. **Prevent regressions** - Catch when changes break existing functionality
3. **Enable refactoring** - Make changes confidently
4. **Document behavior** - Tests show how code should be used
5. **Drive design** - Testing influences better code structure

### Core Principles

**Test Business Requirements, Not Implementation**

Focus tests on **what needs to be true** for the system to work correctly, not on how the code achieves it.

```{{LANGUAGE}}
// Bad: Testing implementation
test('createUser calls repository.save')

// Good: Testing requirement
test('creates user with valid email and name')
```

**Tests Are REQUIRED for Business Logic**

[TODO: Define what requires tests in your project]

Business logic must have tests. Glue code and simple getters are optional.

| Code Type | Tests Required? | Example |
|-----------|----------------|---------|
| Domain actions | **YES** | `createUser`, `placeOrder` |
| Business rules | **YES** | `canUserCheckout`, `isOrderValid` |
| Domain models | **YES** | `User`, `Order` |
| Complex utilities | **YES** | `parseComplexFormat` |
| Simple utilities | Optional | `capitalize(string)` |
| Glue code | Optional | Pass-through functions |
| Types/interfaces | **NO** | Type definitions |

**Write Tests That Give Confidence**

A test that's too brittle (breaks on harmless changes) or too loose (doesn't catch bugs) doesn't help. Write tests that give you confidence to ship.

**Fast Feedback Loops**

Tests should run fast enough that developers run them frequently. If tests are slow, they won't be run.

**Tests Should Be Independent**

Each test should:

- Set up its own data
- Not depend on other tests
- Clean up after itself
- Run in any order

---

## What We Test

### Testing Requirements by Layer

[TODO: Define testing requirements for your architecture]

Based on our architecture (see [writing-software.md](./writing-software.md)), here's what requires tests:

#### Domain Layer (REQUIRED)

**Actions** - All domain actions must be tested:

- Happy path (valid input, successful operation)
- Validation errors (invalid input)
- Business rule violations (email already exists, etc.)
- Error handling (database errors, external service failures)

**Models** - All model logic must be tested:

- Business rules (`canUserCheckout`, `isOrderShippable`)
- State transitions (`order.cancel()`, `user.suspend()`)
- Validation logic
- Edge cases

**Value Objects** - All value object validation must be tested:

- Valid inputs are accepted
- Invalid inputs are rejected
- Edge cases (empty strings, special characters, etc.)

#### Integration Points (RECOMMENDED)

**Repositories** - Test integration with database:

- CRUD operations work
- Queries return correct data
- Transactions work properly
- Error handling

**External Services** - Test adapters for external APIs:

- Happy path calls work
- Error handling (network failures, timeouts, etc.)
- Retry logic (if applicable)

#### API Layer (RECOMMENDED)

**HTTP Endpoints** - Test request/response:

- Valid requests return correct responses
- Invalid requests return appropriate errors
- Authentication/authorization enforced
- Error responses are well-formatted

#### UI Layer (OPTIONAL)

[TODO: Define UI testing approach]

**Components** - Test user interactions, not rendering details:

- User interactions trigger correct actions
- Complex component logic
- Accessibility (if critical)

**Skip Testing**: Simple presentational components, styling.

---

## Testing Pyramid

We follow the testing pyramid pattern:

```
        /\
       /  \      E2E Tests (Few)
      /    \     - Full user workflows
     /------\    - Critical paths only
    /        \   - Slow, brittle, expensive
   /          \
  /------------\ Integration Tests (Some)
 /              \ - API endpoints
/                \ - Database operations
/                  \ - External services
/--------------------\
                      Unit Tests (Many)
                      - Domain actions
                      - Models and logic
                      - Fast, reliable
```

### Unit Tests (70-80% of tests)

**What**: Test individual functions/classes in isolation.

**Characteristics**:

- Fast (milliseconds)
- No external dependencies (database, network, filesystem)
- Use fakes/mocks for dependencies
- Many tests, covering many scenarios

**What to Test**:

- Domain actions (with fake repositories)
- Business logic in models
- Complex utility functions
- Value object validation

### Integration Tests (15-25% of tests)

**What**: Test interactions between components or with external systems.

**Characteristics**:

- Slower (seconds)
- May use real database (test database)
- May hit real external APIs (staging environment)
- Fewer tests, covering critical integrations

**What to Test**:

- Repository implementations (with test database)
- API endpoints (with test server)
- External service adapters (with test environment)
- Database migrations

### E2E Tests (5-10% of tests)

**What**: Test complete user workflows through the full system.

**Characteristics**:

- Slowest (minutes)
- Use real or near-real environment
- Brittle (break often)
- Expensive to maintain

**What to Test**:

- Critical user flows (registration, checkout, payment)
- Main happy paths
- Cross-browser compatibility (if web app)

---

## Testing Implementation

### Test Framework

[TODO: Document your test framework and tooling]

We use **{{TEST_FRAMEWORK}}** for testing.

**Configuration**: `{{TEST_CONFIG_FILE}}`

**Why This Framework**: {{RATIONALE}}

### Test Runner

Run tests with:

```bash
# Run all tests
{{TEST_COMMAND}}

# Run specific file
{{TEST_COMMAND}} {{FILE_PATH}}

# Run in watch mode
{{TEST_COMMAND_WATCH}}

# Run with coverage
{{TEST_COMMAND_COVERAGE}}
```

### Assertion Library

[TODO: Document assertion library]

We use **{{ASSERTION_LIBRARY}}** for assertions.

```{{LANGUAGE}}
[TODO: Provide examples]

// Example assertions:
expect(result).toBe(expected);
expect(result).toEqual(expected);
expect(result).toMatchObject(expected);
expect(fn).toThrow(Error);
```

### Mocking/Faking Strategy

[TODO: Define your mocking strategy]

**Our Approach**: {{MOCKING_STRATEGY}}

We prefer:

1. **Fakes over mocks** - In-memory implementations over mock objects
2. **Dependency injection** - Pass dependencies explicitly
3. **Interfaces** - Test against interfaces, not concrete classes

```{{LANGUAGE}}
[TODO: Provide examples]

// Example: Using fake repository
const fakeUserRepository = new InMemoryUserRepository();
const result = await createUser(input, {
  userRepository: fakeUserRepository,
  eventBus: new InMemoryEventBus(),
});
```

### Test Database

[TODO: Document test database setup]

For integration tests, we use:

- **Database**: {{TEST_DATABASE}}
- **Setup**: {{TEST_DB_SETUP}}
- **Cleanup**: {{TEST_DB_CLEANUP}}

```bash
# Setup test database
{{TEST_DB_SETUP_COMMAND}}

# Run migrations
{{TEST_MIGRATION_COMMAND}}
```

### Test Fixtures and Factories

[TODO: Document fixture/factory approach]

We use {{FIXTURE_APPROACH}} for test data:

```{{LANGUAGE}}
[TODO: Provide examples]

// Example: Test builder pattern
const user = UserBuilder.create()
  .withEmail('test@example.com')
  .verified()
  .build();
```

---

## Test Organization

### Test File Location

[TODO: Define where tests live]

Tests live {{TEST_LOCATION}}:

**Option 1: Alongside source files**

```
src/domains/users/
├── actions/
│   ├── create-user.ts
│   └── create-user.test.ts
```

**Option 2: Separate test directory**

```
src/domains/users/
├── actions/
│   └── create-user.ts
└── __tests__/
    └── create-user.test.ts
```

### Test File Naming

[TODO: Define naming convention]

Test files use {{NAMING_CONVENTION}}:

- Source file: `{{SOURCE_FILENAME}}.{{EXT}}`
- Test file: `{{TEST_FILENAME}}.{{TEST_EXT}}`

Examples:

- `create-user.ts` → `create-user.test.ts`
- `user.py` → `test_user.py`
- `user.rs` → `user_test.rs`

### Test Structure

[TODO: Provide test structure template]

Each test file follows this structure:

```{{LANGUAGE}}
[TODO: Provide actual test structure example]

// Example (TypeScript with Jest):
import { createUser } from './create-user';
import { InMemoryUserRepository } from '../repositories/in-memory-user-repository';
import { InMemoryEventBus } from '@/shared/infrastructure/events';

describe('createUser', () => {
  // Setup common dependencies
  let userRepository: InMemoryUserRepository;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    eventBus = new InMemoryEventBus();
  });

  describe('happy path', () => {
    test('creates user with valid input', async () => {
      // Arrange
      const input = {
        email: 'user@example.com',
        name: 'John Doe',
      };

      // Act
      const result = await createUser(input, { userRepository, eventBus });

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value.email).toBe(input.email);
      expect(result.value.name).toBe(input.name);
    });
  });

  describe('validation', () => {
    test('rejects invalid email format', async () => {
      const input = { email: 'not-an-email', name: 'John' };

      const result = await createUser(input, { userRepository, eventBus });

      expect(result.ok).toBe(false);
      expect(result.error.type).toBe('INVALID_EMAIL');
    });
  });

  describe('business rules', () => {
    test('rejects duplicate email', async () => {
      const email = 'existing@example.com';
      await userRepository.create({ email, name: 'Existing' });

      const result = await createUser(
        { email, name: 'New User' },
        { userRepository, eventBus }
      );

      expect(result.ok).toBe(false);
      expect(result.error.type).toBe('EMAIL_ALREADY_EXISTS');
    });
  });
});
```

---

## Writing Good Tests

### Test Naming

**Test names should describe business requirements.**

Test names answer: "What should this code do?"

```{{LANGUAGE}}
// Bad: Implementation-focused
test('returns user object')
test('calls repository.save')
test('validation passes')

// Good: Requirement-focused
test('creates user with valid email and name')
test('rejects duplicate email addresses')
test('suspended users cannot log in')
```

Format: `test('{{SUBJECT}} {{BEHAVIOR}} {{CONDITION}}')`

Examples:

- `test('creates order when inventory is available')`
- `test('rejects payment when amount exceeds limit')`
- `test('sends email notification after successful registration')`

### Arrange-Act-Assert Pattern

Structure tests with clear phases:

```{{LANGUAGE}}
test('creates user with valid input', async () => {
  // Arrange: Set up test data and dependencies
  const input = { email: 'user@example.com', name: 'John' };
  const deps = { userRepository, eventBus };

  // Act: Perform the action being tested
  const result = await createUser(input, deps);

  // Assert: Verify the expected outcome
  expect(result.ok).toBe(true);
  expect(result.value.email).toBe(input.email);
});
```

Use blank lines to separate phases visually.

### One Assertion Per Concept

[TODO: Clarify your assertion philosophy]

Each test should verify one concept, but may have multiple assertions supporting that concept.

```{{LANGUAGE}}
// Good: Multiple assertions for one concept
test('creates user with valid input', () => {
  const result = createUser(validInput);

  // All these assertions verify "user was created correctly"
  expect(result.ok).toBe(true);
  expect(result.value.email).toBe(validInput.email);
  expect(result.value.name).toBe(validInput.name);
  expect(result.value.createdAt).toBeInstanceOf(Date);
});

// Bad: Testing multiple unrelated concepts
test('user operations', () => {
  const user = createUser(input);  // Testing creation
  user.suspend();                  // Testing suspension
  const canLogin = user.canLogin(); // Testing login check
  // ... (separate these into individual tests)
});
```

### Test Edge Cases

Don't just test the happy path. Test edge cases:

- **Empty collections**: `[]`, `{}`
- **Null/undefined values**: `null`, `undefined`
- **Boundary values**: `0`, `-1`, `MAX_INT`
- **Special characters**: Spaces, unicode, emojis
- **Timing issues**: Race conditions, timeouts

```{{LANGUAGE}}
describe('processItems', () => {
  test('processes non-empty array', () => { /* ... */ });
  test('handles empty array', () => { /* ... */ });
  test('handles array with one item', () => { /* ... */ });
  test('handles null input', () => { /* ... */ });
});
```

### Avoid Testing Implementation Details

Test **what** code does, not **how** it does it.

```{{LANGUAGE}}
// Bad: Testing implementation
test('calls repository.save with hashed password', async () => {
  const spy = jest.spyOn(repository, 'save');

  await createUser(input);

  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({ hashedPassword: expect.any(String) })
  );
});

// Good: Testing behavior
test('stores user with hashed password', async () => {
  const result = await createUser({ email, name, password: 'secret' });

  const stored = await repository.findById(result.value.id);
  expect(stored.hashedPassword).not.toBe('secret');
  expect(stored.hashedPassword.length).toBeGreaterThan(20);
});
```

### Make Tests Readable

Tests are documentation. Make them easy to understand.

**Use clear variable names**:

```{{LANGUAGE}}
// Bad
const u = { e: 'a@b.com', n: 'J' };

// Good
const validUser = {
  email: 'user@example.com',
  name: 'John Doe',
};
```

**Use test builders/factories**:

```{{LANGUAGE}}
// Bad: Lots of boilerplate
const user = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'John',
  status: 'active',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  // ... many more fields
};

// Good: Builder with defaults
const user = UserBuilder.create()
  .withEmail('user@example.com')
  .verified()
  .build();
```

**Extract helper functions**:

```{{LANGUAGE}}
// Bad: Repeated setup
test('A', () => {
  const user = await createUser(...);
  const session = await createSession(...);
  // ... test logic
});

test('B', () => {
  const user = await createUser(...);
  const session = await createSession(...);
  // ... test logic
});

// Good: Extracted helper
async function setupAuthenticatedUser() {
  const user = await createUser(...);
  const session = await createSession(...);
  return { user, session };
}

test('A', async () => {
  const { user, session } = await setupAuthenticatedUser();
  // ... test logic
});
```

---

## Testing Patterns

### Pattern: Test Data Builders

[TODO: Provide test builder pattern for your language]

Use builder pattern for complex test objects:

```{{LANGUAGE}}
[TODO: Show actual builder implementation]
```

See [patterns.md#test-builders](./patterns.md#test-builders) for details.

### Pattern: In-Memory Fakes

[TODO: Provide fake implementation pattern]

Prefer in-memory fakes over mocks:

```{{LANGUAGE}}
[TODO: Show actual fake implementation]

// Example: In-memory repository
export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = new User(generateId(), input.email, input.name);
    this.users.set(user.id, user);
    return user;
  }

  // ... other methods
}
```

### Pattern: Test Fixtures

[TODO: Provide fixture pattern if used]

For complex test data that's reused across tests:

```{{LANGUAGE}}
[TODO: Show actual fixture implementation]
```

---

## Running Tests

### Local Development

[TODO: Document test commands]

```bash
# Run all tests
{{TEST_COMMAND}}

# Run tests for specific file
{{TEST_COMMAND}} {{FILE_PATH}}

# Run tests matching pattern
{{TEST_COMMAND}} {{PATTERN}}

# Run in watch mode (re-run on file changes)
{{TEST_COMMAND_WATCH}}

# Run with coverage report
{{TEST_COMMAND_COVERAGE}}

# Run only failed tests
{{TEST_COMMAND_FAILED}}
```

### Debugging Tests

[TODO: Document debugging approach]

**Option 1: Console logging**

```{{LANGUAGE}}
test('debugging example', () => {
  console.log('Debug info:', value);
  // ... test code
});
```

**Option 2: Debugger**
[TODO: Document debugger setup]

**Option 3: Run single test**

```bash
{{TEST_COMMAND}} {{SPECIFIC_TEST}}
```

### Performance

**Test Performance Guidelines**:

- Unit tests: < 100ms each
- Integration tests: < 5 seconds each
- E2E tests: < 30 seconds each
- Full test suite: < {{SUITE_TIME_TARGET}}

If tests are slower, investigate why.

---

## CI/CD Integration

### Continuous Integration

[TODO: Document CI test process]

Tests run automatically on:

- Every commit to feature branches
- Every pull request
- Merge to {{MAIN_BRANCH}}

**CI Test Pipeline**:

1. Lint code
2. Type check (if applicable)
3. Run unit tests
4. Run integration tests
5. Generate coverage report
6. {{ADDITIONAL_STEPS}}

**PR Requirements**:

- [ ] All tests pass
- [ ] Coverage doesn't decrease
- [ ] No linting errors

### Test Environments

[TODO: Document test environments]

**Local**: Developer's machine

- Uses: {{LOCAL_DB}}, fakes for external services

**CI**: {{CI_PLATFORM}}

- Uses: {{CI_DB}}, fakes for external services

**Staging**: {{STAGING_ENV}}

- Uses: Staging database and services
- E2E tests run here

---

## Coverage and Metrics

### Coverage Targets

[TODO: Define coverage targets]

**Coverage Targets**:

- **Overall**: {{OVERALL_TARGET}}%
- **Domain logic**: {{DOMAIN_TARGET}}%
- **New code**: {{NEW_CODE_TARGET}}%

**What Coverage Means**:

- High coverage doesn't guarantee good tests
- Low coverage definitely means missing tests
- Focus on testing important code, not hitting a number

### Coverage Reports

Generate coverage report:

```bash
{{COVERAGE_COMMAND}}
```

View report: {{COVERAGE_REPORT_LOCATION}}

### What NOT to Cover

Don't waste time testing:

- Generated code
- Third-party libraries
- Trivial getters/setters
- Type definitions

---

## Troubleshooting Tests

### Common Issues

[TODO: Document common test issues and solutions]

#### Issue: Tests Are Slow

**Symptoms**: Test suite takes > {{SLOW_TIME}}

**Possible Causes**:

- Using real database instead of fakes
- Not cleaning up resources
- Too many E2E tests
- Sequential tests that could be parallel

**Solutions**:

- Use fakes for external dependencies
- Run tests in parallel
- Reduce E2E test count
- Profile slow tests

#### Issue: Tests Are Flaky

**Symptoms**: Tests pass sometimes, fail other times

**Possible Causes**:

- Race conditions
- Tests depend on each other
- Tests depend on external state
- Timing-dependent assertions

**Solutions**:

- Make tests independent
- Use deterministic time in tests
- Properly await async operations
- Avoid testing timing

#### Issue: Tests Break on Refactoring

**Symptoms**: Tests fail when code structure changes but behavior doesn't

**Possible Causes**:

- Testing implementation details
- Over-mocking
- Tight coupling to structure

**Solutions**:

- Test behavior, not implementation
- Use fakes instead of mocks
- Test through public interfaces

---

## Agent-Driven Testing

[TODO: If you use AI agents for testing, document the approach]

### Using Claude Code for Tests

We use Claude Code to assist with testing:

**What Claude Can Help With**:

- Generating test cases for edge conditions
- Writing boilerplate test setup
- Identifying missing test coverage
- Updating tests when code changes

**What Humans Still Do**:

- Define what needs to be tested (business requirements)
- Review generated tests for correctness
- Ensure tests give confidence
- Maintain test quality

### Test Generation Workflow

[TODO: Document agent-driven test workflow if applicable]

1. Write the implementation
2. Ask Claude to generate tests
3. Review generated tests
4. Refine and add missing cases
5. Run tests to verify

---

## Related Documentation

- [How We Write Software](./writing-software.md) - Overall philosophy
- [Code Standards](./standards.md) - Testing standards
- [High-Level Patterns](./patterns.md) - Test builder pattern
- [Contributing](./contributing/development.md) - Development workflow

---

## Customization Checklist

When adapting this template:

- [ ] Replace all `{{PLACEHOLDERS}}` with actual values
- [ ] Define what requires tests in your architecture
- [ ] Document test framework and tools
- [ ] Provide actual test examples in your language
- [ ] Define test file naming and location
- [ ] Document test database setup
- [ ] Provide test builder examples
- [ ] Document CI/CD test pipeline
- [ ] Set coverage targets
- [ ] Add common troubleshooting issues
- [ ] Link to related documentation

---

*This is a living document. Last updated: {{DATE}} by {{AUTHOR}}*
