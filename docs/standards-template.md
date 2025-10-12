# Template: Code Standards

## Overview

This document provides the template for "Code Standards" documentation. It defines coding conventions, style guidelines, and best practices for writing consistent, maintainable code in the project.

This template provides universal standards that apply to any language, plus structures for language-specific standards.

---

## Template Structure

### Frontmatter

```yaml
---
title: Code Standards
description: Coding conventions and style guidelines for this project
last_updated: {{DATE}}
owner: {{TEAM_NAME}}
status: living
applies_to: all contributors
related:
  - writing-software.md
  - code-review.md
  - patterns.md
---
```

### Document Outline

```markdown
# Code Standards

> **Purpose**: This document defines the coding conventions and style guidelines for {{PROJECT_NAME}}. Following these standards ensures our codebase is consistent, readable, and maintainable.

---

## Table of Contents

1. [Guiding Principles](#guiding-principles)
2. [Universal Standards](#universal-standards)
3. [Language-Specific Standards](#language-specific-standards)
4. [File Organization](#file-organization)
5. [Naming Conventions](#naming-conventions)
6. [Code Structure](#code-structure)
7. [Error Handling](#error-handling)
8. [Comments and Documentation](#comments-and-documentation)
9. [Testing Standards](#testing-standards)
10. [Automated Enforcement](#automated-enforcement)
11. [Code Review Checklist](#code-review-checklist)

---

## Guiding Principles

### Optimize for Readability

Code is read far more often than it's written. Optimize for:

1. **Clarity** - Anyone should understand what code does
2. **Simplicity** - The simplest solution that works
3. **Consistency** - Follow established patterns
4. **Discoverability** - Easy to find related code

### Prefer Convention over Configuration

When there are multiple valid approaches, pick one and use it consistently throughout the codebase.

### Automate What You Can

Use linters, formatters, and static analysis to enforce standards automatically. Don't rely on humans to catch style issues.

### These Are Guidelines, Not Laws

If breaking a rule makes code clearer, break it. But document why in a comment.

---

## Universal Standards

These standards apply regardless of programming language.

### File Size

**Keep files focused and manageable.**

- **Guideline**: Files under 500 lines
- **Hard limit**: 1000 lines (if exceeded, consider splitting)

**Why**: Large files are hard to navigate and often indicate multiple responsibilities.

**Exceptions**: Generated code, data files.

### Function/Method Length

**Keep functions short and focused.**

- **Guideline**: Functions under 50 lines
- **Hard limit**: 100 lines (if exceeded, consider extracting)

**Why**: Long functions are hard to understand and test.

**Exceptions**: Complex algorithms that lose clarity when split.

### Nesting Depth

**Limit nesting depth.**

- **Guideline**: 3 levels of nesting
- **Hard limit**: 4 levels

**Why**: Deep nesting is hard to follow. Use early returns or extract functions.

```{{LANGUAGE}}
// Bad: Deep nesting
function processOrder(order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.customer) {
          // ... finally do something
        }
      }
    }
  }
}

// Good: Early returns
function processOrder(order) {
  if (!order?.items?.length || !order.customer) {
    return;
  }
  // ... do something
}
```

### Function Parameters

**Limit parameter count.**

- **Guideline**: 3 parameters or fewer
- **Hard limit**: 5 parameters

**Why**: Many parameters are hard to remember and indicate unclear responsibilities.

**Solution**: Use an options object/struct for multiple parameters.

```{{LANGUAGE}}
// Bad: Many parameters
function createUser(email, name, age, country, newsletter, referrer) { }

// Good: Options object
function createUser(options: CreateUserOptions) {
  const { email, name, age, country, newsletter, referrer } = options;
}
```

### DRY (Don't Repeat Yourself)

**Avoid code duplication.**

**Guideline**: If you copy-paste code 3 times, extract a function.

**Why**: Duplicated code means bugs need fixing in multiple places.

**Exception**: Sometimes duplication is better than the wrong abstraction. Prefer duplication over premature abstraction.

### Single Responsibility

**Each function/class should have one reason to change.**

**Guideline**: If a function name uses "and", it probably does too much.

```{{LANGUAGE}}
// Bad: Multiple responsibilities
function validateAndSaveUser(user) {
  // Validation logic
  // Database logic
  // Email logic
}

