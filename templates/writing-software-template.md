# Template: How We Write Software

## Overview

This document provides the template for "How We Write Software" documentation. This is the philosophical foundation for a project's codebase - it explains the principles, patterns, and practices that guide software development on the team.

This template is based on the architectural philosophy in `/Users/tnez/Desktop/thoughts-on-application-architecture.md` and adapted to be universal yet customizable for any project.

---

## Template Structure

### Frontmatter

```yaml
---
title: How We Write Software
description: Principles and practices for writing software in this project
last_updated: {{DATE}}
owner: {{TEAM_NAME}}
status: living
applies_to: all contributors
related:
  - patterns.md
  - standards.md
  - testing.md
---
```

### Document Outline

```markdown
# How We Write Software

> **Purpose**: This document explains the principles and practices that guide how we write software in {{PROJECT_NAME}}. It's the "why" behind our code structure, testing approach, and development workflow.

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Code Organization](#code-organization)
3. [Domain-Driven Structure](#domain-driven-structure)
4. [Business Logic as Actions](#business-logic-as-actions)
5. [Testing Philosophy](#testing-philosophy)
6. [Dependencies and Integration](#dependencies-and-integration)
7. [Documentation Strategy](#documentation-strategy)
8. [Evolution and Change](#evolution-and-change)

---

## Core Philosophy

### What Matters Most

[TODO: Describe your team's core values. Examples below - customize or replace.]

We value:

1. **Clarity over cleverness** - Code should be easy to understand, not impressive.
2. **Testability over perfection** - If we can't test it, we can't trust it.
3. **Business value over technical purity** - Solve user problems, not abstract problems.
4. **Simplicity over flexibility** - Build what we need today, not what we might need someday.

### What We Optimize For

[TODO: What are your team's priorities? Customize this list.]

- Ease of understanding for new contributors
- Fast feedback loops (tests, CI/CD)
- Ability to make changes confidently
- Clear connection between code and business requirements

### What We Avoid

[TODO: What anti-patterns does your team consciously avoid?]

- Premature abstraction
- Framework lock-in
- Hidden dependencies
- Untestable code
- Documentation that duplicates code

---

## Code Organization

### Directory Structure

[TODO: Describe your actual directory structure. Below is a domain-driven example - adapt to your project.]

We organize code by **domain** (business concept), not by technical layer:

```

{{SRC_DIR}}/
├── domains/
│   ├── {{DOMAIN_1}}/
│   │   ├── actions/       # Business logic
│   │   ├── models/        # Data structures
│   │   ├── schemas/       # Runtime validation
│   │   ├── types/         # Static types
│   │   └── utils/         # Domain-specific utilities
│   │
│   └── {{DOMAIN_2}}/
│       └── [same structure]
│
├── shared/                # Cross-domain utilities
│   ├── infrastructure/    # Database, HTTP, etc.
│   └── utils/            # Generic utilities
│
└── {{ENTRY_POINT}}       # Application entry point

```

**Rationale**: Organizing by domain keeps related code together. When working on a feature, everything you need is in one place.

### Why Not MVC/Layers?

[TODO: Explain your decision if you've rejected traditional layered architecture.]

We've moved away from organizing by technical layer (controllers, models, views) because:

1. **Scattered context** - A single feature touches multiple directories
2. **Unclear boundaries** - What goes in "models" vs "services"?
3. **Artificial separation** - Business logic spread across layers

Instead, we organize by **what the code does** (domain), not **how it does it** (layer).

### When to Create a New Domain

[TODO: Provide guidance on domain boundaries.]

Create a new domain when you have:

- A clear business concept (users, orders, payments, etc.)
- Related actions that operate on that concept
- Models/types specific to that concept
- Functionality that can be understood independently

Don't create a domain for:

- Technical concerns (use `shared/infrastructure/`)
- One-off utilities (use `shared/utils/`)
- Cross-cutting concerns (use appropriate shared directory)

---

## Domain-Driven Structure

### Actions: Where Business Logic Lives

[TODO: Explain your approach to business logic. Below follows the domain actions pattern.]

**All meaningful operations** in the application are expressed as actions:

```{{LANGUAGE}}
// {{SRC_DIR}}/domains/{{DOMAIN}}/actions/{{ACTION_NAME}}.{{EXT}}

[TODO: Replace with actual code example from your project]

