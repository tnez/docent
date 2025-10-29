---
name: domain
description: Domain model with actions, schemas, types, and effect pattern
type: multi-file
author: docent
version: 1.0.0
tags: [code, architecture, domain, effects, typescript]

variables:
  - name: domain_name
    description: Domain name (e.g., "user", "payment", "order")
    type: string
    required: true
---

# Domain: {{domain_name}}

This template creates a domain model following the actions/effects pattern with dependency injection.

## Architecture Overview

```
{{domain_name}}/
  actions/           # Business logic (pure functions, context-injected)
    ├── create-{{domain_name}}.ts
    ├── create-{{domain_name}}.test.ts
    └── ...
  schemas/           # Runtime-validated schemas (zod)
    └── {{domain_name}}.ts
  types/             # Type definitions
    └── context.ts
effects/             # Infrastructure interfaces and implementations
  ├── logger.ts      # Interface
  ├── logger.console.ts
  ├── storage.ts     # Interface
  └── storage.memory.ts
```

## Core Principles

1. **Actions are pure functions** - Business logic with context as first argument
2. **Context provides dependencies** - Dependency injection for testability
3. **Effects define interfaces** - Abstract infrastructure concerns
4. **Co-locate tests** - Keep tests next to implementation
5. **Runtime validation** - Use schemas for data crossing boundaries

---

## Schemas

Runtime-validated schemas using zod for data that crosses boundaries.

```typescript:{{domain_name}}/schemas/{{domain_name}}.ts
import { z } from 'zod';

export const {{domain_name | capitalize}}Schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type {{domain_name | capitalize}} = z.infer<typeof {{domain_name | capitalize}}Schema>;

// Input schema for creation (no id, timestamps)
export const Create{{domain_name | capitalize}}InputSchema = {{domain_name | capitalize}}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Create{{domain_name | capitalize}}Input = z.infer<typeof Create{{domain_name | capitalize}}InputSchema>;
```

---

## Context

Context provides dependency injection for effects.

```typescript:{{domain_name}}/types/context.ts
import { Logger } from '../../effects/logger';
import { Storage } from '../../effects/storage';

/**
 * Context provides access to infrastructure dependencies.
 * All actions receive context as their first argument.
 */
export interface Context {
  logger: Logger;
  storage: Storage;
}
```

---

## Actions

Actions are pure functions that encapsulate business logic. They receive context as the first argument for dependency injection.

### Create Action

```typescript:{{domain_name}}/actions/create-{{domain_name}}.ts
import { Context } from '../types/context';
import {
  Create{{domain_name | capitalize}}InputSchema,
  {{domain_name | capitalize}}Schema,
  type {{domain_name | capitalize}},
  type Create{{domain_name | capitalize}}Input
} from '../schemas/{{domain_name}}';

/**
 * Creates a new {{domain_name}}.
 *
 * @param ctx - Application context with dependencies
 * @param input - {{domain_name | capitalize}} data (will be validated)
 * @returns Created {{domain_name}} with id and timestamps
 */
export async function create{{domain_name | capitalize}}(
  ctx: Context,
  input: unknown
): Promise<{{domain_name | capitalize}}> {
  // Validate input
  const validated = Create{{domain_name | capitalize}}InputSchema.parse(input);

  // Business logic: create entity with metadata
  const now = new Date();
  const {{domain_name}}: Create{{domain_name | capitalize}}Input & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } = {
    ...validated,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  // Persist via effect
  await ctx.storage.save('{{domain_name}}', {{domain_name}});

  // Log via effect
  await ctx.logger.info('{{domain_name}} created', {
    id: {{domain_name}}.id,
    name: {{domain_name}}.name
  });

  // Validate output
  return {{domain_name | capitalize}}Schema.parse({{domain_name}});
}
```

### Create Action Tests

