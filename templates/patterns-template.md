# Template: High-Level Patterns

## Overview

This document provides the template for "High-Level Patterns" documentation. This catalog describes the architectural patterns used in the project, when to apply them, and provides concrete implementation examples with links to actual code.

---

## Template Structure

### Frontmatter

```yaml
---
title: High-Level Patterns
description: Architectural patterns and design principles used in this project
last_updated: {{DATE}}
owner: {{TEAM_NAME}}
status: living
applies_to: all contributors
related:
  - writing-software.md
  - concepts/architecture.md
  - code-review.md
---
```

### Document Outline

```markdown
# High-Level Patterns

> **Purpose**: This document catalogs the architectural patterns we use in {{PROJECT_NAME}}. It explains what each pattern is, when to use it, and provides concrete examples from our codebase.

---

## Table of Contents

1. [How to Use This Document](#how-to-use-this-document)
2. [Pattern Catalog](#pattern-catalog)
3. [Core Patterns](#core-patterns)
4. [Domain Patterns](#domain-patterns)
5. [Integration Patterns](#integration-patterns)
6. [Data Patterns](#data-patterns)
7. [Testing Patterns](#testing-patterns)
8. [When to Add New Patterns](#when-to-add-new-patterns)

---

## How to Use This Document

### Purpose

This document serves as a **shared vocabulary** for discussing architecture. When we say "use the Repository pattern," everyone knows what that means and how to implement it in this project.

### Reading This Document

**If you're new**: Read [Core Patterns](#core-patterns) first - these are fundamental to understanding the codebase.

**If you're implementing a feature**: Search for patterns relevant to your work. Each pattern explains when to use it.

**If you're reviewing code**: Check if the code follows established patterns. Deviations should be justified.

### Pattern Structure

Each pattern follows this format:

- **Intent**: What problem does this pattern solve?
- **When to Use**: Scenarios where this pattern applies
- **Structure**: Diagram or code structure
- **Implementation**: Concrete examples from our codebase
- **Trade-offs**: Advantages and disadvantages
- **Related Patterns**: Patterns that complement or conflict

---

## Pattern Catalog

Quick reference of all patterns in this document:

| Pattern | Category | Purpose | Frequency |
|---------|----------|---------|-----------|
| [Domain Actions](#domain-actions) | Core | Business logic orchestration | Every domain |
| [Repository](#repository) | Core | Data access abstraction | Data-heavy domains |
| [Result Type](#result-type) | Core | Explicit error handling | All fallible operations |
| [Dependency Injection](#dependency-injection) | Core | Testability and flexibility | All actions and services |
| [Event Sourcing](#event-sourcing) | Domain | Audit trail and eventual consistency | {{TODO: FREQUENCY}} |
| [CQRS](#cqrs) | Domain | Read/write separation | {{TODO: FREQUENCY}} |
| [Saga Pattern](#saga-pattern) | Integration | Distributed transactions | {{TODO: FREQUENCY}} |
| [Adapter Pattern](#adapter-pattern) | Integration | External system integration | All external APIs |
| [Value Object](#value-object) | Data | Self-validating types | Domain models |
| [Test Builders](#test-builders) | Testing | Readable test fixtures | All tests |

[TODO: Add or remove patterns based on your project. This table should reflect patterns actually used in your codebase.]

---

## Core Patterns

These patterns are fundamental to our architecture and used throughout the codebase.

### Domain Actions

#### Intent

Encapsulate business logic as discrete, testable operations. Actions are the entry points to domain functionality.

#### When to Use

- Whenever you have a meaningful business operation
- When you need to orchestrate multiple steps
- When you need consistent error handling
- When an operation has side effects (database, events, external APIs)

#### Structure

```{{LANGUAGE}}
[TODO: Provide actual structure from your codebase]