// Example (TypeScript):
export async function createUser(
  input: CreateUserInput
): Promise<Result<User, CreateUserError>> {
  // 1. Validate input
  const validated = validateCreateUserInput(input);
  if (!validated.ok) return validated;

  // 2. Check business rules
  const existingUser = await userRepository.findByEmail(input.email);
  if (existingUser) {
    return error({ type: 'EMAIL_ALREADY_EXISTS', email: input.email });
  }

  // 3. Create user
  const user = await userRepository.create({
    email: input.email,
    name: input.name,
    // ...
  });

  // 4. Emit event
  await eventBus.emit('user.created', { userId: user.id });

  return ok(user);
}
```

**Key Properties of Actions**:

- **Entry point** - Actions are the public API of a domain
- **Orchestration** - Actions coordinate models, repositories, external services
- **Error handling** - Actions handle and communicate errors
- **Side effects** - Actions are where side effects happen (database, events, external APIs)

### Models: Pure Logic

[TODO: Explain your model/entity pattern.]

Models contain **pure business logic** without side effects:

```{{LANGUAGE}}
[TODO: Replace with actual code example]

// Example (TypeScript):
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    private password: HashedPassword
  ) {}

  // Pure function: no side effects
  canResetPassword(token: PasswordResetToken): boolean {
    return (
      !token.isExpired() &&
      token.userId === this.id
    );
  }

  // Pure function: returns new instance
  updateName(newName: string): User {
    return new User(this.id, this.email, newName, this.password);
  }
}
```

**Key Properties of Models**:

- **Pure functions** - Deterministic, no side effects
- **Immutability** - Return new instances, don't mutate
- **Business rules** - Encode domain rules in methods
- **Testable** - Easy to test without mocks

### Schemas: Runtime Validation

[TODO: Explain your validation approach.]

Schemas validate data at runtime (from APIs, databases, user input):

```{{LANGUAGE}}
[TODO: Replace with actual validation library and example]

// Example (Zod for TypeScript):
export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
```

**When to Use Schemas**:

- Validating API request bodies
- Parsing external data (APIs, files)
- Environment variable validation
- Configuration validation

### Types: Static Types

[TODO: Explain your static typing approach, or remove this section for dynamically typed languages.]

Types provide compile-time safety:

```{{LANGUAGE}}
[TODO: Replace with actual type examples]

// Internal types (not exposed outside domain)
type UserId = string & { __brand: 'UserId' };

type UserStatus = 'active' | 'suspended' | 'deleted';

// Public types (exported from domain)
export type User = {
  id: UserId;
  email: string;
  name: string;
  status: UserStatus;
  createdAt: Date;
};
```

**Types vs Schemas**:

- **Types**: Compile-time safety, erased at runtime
- **Schemas**: Runtime validation, overhead at runtime

Use both: schemas at boundaries (API, database), types internally.

---

## Business Logic as Actions

### Why Actions?

[TODO: Explain why you've chosen this pattern, or describe your alternative.]

Actions provide:

1. **Clear entry points** - Know where to invoke business logic
2. **Testability** - Can test business logic without HTTP layer
3. **Reusability** - Same action used by web API, CLI, background jobs
4. **Orchestration** - Coordinate multiple models and services
5. **Transaction boundaries** - Clear where database transactions begin/end

### Action Structure Pattern

[TODO: Provide template for actions in your project.]

Every action follows this pattern:

```{{LANGUAGE}}
[TODO: Provide actual template]