// Good: Single responsibilities
function validateUser(user) { }
function saveUser(user) { }
function sendWelcomeEmail(user) { }
```

### Immutability

**Prefer immutable data structures.**

**Guideline**: Don't modify objects passed to functions; return new ones.

```{{LANGUAGE}}
// Bad: Mutation
function updateUser(user, name) {
  user.name = name;
  return user;
}

// Good: Immutability
function updateUser(user, name) {
  return { ...user, name };
}
```

**Why**: Mutation causes bugs and makes code hard to reason about.

---

## Language-Specific Standards

[TODO: Add sections for each language used in your project. Below are templates for common languages.]

### {{LANGUAGE_1}} Standards

[TODO: Fill in language-specific standards. Use the templates below as examples.]

---

### JavaScript/TypeScript Standards

#### Type Safety

**Use TypeScript for all new code.**

- Use strict mode (`"strict": true` in tsconfig.json)
- Avoid `any` type (use `unknown` if type is truly unknown)
- Define interfaces for all data structures
- Use type guards for runtime checks

```typescript
// Bad: any type
function processData(data: any) { }

// Good: Specific type
interface UserData {
  id: string;
  email: string;
  name: string;
}

function processData(data: UserData) { }
```

#### Variable Declaration

**Use `const` by default, `let` when reassignment needed, never `var`.**

```typescript
// Bad
var count = 0;

// Good
const users = [];
let count = 0;
```

#### Function Style

**Use arrow functions for callbacks, regular functions for named functions.**

```typescript
// Good: Arrow function for callback
users.map(user => user.name);

// Good: Regular function for named function
function createUser(input: CreateUserInput): User {
  // ...
}
```

#### Async/Await

**Prefer `async/await` over raw promises or callbacks.**

```typescript
// Bad: Promise chains
function getUser(id: string) {
  return database.query(id)
    .then(user => transformUser(user))
    .then(transformed => cache.set(id, transformed))
    .then(() => transformed);
}

// Good: async/await
async function getUser(id: string): Promise<User> {
  const user = await database.query(id);
  const transformed = transformUser(user);
  await cache.set(id, transformed);
  return transformed;
}
```

#### Import Order

**Group and order imports consistently.**

```typescript
// 1. External dependencies
import { z } from 'zod';
import express from 'express';

// 2. Internal modules (absolute imports)
import { UserRepository } from '@/domains/users/repositories';
import { logger } from '@/shared/infrastructure/logger';

// 3. Relative imports
import { validateEmail } from './validators';
import type { CreateUserInput } from './types';
```

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `const userName = ...` |
| Constants | UPPER_SNAKE_CASE | `const MAX_RETRIES = 3` |
| Functions | camelCase | `function createUser() {}` |
| Classes | PascalCase | `class UserRepository {}` |
| Interfaces | PascalCase | `interface User {}` |
| Type Aliases | PascalCase | `type UserId = string` |
| Enums | PascalCase | `enum UserStatus {}` |
| Files | kebab-case | `create-user.ts` |
| Directories | kebab-case | `user-repository/` |

---

### Python Standards

[TODO: If your project uses Python, customize this section. Otherwise, remove it.]

#### Type Hints

**Use type hints for all function signatures.**

```python
# Bad: No type hints
def create_user(email, name):
    return User(email, name)

# Good: Type hints
def create_user(email: str, name: str) -> User:
    return User(email, name)
```

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | snake_case | `user_name = ...` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES = 3` |
| Functions | snake_case | `def create_user(): ...` |
| Classes | PascalCase | `class UserRepository: ...` |
| Methods | snake_case | `def get_user(self): ...` |
| Modules | snake_case | `user_repository.py` |
| Packages | snake_case | `user_repository/` |

#### String Formatting

**Prefer f-strings for string formatting.**

```python
# Bad: % formatting or .format()
message = "Hello, %s" % name
message = "Hello, {}".format(name)

# Good: f-strings
message = f"Hello, {name}"
```

#### Context Managers

**Use context managers for resource management.**

```python
# Bad: Manual cleanup
file = open('data.txt')
data = file.read()
file.close()

# Good: Context manager
with open('data.txt') as file:
    data = file.read()
```