```typescript:{{domain_name}}/actions/create-{{domain_name}}.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { create{{domain_name | capitalize}} } from './create-{{domain_name}}';
import type { Context } from '../types/context';
import type { Logger } from '../../effects/logger';
import type { Storage } from '../../effects/storage';

describe('create{{domain_name | capitalize}}', () => {
  let ctx: Context;
  let logCalls: Array<{ message: string; meta?: any }>;
  let storageCalls: Array<{ collection: string; data: any }>;

  beforeEach(() => {
    // Reset call tracking
    logCalls = [];
    storageCalls = [];

    // Mock logger
    const mockLogger: Logger = {
      async info(message, meta) {
        logCalls.push({ message, meta });
      },
      async error(message, error) {
        logCalls.push({ message, meta: error });
      },
    };

    // Mock storage
    const mockStorage: Storage = {
      async save(collection, data) {
        storageCalls.push({ collection, data });
        return data;
      },
      async findById(collection, id) {
        return null;
      },
    };

    // Create test context
    ctx = {
      logger: mockLogger,
      storage: mockStorage,
    };
  });

  it('should create a {{domain_name}} with valid input', async () => {
    const input = {
      name: 'Test {{domain_name | capitalize}}',
    };

    const result = await create{{domain_name | capitalize}}(ctx, input);

    // Verify result structure
    expect(result).toMatchObject({
      name: input.name,
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    // Verify storage was called
    expect(storageCalls).toHaveLength(1);
    expect(storageCalls[0].collection).toBe('{{domain_name}}');

    // Verify logging was called
    expect(logCalls).toHaveLength(1);
    expect(logCalls[0].message).toBe('{{domain_name}} created');
  });

  it('should reject invalid input', async () => {
    const input = {
      name: '', // Invalid: empty string
    };

    await expect(create{{domain_name | capitalize}}(ctx, input)).rejects.toThrow();
  });

  it('should reject missing required fields', async () => {
    const input = {}; // Missing name

    await expect(create{{domain_name | capitalize}}(ctx, input)).rejects.toThrow();
  });
});
```

---

## Effects

Effects follow the pattern: define interface, then co-locate implementations. Effects represent infrastructure concerns like logging, storage, caching, etc.

### Logger Effect

Interface for logging abstraction.

```typescript:effects/logger.ts
/**
 * Logger effect for structured logging.
 * Implementations can target console, files, remote services, etc.
 */
export interface Logger {
  info(message: string, meta?: Record<string, any>): Promise<void>;
  error(message: string, error?: Error): Promise<void>;
}
```

Console implementation for development.

```typescript:effects/logger.console.ts
import { Logger } from './logger';

/**
 * Console logger implementation for development and simple deployments.
 */
export const consoleLogger: Logger = {
  async info(message, meta) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, meta || '');
  },

  async error(message, error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error || '');
  },
};
```

### Storage Effect

Interface for data persistence abstraction.

```typescript:effects/storage.ts
/**
 * Storage effect for data persistence.
 * Implementations can target memory, file system, databases, etc.
 */
export interface Storage {
  save<T>(collection: string, data: T): Promise<T>;
  findById<T>(collection: string, id: string): Promise<T | null>;
}
```

In-memory implementation for testing.

```typescript:effects/storage.memory.ts
import { Storage } from './storage';

/**
 * In-memory storage implementation for testing and development.
 * Data is lost when process exits.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, Map<string, any>>();

  async save<T extends { id: string }>(collection: string, data: T): Promise<T> {
    if (!this.store.has(collection)) {
      this.store.set(collection, new Map());
    }

    const collectionStore = this.store.get(collection)!;
    collectionStore.set(data.id, data);

    return data;
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    const collectionStore = this.store.get(collection);
    if (!collectionStore) {
      return null;
    }

    return collectionStore.get(id) || null;
  }

  // Helper for testing: clear all data
  clear(): void {
    this.store.clear();
  }
}

export const memoryStorage = new MemoryStorage();
```

---

## Usage Example

```typescript:example-usage.ts
import { create{{domain_name | capitalize}} } from './{{domain_name}}/actions/create-{{domain_name}}';
import { consoleLogger } from './effects/logger.console';
import { memoryStorage } from './effects/storage.memory';
import type { Context } from './{{domain_name}}/types/context';

async function main() {
  // Compose context with concrete implementations
  const ctx: Context = {
    logger: consoleLogger,
    storage: memoryStorage,
  };

  // Use action with injected dependencies
  const {{domain_name}} = await create{{domain_name | capitalize}}(ctx, {
    name: 'Example {{domain_name | capitalize}}',
  });

  console.log('Created:', {{domain_name}});
}

main().catch(console.error);
```

---

## Next Steps

1. Add more actions (update, delete, find, list)
2. Add validation rules specific to your domain
3. Implement production-ready effects (database storage, structured logging)
4. Add integration tests
5. Document domain-specific business rules