// Example structure:
export async function {{ACTION_NAME}}(
  input: {{ACTION_INPUT}},
  dependencies: {{ACTION_DEPENDENCIES}}
): Promise<Result<{{SUCCESS_TYPE}>, {{ERROR_TYPE}}>> {
  // 1. Input validation
  // 2. Load required data
  // 3. Check business rules
  // 4. Perform operation(s)
  // 5. Emit events (if needed)
  // 6. Return result
}
```

### Action Composition

[TODO: Explain how actions call other actions, if they do.]

Actions can call other actions:

```{{LANGUAGE}}
[TODO: Provide example of action composition]

// Example:
export async function registerUser(input: RegisterUserInput) {
  // Create user
  const userResult = await createUser({
    email: input.email,
    name: input.name,
  });
  if (!userResult.ok) return userResult;

  // Send welcome email (separate action)
  const emailResult = await sendWelcomeEmail({
    userId: userResult.value.id,
  });
  if (!emailResult.ok) {
    // Log but don't fail registration
    logger.error('Failed to send welcome email', emailResult.error);
  }

  return ok(userResult.value);
}
```

**Guidelines**:

- Actions can call other actions in the same or different domains
- Keep action calls unidirectional (avoid circular dependencies)
- Consider transaction boundaries when composing actions

---

## Testing Philosophy

### What We Test

[TODO: Define your testing strategy. Below is an example based on testing business requirements.]

We focus tests on **business requirements** - what *needs* to be true for the system to work correctly.

**We test**:

1. **Business logic** - Actions and models (REQUIRED)
2. **Critical paths** - Registration, checkout, payment (REQUIRED)
3. **Edge cases** - Boundary conditions, error handling (REQUIRED)
4. **Integration points** - Database, external APIs (RECOMMENDED)

**We don't test**:

1. **Implementation details** - Private functions, internal state
2. **Framework code** - Trust that React/Vue/etc. works
3. **Trivial code** - Simple getters, pass-through functions
4. **Third-party libraries** - Trust that they have tests

### Testing Requirements by Code Type

[TODO: Customize based on your team's needs.]

| Code Type | Tests Required? | Rationale |
|-----------|----------------|-----------|
| Actions | **YES** | Business logic must be verified |
| Models | **YES** | Domain rules must be correct |
| Schemas | Optional | Usually self-evident |
| Utils | If complex | Test complex logic, skip trivial |
| Types | **NO** | Type checker verifies |
| UI Components | Optional | Test interaction logic, not rendering |

### Test Naming

[TODO: Define your test naming convention.]

Test names should express **business requirements**, not implementation details:

**Good** (business-focused):

```{{LANGUAGE}}
test('cannot create user with duplicate email')
test('order total includes tax and shipping')
test('suspended users cannot log in')
```

**Bad** (implementation-focused):

```{{LANGUAGE}}
test('createUser returns error')
test('calculateTotal adds three numbers')
test('isActive returns false')
```

### Test Organization

[TODO: Describe where tests live in your project.]

Tests live alongside the code they test:

```
{{SRC_DIR}}/domains/{{DOMAIN}}/
├── actions/
│   ├── create-user.ts
│   └── create-user.test.ts
├── models/
│   ├── user.ts
│   └── user.test.ts
```

OR (if you prefer separate test directory):

```
{{SRC_DIR}}/domains/{{DOMAIN}}/
├── actions/
│   └── create-user.ts
└── __tests__/
    └── create-user.test.ts
```

**Rationale**: [TODO: Explain your choice]

### Running Tests

[TODO: Document how to run tests in your project.]

```bash
# Run all tests
{{TEST_COMMAND}}

# Run tests for specific domain
{{TEST_COMMAND}} {{DOMAIN_PATH}}

# Run tests in watch mode
{{TEST_COMMAND_WATCH}}

# Run tests with coverage
{{TEST_COMMAND_COVERAGE}}
```

### Testing External Dependencies

[TODO: Explain your approach to mocking/faking external dependencies.]

We use **dependency injection** to make code testable:

```{{LANGUAGE}}
[TODO: Provide actual example]

// Example (TypeScript):
export async function createUser(
  input: CreateUserInput,
  deps: {
    userRepository: UserRepository;
    eventBus: EventBus;
    emailService: EmailService;
  }
) {
  // ... use deps instead of importing directly
}

// In tests:
test('creates user successfully', async () => {
  const fakeRepo = new InMemoryUserRepository();
  const fakeEventBus = new InMemoryEventBus();
  const fakeEmailService = new FakeEmailService();

  const result = await createUser(validInput, {
    userRepository: fakeRepo,
    eventBus: fakeEventBus,
    emailService: fakeEmailService,
  });

  expect(result.ok).toBe(true);
  expect(fakeEventBus.events).toContainEqual({ type: 'user.created', ... });
});
```

**Guidelines**:

- Inject dependencies, don't import them directly
- Use in-memory fakes for tests (not mocks when possible)
- Test against interfaces, not concrete implementations

---

## Dependencies and Integration

### External Dependencies

[TODO: List key external dependencies and how you use them.]

Our main external dependencies:

| Dependency | Purpose | Why We Chose It |
|------------|---------|-----------------|
| {{DEPENDENCY_1}} | {{PURPOSE_1}} | {{RATIONALE_1}} |
| {{DEPENDENCY_2}} | {{PURPOSE_2}} | {{RATIONALE_2}} |
| {{DEPENDENCY_3}} | {{PURPOSE_3}} | {{RATIONALE_3}} |

### Dependency Principles

[TODO: Define your approach to dependencies.]

1. **Minimize dependencies** - Each dependency is a liability (security, breaking changes)
2. **Prefer standards** - Use standard library when possible
3. **Evaluate carefully** - Consider maintenance, community, alternatives
4. **Pin versions** - Use exact versions, review updates carefully
5. **Isolate dependencies** - Wrap external APIs in adapters

### Integration Points

[TODO: Document how your application integrates with external systems.]

We integrate with:

1. **Database**: {{DATABASE}} via {{ORM/LIBRARY}}
2. **Cache**: {{CACHE}} via {{LIBRARY}}
3. **Message Queue**: {{QUEUE}} via {{LIBRARY}}
4. **Email**: {{EMAIL_SERVICE}} via {{LIBRARY}}
5. **Payment**: {{PAYMENT_PROVIDER}} via {{LIBRARY}}

For each integration:

- **Adapter pattern** - Wrap external API in our interface
- **Testability** - Inject adapters, use fakes in tests
- **Error handling** - Handle network failures, timeouts, rate limits
- **Monitoring** - Log and alert on integration failures

---

## Documentation Strategy

### What We Document

[TODO: Define what requires documentation in your project.]

We document:

1. **Why, not what** - Explain decisions, not just describe code
2. **Non-obvious behavior** - Surprising or complex logic
3. **External interfaces** - APIs, CLIs, configuration
4. **Architecture decisions** - Why we chose this structure/pattern
5. **Setup and deployment** - How to run locally and in production

We **don't** document:

1. **What the code does** - Code should be self-explanatory
2. **Implementation details** - Private functions don't need docs
3. **Temporary hacks** - Fix the code instead

### Documentation Format

[TODO: Specify documentation formats.]

- **Code comments**: Use for non-obvious WHY (sparingly)
- **Docstrings**: Use for public APIs (if language supports)
- **Markdown docs**: Use for concepts, guides, architecture
- **README per domain**: Use for domain overview

### Keeping Docs Current

[TODO: Explain your documentation maintenance process.]

Documentation is part of the definition of done:

- [ ] Code written
- [ ] Tests passing
- [ ] **Documentation updated**
- [ ] PR reviewed

See [doc-health.md](./doc-health.md) for documentation maintenance practices.

---

## Evolution and Change

### When to Refactor

[TODO: Provide guidance on when to refactor.]

Refactor when:

1. **Understanding is difficult** - Code is confusing to team members
2. **Changes are risky** - Hard to change without breaking things
3. **Tests are hard to write** - Indicates poor structure
4. **Duplication is excessive** - Same logic in multiple places

Don't refactor when:

1. **It's just different from what you'd write** - Style differences aren't defects
2. **You're not changing it** - Don't refactor code you're not touching
3. **It's working and tested** - Don't fix what isn't broken

### How to Propose Changes

[TODO: Document your change proposal process.]

For significant changes to how we write software:

1. **Open an issue** - Describe the problem you're solving
2. **Propose alternatives** - Consider multiple solutions
3. **Prototype if helpful** - Sometimes code clarifies ideas
4. **Discuss as a team** - Get buy-in before implementing
5. **Update this document** - Reflect the new approach here

Small improvements can go directly in PRs.

### This Document is Living

[TODO: Explain how this document evolves.]

This document reflects how we **actually** write software, not how we wish we did.

When you notice drift between this document and reality:

1. Check if the document is wrong → update the document
2. Check if the code is wrong → refactor the code
3. Check if both are valid → discuss as a team

Last reviewed: {{DATE}}
Next review: {{NEXT_REVIEW_DATE}}

---

## Examples by Tech Stack

[TODO: Provide concrete examples for your project's tech stack(s). Below are examples for common stacks.]

### JavaScript/TypeScript Example

```typescript
// src/domains/users/actions/create-user.ts

import { z } from 'zod';
import type { Result } from '@/shared/types';
import type { UserRepository } from '../repositories';
import type { EventBus } from '@/shared/infrastructure/events';
import { User } from '../models/user';
import { CreateUserInputSchema } from '../schemas';

type CreateUserError =
  | { type: 'INVALID_INPUT'; errors: z.ZodError }
  | { type: 'EMAIL_ALREADY_EXISTS'; email: string }
  | { type: 'DATABASE_ERROR'; message: string };

export async function createUser(
  input: unknown,
  deps: {
    userRepository: UserRepository;
    eventBus: EventBus;
  }
): Promise<Result<User, CreateUserError>> {
  // 1. Validate input
  const parsed = CreateUserInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { type: 'INVALID_INPUT', errors: parsed.error } };
  }

  // 2. Check business rules
  const existing = await deps.userRepository.findByEmail(parsed.data.email);
  if (existing) {
    return { ok: false, error: { type: 'EMAIL_ALREADY_EXISTS', email: parsed.data.email } };
  }

  // 3. Create user
  try {
    const user = await deps.userRepository.create(parsed.data);

    // 4. Emit event
    await deps.eventBus.emit('user.created', { userId: user.id });

    return { ok: true, value: user };
  } catch (error) {
    return { ok: false, error: { type: 'DATABASE_ERROR', message: String(error) } };
  }
}
```

### Python Example

```python
# src/domains/users/actions/create_user.py