---

### Rust Standards

[TODO: If your project uses Rust, customize this section. Otherwise, remove it.]

#### Error Handling

**Use `Result<T, E>` for operations that can fail.**

```rust
// Bad: panic on error
fn get_user(id: &str) -> User {
    database.query(id).expect("User not found")
}

// Good: Return Result
fn get_user(id: &str) -> Result<User, DatabaseError> {
    database.query(id)
}
```

#### Ownership

**Follow Rust ownership rules.**

- Prefer borrowing over cloning when possible
- Use `&` for immutable borrows, `&mut` for mutable borrows
- Clone only when necessary

```rust
// Bad: Unnecessary clone
fn process_user(user: User) -> String {
    let name = user.name.clone();
    format!("Processing {}", name)
}

// Good: Borrow instead
fn process_user(user: &User) -> String {
    format!("Processing {}", user.name)
}
```

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | snake_case | `let user_name = ...` |
| Constants | UPPER_SNAKE_CASE | `const MAX_RETRIES: u32 = 3` |
| Functions | snake_case | `fn create_user() {}` |
| Structs | PascalCase | `struct UserRepository {}` |
| Enums | PascalCase | `enum UserStatus {}` |
| Traits | PascalCase | `trait Repository {}` |
| Modules | snake_case | `mod user_repository;` |

---

### Go Standards

[TODO: If your project uses Go, customize this section. Otherwise, remove it.]

#### Error Handling

**Check errors explicitly.**

```go
// Bad: Ignoring errors
user, _ := getUser(id)

// Good: Checking errors
user, err := getUser(id)
if err != nil {
    return nil, fmt.Errorf("failed to get user: %w", err)
}
```

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName := ...` |
| Constants | PascalCase or camelCase | `const MaxRetries = 3` |
| Functions | PascalCase (exported) | `func CreateUser() {}` |
| Functions | camelCase (unexported) | `func validateEmail() {}` |
| Structs | PascalCase | `type UserRepository struct {}` |
| Interfaces | PascalCase | `type Repository interface {}` |
| Packages | lowercase (single word) | `package user` |

---

## File Organization

[TODO: Define how files should be organized in your project.]

### Directory Structure

Follow the structure defined in [How We Write Software](./writing-software.md#code-organization).

### File Naming

**Use consistent, descriptive file names.**

- **Files should describe their primary export**: `user-repository.ts`, not `index.ts`
- **One primary export per file**: If file exports multiple things, consider splitting
- **Use appropriate extensions**: `.ts` for TypeScript, `.test.ts` for tests, etc.

```
Good structure:
src/domains/users/
├── actions/
│   ├── create-user.ts         # Exports createUser()
│   └── update-user.ts         # Exports updateUser()
├── models/
│   └── user.ts                # Exports User class
└── repositories/
    └── user-repository.ts     # Exports UserRepository interface
```

### Import Paths

**Use absolute imports for cross-domain imports, relative for within-domain.**

[TODO: Configure your project for absolute imports and document the path aliases.]

```{{LANGUAGE}}
// Cross-domain: Use absolute imports
import { logger } from '@/shared/infrastructure/logger';
import { createOrder } from '@/domains/orders/actions/create-order';

// Within domain: Use relative imports
import { User } from '../models/user';
import { validateEmail } from './validators';
```

---

## Naming Conventions

### General Naming Rules

1. **Be descriptive**: Names should explain what something does
2. **Be consistent**: Use the same name for the same concept
3. **Avoid abbreviations**: Except for widely understood ones (HTTP, API, URL)
4. **Use domain language**: Use terms from business domain

### Variables

**Name variables after what they contain.**

```{{LANGUAGE}}
// Bad: Unclear names
const d = new Date();
const temp = user.email;

// Good: Descriptive names
const createdAt = new Date();
const userEmail = user.email;
```

### Functions

**Name functions as verbs or verb phrases.**

- Actions: `createUser`, `deleteOrder`, `sendEmail`
- Queries: `getUser`, `findOrders`, `isValid`
- Predicates: `isActive`, `hasPermission`, `canAccess`

```{{LANGUAGE}}
// Bad: Noun or unclear
function user() { }
function data() { }