// Generic structure:
export async function {{ACTION_NAME}}(
  input: {{INPUT_TYPE}},
  dependencies: {{DEPENDENCIES_TYPE}}
): Promise<Result<{{SUCCESS_TYPE}}, {{ERROR_TYPE}}>> {
  // 1. Validate input
  // 2. Load required data
  // 3. Check business rules
  // 4. Perform operation
  // 5. Emit events (if needed)
  // 6. Return result
}
```

#### Implementation

[TODO: Link to actual examples in your codebase]

**Example**: `{{PATH_TO_ACTION}}`

```{{LANGUAGE}}
[TODO: Paste a real action from your codebase]

// Example (TypeScript):
// src/domains/orders/actions/place-order.ts

export async function placeOrder(
  input: PlaceOrderInput,
  deps: {
    orderRepository: OrderRepository;
    inventoryService: InventoryService;
    paymentService: PaymentService;
    eventBus: EventBus;
  }
): Promise<Result<Order, PlaceOrderError>> {
  // 1. Validate input
  const validated = PlaceOrderInputSchema.safeParse(input);
  if (!validated.success) {
    return err({ type: 'INVALID_INPUT', errors: validated.error });
  }

  // 2. Check inventory
  const inventoryCheck = await deps.inventoryService.checkAvailability(
    validated.data.items
  );
  if (!inventoryCheck.available) {
    return err({ type: 'INSUFFICIENT_INVENTORY', items: inventoryCheck.unavailableItems });
  }

  // 3. Process payment
  const paymentResult = await deps.paymentService.charge({
    amount: validated.data.total,
    customerId: validated.data.customerId,
  });
  if (!paymentResult.ok) {
    return err({ type: 'PAYMENT_FAILED', reason: paymentResult.error });
  }

  // 4. Create order
  const order = await deps.orderRepository.create({
    ...validated.data,
    paymentId: paymentResult.value.id,
    status: 'confirmed',
  });

  // 5. Emit event
  await deps.eventBus.emit('order.placed', { orderId: order.id });

  return ok(order);
}
```

#### Trade-offs

**Advantages**:

- Clear entry points for business logic
- Highly testable (inject dependencies)
- Reusable across HTTP, CLI, background jobs
- Explicit error handling
- Transaction boundaries are clear

**Disadvantages**:

- More verbose than direct repository calls
- Can feel like boilerplate for simple CRUD
- Requires discipline to maintain pattern

#### Related Patterns

- Use [Repository](#repository) for data access within actions
- Use [Result Type](#result-type) for error handling
- Use [Dependency Injection](#dependency-injection) for testability

---

### Repository

#### Intent

Abstract data access behind an interface. Provides a collection-like API for domain objects.

#### When to Use

- When you need to query or persist domain entities
- When you want to abstract database implementation
- When you need to swap data sources (testing, caching)
- When multiple actions access the same data

#### Structure

```{{LANGUAGE}}
[TODO: Provide actual interface structure]

// Generic structure:
interface {{ENTITY}}Repository {
  findById(id: string): Promise<{{ENTITY}} | null>;
  findAll(filters?: {{FILTERS}}): Promise<{{ENTITY}}[]>;
  create(input: Create{{ENTITY}}Input): Promise<{{ENTITY}}>;
  update(id: string, input: Update{{ENTITY}}Input): Promise<{{ENTITY}}>;
  delete(id: string): Promise<void>;
}
```

#### Implementation

[TODO: Link to actual repository implementations]

**Example**: `{{PATH_TO_REPOSITORY}}`

```{{LANGUAGE}}
[TODO: Paste a real repository from your codebase]

// Example (TypeScript with Prisma):
// src/domains/users/repositories/user-repository.ts

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        hashedPassword: input.hashedPassword,
      },
    });
    return this.toDomain(user);
  }

  // ... other methods

  private toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.createdAt
    );
  }
}