from dataclasses import dataclass
from typing import Protocol
from result import Result, Ok, Err

from ..models.user import User
from ..schemas import CreateUserInput, validate_create_user_input

class UserRepository(Protocol):
    async def find_by_email(self, email: str) -> User | None: ...
    async def create(self, input: CreateUserInput) -> User: ...

class EventBus(Protocol):
    async def emit(self, event_type: str, payload: dict) -> None: ...

@dataclass
class EmailAlreadyExists:
    email: str

@dataclass
class ValidationError:
    errors: list[str]

CreateUserError = EmailAlreadyExists | ValidationError

async def create_user(
    input: dict,
    user_repository: UserRepository,
    event_bus: EventBus,
) -> Result[User, CreateUserError]:
    """Create a new user account.

    Business rules:
    - Email must be unique
    - Password must meet complexity requirements
    """
    # 1. Validate input
    validation_result = validate_create_user_input(input)
    if validation_result.is_err():
        return Err(ValidationError(errors=validation_result.unwrap_err()))

    validated_input = validation_result.unwrap()

    # 2. Check business rules
    existing_user = await user_repository.find_by_email(validated_input.email)
    if existing_user:
        return Err(EmailAlreadyExists(email=validated_input.email))

    # 3. Create user
    user = await user_repository.create(validated_input)

    # 4. Emit event
    await event_bus.emit('user.created', {'user_id': user.id})

    return Ok(user)