// Good: Verb or verb phrase
function createUser() { }
function loadUserData() { }
```

### Boolean Variables and Functions

**Use affirmative names with clear boolean meaning.**

```{{LANGUAGE}}
// Bad: Negative or unclear
let notReady = false;
let flag = true;
function check() { }

// Good: Affirmative and clear
let isReady = true;
let hasPermission = true;
function isValid() { }
function canEdit() { }
```

### Classes and Types

**Name classes and types as nouns.**

```{{LANGUAGE}}
// Good examples
class UserRepository { }
interface PaymentService { }
type OrderStatus = 'pending' | 'confirmed' | 'shipped';
```

### Constants

**Name constants after their meaning, not their value.**

```{{LANGUAGE}}
// Bad: Named after value
const FORTY_TWO = 42;
const THREE_SECONDS = 3000;

// Good: Named after meaning
const ANSWER_TO_LIFE = 42;
const REQUEST_TIMEOUT_MS = 3000;
```

---

## Code Structure

### Function Order

**Order functions from high-level to low-level (stepdown rule).**

```{{LANGUAGE}}
// High-level function first
export async function processOrder(orderId: string) {
  const order = await loadOrder(orderId);
  const validated = validateOrder(order);
  return saveOrder(validated);
}

// Supporting functions below
async function loadOrder(id: string) { }
function validateOrder(order: Order) { }
async function saveOrder(order: Order) { }
```

### Early Returns

**Use early returns to reduce nesting.**

```{{LANGUAGE}}
// Bad: Nested conditions
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.email) {
        // ... do something
      }
    }
  }
}

// Good: Early returns
function processUser(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.email) return;

  // ... do something
}
```

### Guard Clauses

**Validate inputs at the start of functions.**

```{{LANGUAGE}}
function createUser(input: CreateUserInput) {
  // Guards first
  if (!input.email) {
    throw new Error('Email required');
  }
  if (!input.name) {
    throw new Error('Name required');
  }

  // Happy path
  return new User(input);
}
```

### Object and Array Destructuring

**Use destructuring for cleaner code.**

```{{LANGUAGE}}
// Bad: Repeated property access
function formatUser(user) {
  return `${user.name} (${user.email})`;
}

// Good: Destructuring
function formatUser({ name, email }) {
  return `${name} (${email})`;
}
```

---

## Error Handling

### Error Handling Strategy

[TODO: Document your project's error handling approach.]

**Use explicit error handling (Result type or exceptions).**

For our project, we use {{ERROR_HANDLING_APPROACH}}:

[TODO: Choose one and document it]

#### Option 1: Result Type (Recommended for new projects)

```{{LANGUAGE}}
// Return Result for operations that can fail
async function createUser(input: CreateUserInput): Promise<Result<User, CreateUserError>> {
  // Validation
  if (!isValidEmail(input.email)) {
    return err({ type: 'INVALID_EMAIL', email: input.email });
  }

  // Operation
  try {
    const user = await userRepository.create(input);
    return ok(user);
  } catch (error) {
    return err({ type: 'DATABASE_ERROR', message: error.message });
  }
}

// Caller must handle both cases
const result = await createUser(input);
if (!result.ok) {
  // Handle error
}
```

#### Option 2: Exceptions (Common in existing projects)

```{{LANGUAGE}}
// Throw exceptions for errors
async function createUser(input: CreateUserInput): Promise<User> {
  // Validation
  if (!isValidEmail(input.email)) {
    throw new ValidationError('Invalid email', { email: input.email });
  }

  // Operation
  const user = await userRepository.create(input);
  return user;
}

// Caller uses try/catch
try {
  const user = await createUser(input);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  }
}
```

### Error Types

**Create specific error types for different failures.**

[TODO: Document your error type structure]

```{{LANGUAGE}}
[TODO: Provide examples of error types used in your project]
```

### Error Messages

**Error messages should be actionable.**

```{{LANGUAGE}}
// Bad: Vague
throw new Error('Invalid input');

// Good: Specific and actionable
throw new ValidationError('Email must be a valid email address', {
  field: 'email',
  value: input.email,
  constraint: 'email format',
});
```

---

## Comments and Documentation

### When to Comment

**Comment the WHY, not the WHAT.**

```{{LANGUAGE}}
// Bad: Describing what code does
// Set user name to empty string
user.name = '';