// Test implementation
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = new User(
      generateId(),
      input.email,
      input.name,
      new Date()
    );
    this.users.set(user.id, user);
    return user;
  }

  // ... other methods
}
```

#### Trade-offs

**Advantages**:

- Decouples business logic from database
- Easy to test (in-memory implementation)
- Can switch data sources
- Clear data access API

**Disadvantages**:

- Adds layer of abstraction
- Can lead to inefficient queries (N+1 problem)
- May not expose full database capabilities
- Requires discipline to avoid leaking database details

#### Related Patterns

- Used by [Domain Actions](#domain-actions) for data access
- Often injected via [Dependency Injection](#dependency-injection)
- May use [Value Objects](#value-object) for domain models

---

### Result Type

#### Intent

Explicit error handling without exceptions. Forces caller to handle both success and failure cases.

#### When to Use

- For operations that can fail in expected ways
- When you want to avoid exceptions for control flow
- When you need type-safe error handling
- When errors carry structured information

#### Structure

```{{LANGUAGE}}
[TODO: Provide actual Result type from your codebase]

// Generic structure:
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Helper functions
function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

#### Implementation

[TODO: Link to actual Result type implementation]

**Example**: `{{PATH_TO_RESULT_TYPE}}`

```{{LANGUAGE}}
[TODO: Paste your Result type implementation]

// Example usage:
export async function createUser(
  input: CreateUserInput
): Promise<Result<User, CreateUserError>> {
  // Validate
  if (!isValidEmail(input.email)) {
    return err({ type: 'INVALID_EMAIL', email: input.email });
  }

  // Check uniqueness
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    return err({ type: 'EMAIL_EXISTS', email: input.email });
  }

  // Create user
  const user = await userRepository.create(input);
  return ok(user);
}

// Caller must handle both cases:
const result = await createUser(input);
if (result.ok) {
  console.log('Created user:', result.value);
} else {
  switch (result.error.type) {
    case 'INVALID_EMAIL':
      return res.status(400).json({ error: 'Invalid email format' });
    case 'EMAIL_EXISTS':
      return res.status(409).json({ error: 'Email already registered' });
  }
}
```

#### Trade-offs

**Advantages**:

- Explicit error handling (can't ignore errors)
- Type-safe (TypeScript knows error types)
- No hidden control flow (exceptions)
- Errors are values (can map, chain, etc.)

**Disadvantages**:

- More verbose than exceptions
- Requires discipline to use consistently
- Can be awkward in languages without pattern matching
- Error propagation requires explicit handling

#### Related Patterns

- Used by [Domain Actions](#domain-actions) for return types
- Works well with [Dependency Injection](#dependency-injection)

---

### Dependency Injection

#### Intent

Pass dependencies to components instead of importing them directly. Enables testing and flexibility.

#### When to Use

- Always, for domain actions and services
- When you need to swap implementations (production vs test)
- When you want to avoid global state
- When you need to control component lifecycle

#### Structure

```{{LANGUAGE}}
[TODO: Provide actual DI pattern from your codebase]

// Generic structure:
export async function {{ACTION_NAME}}(
  input: {{INPUT_TYPE}},
  deps: {
    {{DEPENDENCY_1}}: {{DEPENDENCY_1_TYPE}};
    {{DEPENDENCY_2}}: {{DEPENDENCY_2_TYPE}};
  }
): Promise<Result<{{SUCCESS_TYPE}}, {{ERROR_TYPE}}>> {
  // Use deps.{{DEPENDENCY_1}} instead of importing
}
```

#### Implementation

[TODO: Describe your DI approach - manual, container, framework]

**Manual Injection** (Recommended for actions):

```{{LANGUAGE}}
// src/domains/orders/actions/place-order.ts

export async function placeOrder(
  input: PlaceOrderInput,
  deps: {
    orderRepository: OrderRepository;
    paymentService: PaymentService;
    emailService: EmailService;
  }
) {
  // ... use deps instead of imports
}

// In production (e.g., HTTP handler):
import { placeOrder } from '@/domains/orders/actions/place-order';
import { PrismaOrderRepository } from '@/domains/orders/repositories';
import { StripePaymentService } from '@/shared/infrastructure/stripe';
import { SendGridEmailService } from '@/shared/infrastructure/sendgrid';

const result = await placeOrder(input, {
  orderRepository: new PrismaOrderRepository(prisma),
  paymentService: new StripePaymentService(stripeClient),
  emailService: new SendGridEmailService(sendGridClient),
});

// In tests:
const result = await placeOrder(input, {
  orderRepository: new InMemoryOrderRepository(),
  paymentService: new FakePaymentService(),
  emailService: new FakeEmailService(),
});
```

**Container-Based Injection** [TODO: If you use a DI container, document it here]:

```{{LANGUAGE}}
[TODO: Provide example if using container like tsyringe, awilix, etc.]
```

#### Trade-offs

**Advantages**:

- Easy to test (inject fakes/mocks)
- Explicit dependencies (no hidden imports)
- Flexible (swap implementations)
- No global state

**Disadvantages**:

- More verbose (pass dependencies everywhere)
- Can be tedious for deep call stacks
- Requires wiring at composition root

#### Related Patterns

- Essential for [Domain Actions](#domain-actions)
- Enables testing with [Test Builders](#test-builders)
- Works with [Repository](#repository) pattern

---

## Domain Patterns

These patterns solve specific problems in domain logic.

[TODO: Add domain patterns relevant to your project. Below are common examples - customize or replace.]

### Event Sourcing

[TODO: If you use event sourcing, document it. Otherwise, remove this section.]

#### Intent

Store state changes as a sequence of events instead of current state. Enables audit trail and time travel.

#### When to Use

- When you need complete audit history
- When you need to replay events
- When you have complex workflows
- When eventual consistency is acceptable

#### Implementation

[TODO: Link to event sourcing implementation in your codebase]

```{{LANGUAGE}}
[TODO: Provide example if using event sourcing]
```

---

### CQRS (Command Query Responsibility Segregation)

[TODO: If you use CQRS, document it. Otherwise, remove this section.]

#### Intent

Separate read and write models. Optimize each for its specific purpose.

#### When to Use

- When read and write patterns are very different
- When you need different scaling for reads vs writes
- When you need multiple read models for same data
- Often used with Event Sourcing

#### Implementation

[TODO: Link to CQRS implementation in your codebase]

```{{LANGUAGE}}
[TODO: Provide example if using CQRS]
```

---

## Integration Patterns

These patterns handle interactions with external systems.

### Adapter Pattern

#### Intent

Wrap external APIs behind an interface we control. Isolate external dependencies.

#### When to Use

- Always, when integrating with external services
- When external API is complex or unstable
- When you want to swap providers
- When you need to test without calling external API

#### Structure

```{{LANGUAGE}}
[TODO: Provide actual adapter interface]

// Generic structure:
interface {{SERVICE_NAME}}Service {
  {{METHOD_1}}(input: {{INPUT_TYPE}}): Promise<{{RETURN_TYPE}}>;
  {{METHOD_2}}(input: {{INPUT_TYPE}}): Promise<{{RETURN_TYPE}}>;
}
```

#### Implementation

[TODO: Link to actual adapter implementations]

**Example**: `{{PATH_TO_ADAPTER}}`

```{{LANGUAGE}}
[TODO: Paste a real adapter from your codebase]

// Example (TypeScript - Payment service adapter):
// src/shared/infrastructure/payment/payment-service.ts

export interface PaymentService {
  charge(input: ChargeInput): Promise<Result<Charge, PaymentError>>;
  refund(chargeId: string, amount: number): Promise<Result<Refund, PaymentError>>;
}

// Stripe implementation
export class StripePaymentService implements PaymentService {
  constructor(private stripe: Stripe) {}

  async charge(input: ChargeInput): Promise<Result<Charge, PaymentError>> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: input.amount,
        currency: 'usd',
        customer: input.customerId,
        // ... Stripe-specific options
      });

      return ok({
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: this.mapStatus(paymentIntent.status),
      });
    } catch (error) {
      return err(this.mapError(error));
    }
  }

  private mapStatus(stripeStatus: string): ChargeStatus {
    // Map Stripe statuses to our domain statuses
    switch (stripeStatus) {
      case 'succeeded': return 'succeeded';
      case 'processing': return 'pending';
      default: return 'failed';
    }
  }

  private mapError(error: any): PaymentError {
    // Map Stripe errors to our error types
    if (error.type === 'StripeCardError') {
      return { type: 'CARD_DECLINED', message: error.message };
    }
    return { type: 'UNKNOWN_ERROR', message: error.message };
  }
}

// Fake implementation for tests
export class FakePaymentService implements PaymentService {
  private charges: Map<string, Charge> = new Map();
  public shouldFail: boolean = false;

  async charge(input: ChargeInput): Promise<Result<Charge, PaymentError>> {
    if (this.shouldFail) {
      return err({ type: 'PAYMENT_PROCESSOR_ERROR', message: 'Simulated failure' });
    }

    const charge = {
      id: `charge_${Date.now()}`,
      amount: input.amount,
      status: 'succeeded' as const,
    };
    this.charges.set(charge.id, charge);
    return ok(charge);
  }

  async refund(chargeId: string, amount: number): Promise<Result<Refund, PaymentError>> {
    const charge = this.charges.get(chargeId);
    if (!charge) {
      return err({ type: 'CHARGE_NOT_FOUND', chargeId });
    }

    const refund = {
      id: `refund_${Date.now()}`,
      chargeId,
      amount,
      status: 'succeeded' as const,
    };
    return ok(refund);
  }
}
```

#### Trade-offs

**Advantages**:

- Isolates external dependency changes
- Easy to test (fake implementation)
- Can swap providers without changing domain code
- Hides vendor-specific details

**Disadvantages**:

- Adds abstraction layer
- May not expose all provider features
- Requires keeping adapter in sync with provider
- Mapping between types can be tedious

#### Related Patterns

- Used by [Domain Actions](#domain-actions) for external calls
- Injected via [Dependency Injection](#dependency-injection)

---

### Saga Pattern

[TODO: If you use sagas for distributed transactions, document it. Otherwise, remove this section.]

#### Intent

Coordinate long-running transactions across multiple services. Handle failures with compensating actions.

#### When to Use

- When you have multi-step processes across services
- When you can't use distributed transactions
- When you need failure recovery
- When eventual consistency is acceptable

#### Implementation

[TODO: Link to saga implementations in your codebase]

```{{LANGUAGE}}
[TODO: Provide example if using sagas]
```

---

## Data Patterns

These patterns handle data modeling and validation.

### Value Object

#### Intent

Self-validating, immutable types that represent domain concepts. Cannot exist in invalid state.

#### When to Use

- For domain concepts with validation rules (Email, Money, etc.)
- When you want compile-time guarantees
- When you want to prevent primitive obsession
- When equality is based on value, not identity

#### Structure

```{{LANGUAGE}}
[TODO: Provide actual value object structure]

// Generic structure:
class {{VALUE_OBJECT_NAME}} {
  private constructor(private readonly value: {{PRIMITIVE_TYPE}}) {}

  static create(value: {{PRIMITIVE_TYPE}}): Result<{{VALUE_OBJECT_NAME}}, {{ERROR_TYPE}}> {
    // Validation
    if (!isValid(value)) {
      return err({ type: 'INVALID_{{VALUE_OBJECT_NAME}}', value });
    }
    return ok(new {{VALUE_OBJECT_NAME}}(value));
  }

  getValue(): {{PRIMITIVE_TYPE}} {
    return this.value;
  }

  equals(other: {{VALUE_OBJECT_NAME}}): boolean {
    return this.value === other.value;
  }
}
```

#### Implementation

[TODO: Link to value object examples]

**Example**: `{{PATH_TO_VALUE_OBJECT}}`

```{{LANGUAGE}}
[TODO: Paste a real value object from your codebase]

// Example (TypeScript - Email value object):
// src/domains/users/models/email.ts

export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Result<Email, EmailError> {
    // Normalize
    const normalized = value.trim().toLowerCase();

    // Validate
    if (!normalized) {
      return err({ type: 'EMPTY_EMAIL' });
    }

    if (!this.isValidFormat(normalized)) {
      return err({ type: 'INVALID_FORMAT', email: value });
    }

    if (normalized.length > 254) {
      return err({ type: 'TOO_LONG', email: value, maxLength: 254 });
    }

    return ok(new Email(normalized));
  }

  private static isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Usage:
const emailResult = Email.create(userInput);
if (!emailResult.ok) {
  return err({ type: 'INVALID_INPUT', field: 'email', error: emailResult.error });
}

const email = emailResult.value;
console.log(email.getValue()); // Always valid email
```

#### Trade-offs

**Advantages**:

- Cannot exist in invalid state
- Encapsulates validation logic
- Prevents primitive obsession
- Type-safe (Email vs string)
- Immutable (thread-safe)

**Disadvantages**:

- More verbose than primitives
- Requires unwrapping to get value
- Can be tedious for simple types
- May need serialization support

#### Related Patterns

- Used in [Domain Actions](#domain-actions) for inputs
- Often returned by [Schemas](#schemas)

---

## Testing Patterns

These patterns make tests more readable and maintainable.

### Test Builders

#### Intent

Fluent API for creating test fixtures. Makes tests readable and maintainable.

#### When to Use

- When you have complex domain objects
- When tests need many variations of same object
- When default values make tests clearer
- When you want readable test setup

#### Structure

```{{LANGUAGE}}
[TODO: Provide actual test builder structure]

// Generic structure:
class {{ENTITY}}Builder {
  private data: Partial<{{ENTITY}}> = {};

  static create(): {{ENTITY}}Builder {
    return new {{ENTITY}}Builder();
  }

  with{{PROPERTY}}(value: {{TYPE}}): this {
    this.data.{{PROPERTY}} = value;
    return this;
  }

  build(): {{ENTITY}} {
    return {
      // Defaults
      id: this.data.id ?? generateId(),
      // ... other defaults
      // Override with provided data
      ...this.data,
    };
  }
}
```

#### Implementation

[TODO: Link to test builder examples]

**Example**: `{{PATH_TO_TEST_BUILDER}}`

```{{LANGUAGE}}
[TODO: Paste a real test builder from your codebase]

// Example (TypeScript - User builder):
// src/domains/users/test/user-builder.ts

export class UserBuilder {
  private user: Partial<User> = {};

  static create(): UserBuilder {
    return new UserBuilder();
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withStatus(status: UserStatus): this {
    this.user.status = status;
    return this;
  }

  suspended(): this {
    return this.withStatus('suspended');
  }

  verified(): this {
    this.user.emailVerified = true;
    return this;
  }

  build(): User {
    return {
      id: this.user.id ?? `user_${Date.now()}`,
      email: this.user.email ?? `user_${Date.now()}@example.com`,
      name: this.user.name ?? 'Test User',
      status: this.user.status ?? 'active',
      emailVerified: this.user.emailVerified ?? false,
      createdAt: this.user.createdAt ?? new Date(),
    };
  }
}

// Usage in tests:
test('suspended users cannot log in', async () => {
  const user = UserBuilder.create()
    .withEmail('test@example.com')
    .suspended()
    .build();

  const result = await loginUser({ email: user.email, password: 'password' });

  expect(result.ok).toBe(false);
  expect(result.error.type).toBe('ACCOUNT_SUSPENDED');
});

test('verified users can post comments', async () => {
  const user = UserBuilder.create()
    .verified()
    .build();

  const result = await postComment({ userId: user.id, content: 'Hello' });

  expect(result.ok).toBe(true);
});
```

#### Trade-offs

**Advantages**:

- Highly readable tests
- Reduce test boilerplate
- Easy to create variations
- Default values avoid noise
- Fluent API feels natural

**Disadvantages**:

- Additional code to maintain
- Can hide important test details
- May encourage testing implementation details
- Builder complexity can grow

#### Related Patterns

- Used in tests for [Domain Actions](#domain-actions)
- Creates domain models and [Value Objects](#value-object)

---

## When to Add New Patterns

### Pattern Addition Criteria

Add a new pattern to this document when:

1. **Used in 3+ places** - Pattern is established, not a one-off
2. **Team consensus** - Team agrees this is the right approach
3. **Non-obvious** - Not a standard language feature
4. **Affects architecture** - Influences how we structure code
5. **Needs examples** - Implementation details matter

### Pattern Proposal Process

[TODO: Define your process for adding patterns]

1. **Identify need** - Notice a recurring problem
2. **Research solutions** - Look at alternatives
3. **Prototype** - Try it in a branch
4. **Discuss** - Present to team
5. **Iterate** - Refine based on feedback
6. **Document** - Add to this document
7. **Refactor** - Apply to existing code (if warranted)

### Removing Patterns

Remove patterns when:

- No longer used in codebase
- Better pattern found
- Pattern created more problems than it solved

Archive removed patterns in git history with explanation.

---

## Anti-Patterns to Avoid

[TODO: Document anti-patterns your team explicitly avoids]

### Anti-Pattern: {{NAME}}

**What**: [Description of anti-pattern]

**Why Bad**: [Problems it causes]

**Instead Use**: [Link to preferred pattern]

**Example**:

```{{LANGUAGE}}
// Bad:
[TODO: Code example showing anti-pattern]

// Good:
[TODO: Code example showing preferred pattern]
```

---

## Examples by Tech Stack

[TODO: Provide concrete examples for your project's tech stack(s).]

### {{TECH_STACK_1}} Example

[TODO: Show how patterns are implemented in this stack]

### {{TECH_STACK_2}} Example

[TODO: Show how patterns are implemented in this stack]

---

## Pattern Evolution

This document evolves as our architecture evolves.

### Recent Changes

[TODO: Maintain changelog of pattern changes]

- **{{DATE}}**: Added [{{PATTERN_NAME}}](#{{PATTERN_ANCHOR}}) pattern for {{PURPOSE}}
- **{{DATE}}**: Removed {{OLD_PATTERN}} pattern (no longer used)
- **{{DATE}}**: Updated [{{PATTERN_NAME}}](#{{PATTERN_ANCHOR}}) implementation approach

### Review Schedule

- **Monthly**: Review new patterns added in code reviews
- **Quarterly**: Review existing patterns for relevance
- **Annually**: Comprehensive architecture review

---

## Related Documentation

- [How We Write Software](./writing-software.md) - Overall philosophy
- [Code Standards](./standards.md) - Coding conventions
- [Architecture](./concepts/architecture.md) - System architecture
- [Code Review](./code-review.md) - Review checklist references patterns

---

## Customization Checklist

When adapting this template:

- [ ] Replace all `{{PLACEHOLDERS}}` with actual values
- [ ] Add patterns actually used in your codebase
- [ ] Remove patterns you don't use
- [ ] Provide real code examples (link to actual files)
- [ ] Add tech-stack-specific examples
- [ ] Document your pattern proposal process
- [ ] Add anti-patterns your team avoids
- [ ] Link patterns to actual code locations
- [ ] Set review schedule
- [ ] Add pattern changelog

---

*This is a living document. Last updated: {{DATE}} by {{AUTHOR}}*