```

### Rust Example

```rust
// src/domains/users/actions/create_user.rs

use crate::domains::users::{User, UserRepository};
use crate::shared::events::EventBus;
use crate::shared::Result;

#[derive(Debug, serde::Deserialize)]
pub struct CreateUserInput {
    pub email: String,
    pub name: String,
    pub password: String,
}

#[derive(Debug, thiserror::Error)]
pub enum CreateUserError {
    #[error("Email already exists: {email}")]
    EmailAlreadyExists { email: String },

    #[error("Invalid input: {0}")]
    ValidationError(String),

    #[error("Database error: {0}")]
    DatabaseError(String),
}

pub async fn create_user(
    input: CreateUserInput,
    user_repo: &dyn UserRepository,
    event_bus: &dyn EventBus,
) -> Result<User, CreateUserError> {
    // 1. Validate input (using validation library or manual checks)
    if input.email.is_empty() || !input.email.contains('@') {
        return Err(CreateUserError::ValidationError("Invalid email".to_string()));
    }

    // 2. Check business rules
    if let Some(_existing) = user_repo.find_by_email(&input.email).await? {
        return Err(CreateUserError::EmailAlreadyExists {
            email: input.email,
        });
    }

    // 3. Create user
    let user = user_repo.create(&input).await?;

    // 4. Emit event
    event_bus
        .emit("user.created", serde_json::json!({ "user_id": user.id }))
        .await?;

    Ok(user)
}
```

---

## Customization Checklist

When adapting this template for your project:

- [ ] Replace all `{{PLACEHOLDERS}}` with actual values
- [ ] Add actual code examples from your project
- [ ] Customize core philosophy to match your team's values
- [ ] Describe your actual directory structure
- [ ] Document your testing strategy and requirements
- [ ] List your actual external dependencies
- [ ] Provide tech-stack-specific examples
- [ ] Add domain-specific guidelines
- [ ] Remove sections that don't apply
- [ ] Add sections for project-specific concerns
- [ ] Link to related documentation (patterns.md, standards.md, etc.)
- [ ] Set review schedule and owner

---

## Related Documentation

- [High-Level Patterns](./patterns.md) - Architectural patterns we use
- [Code Standards](./standards.md) - Coding conventions and style
- [Testing](./testing.md) - Testing practices and examples
- [Code Review](./code-review.md) - Review practices and checklist
- [Architecture](./concepts/architecture.md) - System architecture deep-dive

---

*This is a living document. Last updated: {{DATE}} by {{AUTHOR}}*