// Good: Explaining why
// Clear name to trigger re-validation on next save
user.name = '';

// Good: Explaining non-obvious business rule
// Users created via OAuth don't need email verification
// because the OAuth provider has already verified the email
user.emailVerified = true;
```

### When NOT to Comment

**Don't comment if code is self-explanatory.**

```{{LANGUAGE}}
// Bad: Obvious comment
// Create a user
const user = new User();

// Bad: Outdated comment (code changed, comment didn't)
// Fetch user from cache (actually hits database now)
const user = await database.getUser(id);
```

### Documentation Comments (Docstrings)

[TODO: Define your docstring format for public APIs]

**Document public APIs with docstrings.**

```{{LANGUAGE}}
[TODO: Provide docstring example in your language]

// Example (TypeScript with JSDoc):
/**
 * Creates a new user account.
 *
 * @param input - User creation data
 * @param deps - Dependencies (repository, event bus)
 * @returns Result with created user or error
 *
 * @example
 * ```ts
 * const result = await createUser(
 *   { email: 'user@example.com', name: 'John' },
 *   { userRepository, eventBus }
 * );
 * ```
 */
export async function createUser(
  input: CreateUserInput,
  deps: Dependencies
): Promise<Result<User, CreateUserError>> {
  // ...
}
```

### TODO Comments

**Use TODO comments for future work.**

Format: `// TODO(@username): Description of what needs to be done`

```{{LANGUAGE}}
// TODO(@tnez): Implement rate limiting for this endpoint
// TODO(@tnez): This validation is duplicated in validators.ts - extract to shared function
```

### Attribution Comments

**Attribute necessary comments to GitHub username.**

[TODO: Document your attribution style]

```{{LANGUAGE}}
// @tnez: This timeout is longer than normal because the third-party API
// is slow and frequently times out at 30 seconds. Monitoring shows
// most requests complete within 45 seconds.
const EXTERNAL_API_TIMEOUT_MS = 60_000;
```

---

## Testing Standards

### Test File Location

[TODO: Define where tests live]

**Tests live alongside the code they test.**

```
src/domains/users/
├── actions/
│   ├── create-user.ts
│   └── create-user.test.ts
```

OR (if you prefer separate test directory):

```
src/domains/users/
├── actions/
│   └── create-user.ts
└── __tests__/
    └── create-user.test.ts
```

### Test Naming

**Test names should describe business requirements.**

```{{LANGUAGE}}
// Bad: Implementation details
test('createUser returns result')
test('validation fails')

// Good: Business requirements
test('creates user with valid input')
test('rejects duplicate email addresses')
test('suspended users cannot log in')
```

### Test Structure

**Use Arrange-Act-Assert (AAA) pattern.**

```{{LANGUAGE}}
test('creates user with valid input', async () => {
  // Arrange
  const input = { email: 'user@example.com', name: 'John' };
  const deps = {
    userRepository: new InMemoryUserRepository(),
    eventBus: new InMemoryEventBus(),
  };

  // Act
  const result = await createUser(input, deps);

  // Assert
  expect(result.ok).toBe(true);
  expect(result.value.email).toBe(input.email);
});
```

### Test Independence

**Tests should not depend on each other.**

Each test should:
- Set up its own data
- Clean up after itself
- Run in any order
- Run in parallel (if possible)

---

## Automated Enforcement

[TODO: Document your automated tooling]

### Linting

**We use {{LINTER}} to enforce code standards.**

Configuration: `{{PATH_TO_LINTER_CONFIG}}`

Run manually:
```bash
{{LINT_COMMAND}}
```

### Formatting

**We use {{FORMATTER}} to format code.**

Configuration: `{{PATH_TO_FORMATTER_CONFIG}}`

Run manually:
```bash
{{FORMAT_COMMAND}}
```

Auto-format on save: [TODO: Document editor setup]

### Type Checking

[TODO: If using statically typed language]

**We use {{TYPE_CHECKER}} for type checking.**

Run manually:
```bash
{{TYPE_CHECK_COMMAND}}
```

### Pre-commit Hooks

[TODO: Document pre-commit hooks]

**Git pre-commit hooks enforce standards automatically.**

Setup:
```bash
{{HOOK_INSTALL_COMMAND}}
```

What runs on commit:
- [ ] Linting
- [ ] Formatting
- [ ] Type checking
- [ ] Unit tests (for changed files)

### CI/CD Checks

**CI/CD pipeline enforces all standards.**

Every PR must pass:
- [ ] Linting
- [ ] Formatting check
- [ ] Type checking
- [ ] All tests
- [ ] Build succeeds

---

## Code Review Checklist

[TODO: Create a checklist that references these standards]

Use this checklist when reviewing code:

### General
- [ ] Code follows single responsibility principle
- [ ] Functions are focused and reasonably short
- [ ] Nesting depth is reasonable
- [ ] No code duplication (or duplication is justified)
- [ ] Changes include tests

### Naming
- [ ] Variables and functions have clear, descriptive names
- [ ] Names follow project conventions
- [ ] No abbreviations (except standard ones)
- [ ] Boolean names are affirmative

### Structure
- [ ] Code is organized logically
- [ ] Imports are organized correctly
- [ ] Early returns reduce nesting
- [ ] Guard clauses validate inputs

### Error Handling
- [ ] Errors are handled explicitly
- [ ] Error messages are actionable
- [ ] Error types are appropriate

### Comments
- [ ] Comments explain WHY, not WHAT
- [ ] No obvious or outdated comments
- [ ] Public APIs have documentation
- [ ] Complex logic is explained

### Testing
- [ ] Tests cover business requirements
- [ ] Test names are descriptive
- [ ] Tests are independent
- [ ] Edge cases are tested

### Standards Compliance
- [ ] Code passes linting
- [ ] Code is formatted correctly
- [ ] Types are used correctly (if applicable)
- [ ] Follows project patterns (see [patterns.md](./patterns.md))

---

## Exceptions and Overrides

### When to Break the Rules

These are guidelines, not absolute laws. Break a rule when:

1. **Clarity suffers** - Following the rule makes code less clear
2. **Performance matters** - Profiling shows a rule hurts performance
3. **External constraints** - Third-party API requires specific format
4. **Better alternative** - You have a better approach

### How to Break the Rules

When breaking a rule:

1. **Add a comment** - Explain why you're breaking the rule
2. **Attribute it** - Use your GitHub username
3. **Lint override** - Use tool-specific syntax to override linting

```{{LANGUAGE}}
// @tnez: This function is longer than our 50-line guideline because
// splitting it would make the complex algorithm harder to understand.
// The algorithm is well-tested and self-contained.
// eslint-disable-next-line max-lines-per-function
function complexAlgorithm() {
  // ... 150 lines of algorithm
}
```

---

## Standards Evolution

### Proposing Changes

To propose a change to these standards:

1. **Open an issue** - Describe the problem with current standard
2. **Propose alternative** - Suggest new approach
3. **Show examples** - Provide code examples
4. **Discuss** - Get team feedback
5. **Update document** - Update this document if accepted
6. **Refactor** - Apply to existing code (if warranted)

### Recent Changes

[TODO: Maintain changelog of standard changes]

- **{{DATE}}**: Added standard for {{TOPIC}}
- **{{DATE}}**: Updated {{TOPIC}} to allow {{EXCEPTION}}
- **{{DATE}}**: Deprecated {{OLD_PRACTICE}} in favor of {{NEW_PRACTICE}}

---

## Related Documentation

- [How We Write Software](./writing-software.md) - Overall philosophy
- [High-Level Patterns](./patterns.md) - Architectural patterns
- [Code Review](./code-review.md) - Review practices
- [Testing](./testing.md) - Testing philosophy and practices

---

## Customization Checklist

When adapting this template:

- [ ] Replace all `{{PLACEHOLDERS}}` with actual values
- [ ] Add language-specific standards for your languages
- [ ] Remove language sections you don't need
- [ ] Document your error handling approach
- [ ] Configure and document automated tooling (linters, formatters)
- [ ] Create code review checklist
- [ ] Add examples from your actual codebase
- [ ] Link to linter/formatter configuration files
- [ ] Set up pre-commit hooks
- [ ] Document CI/CD checks

---

*This is a living document. Last updated: {{DATE}} by {{AUTHOR}}*
