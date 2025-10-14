# API Documentation: [API Name]

**Version:** X.Y.Z
**Base URL:** `https://api.example.com/v1`
**Last Updated:** YYYY-MM-DD
**Status:** [Beta | Stable | Deprecated]

## Overview

<!-- Brief description of what this API does -->

This API provides [brief description of functionality].

**Key Features:**

- Feature 1
- Feature 2
- Feature 3

## Authentication

<!-- How to authenticate with this API -->

### Method

This API uses [authentication method]:

- Bearer tokens
- API keys
- OAuth 2.0
- Basic auth
- Other

### Getting Credentials

1. Step 1 to obtain credentials
2. Step 2 to obtain credentials
3. Step 3 to obtain credentials

### Usage

**Header:**

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Example:**

```bash
curl -H "Authorization: Bearer abc123..." \
  https://api.example.com/v1/resource
```

## Rate Limiting

<!-- Rate limit information -->

**Limits:**

- Requests per minute: 60
- Requests per hour: 1000
- Requests per day: 10000

**Headers:**

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1640000000
```

**Exceeding Limits:**
When rate limit is exceeded, you'll receive:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "retry_after": 45
}
```

## Endpoints

### [Resource Name]

#### List [Resources]

Get a list of all resources.

**Endpoint:** `GET /resources`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `per_page` | integer | No | Items per page (default: 20, max: 100) |
| `sort` | string | No | Sort field (default: created_at) |
| `order` | string | No | Sort order: asc or desc (default: desc) |
| `filter` | string | No | Filter by status: active, inactive, all |

**Request Example:**

```bash
curl -X GET \
  "https://api.example.com/v1/resources?page=1&per_page=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "res_123",
      "name": "Resource Name",
      "status": "active",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_items": 95
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or missing authentication

  ```json
  {
    "error": "unauthorized",
    "message": "Invalid authentication token"
  }
  ```

- `429 Too Many Requests` - Rate limit exceeded

  ```json
  {
    "error": "rate_limit_exceeded",
    "message": "Rate limit exceeded"
  }
  ```

---

#### Get [Resource]

Get a specific resource by ID.

**Endpoint:** `GET /resources/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Resource ID |

**Request Example:**

```bash
curl -X GET \
  "https://api.example.com/v1/resources/res_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`

```json
{
  "id": "res_123",
  "name": "Resource Name",
  "status": "active",
  "metadata": {
    "key1": "value1",
    "key2": "value2"
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Resource doesn't exist

  ```json
  {
    "error": "not_found",
    "message": "Resource not found"
  }
  ```

---

#### Create [Resource]

Create a new resource.

**Endpoint:** `POST /resources`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Resource name (max 100 chars) |
| `status` | string | No | Status: active or inactive (default: active) |
| `metadata` | object | No | Additional metadata |

**Request Example:**

```bash
curl -X POST \
  "https://api.example.com/v1/resources" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Resource",
    "status": "active",
    "metadata": {
      "key1": "value1"
    }
  }'
```

**Response:** `201 Created`

```json
{
  "id": "res_456",
  "name": "New Resource",
  "status": "active",
  "metadata": {
    "key1": "value1"
  },
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input

  ```json
  {
    "error": "validation_error",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
  ```

- `409 Conflict` - Resource already exists

  ```json
  {
    "error": "conflict",
    "message": "Resource with this name already exists"
  }
  ```

---

#### Update [Resource]

Update an existing resource.

**Endpoint:** `PATCH /resources/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Resource ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Resource name |
| `status` | string | No | Status: active or inactive |
| `metadata` | object | No | Additional metadata |

**Request Example:**

```bash
curl -X PATCH \
  "https://api.example.com/v1/resources/res_123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

**Response:** `200 OK`

```json
{
  "id": "res_123",
  "name": "Resource Name",
  "status": "inactive",
  "metadata": {},
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

---

#### Delete [Resource]

Delete a resource.

**Endpoint:** `DELETE /resources/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Resource ID |

**Request Example:**

```bash
curl -X DELETE \
  "https://api.example.com/v1/resources/res_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `204 No Content`

(Empty response body)

**Error Responses:**

- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource cannot be deleted (e.g., has dependencies)

---

## Data Models

### Resource

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (read-only) |
| `name` | string | Resource name (max 100 chars) |
| `status` | string | Status: active or inactive |
| `metadata` | object | Additional metadata (key-value pairs) |
| `created_at` | string | ISO 8601 timestamp (read-only) |
| `updated_at` | string | ISO 8601 timestamp (read-only) |

**Example:**

```json
{
  "id": "res_123",
  "name": "Example Resource",
  "status": "active",
  "metadata": {
    "custom_field": "value"
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": [] // Optional additional details
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request format |
| 400 | `validation_error` | Validation failed |
| 401 | `unauthorized` | Invalid or missing authentication |
| 403 | `forbidden` | Insufficient permissions |
| 404 | `not_found` | Resource not found |
| 409 | `conflict` | Resource conflict |
| 429 | `rate_limit_exceeded` | Too many requests |
| 500 | `internal_error` | Server error |
| 503 | `service_unavailable` | Service temporarily unavailable |

## Pagination

List endpoints support pagination:

**Request:**

```bash
GET /resources?page=2&per_page=20
```

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "current_page": 2,
    "per_page": 20,
    "total_pages": 5,
    "total_items": 95,
    "has_next": true,
    "has_prev": true
  }
}
```

## Webhooks

<!-- If API supports webhooks -->

### Events

This API can send webhook notifications for:

- `resource.created`
- `resource.updated`
- `resource.deleted`

### Configuration

Configure webhooks at: `POST /webhooks`

### Payload Format

```json
{
  "event": "resource.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "id": "res_123",
    "name": "Resource Name"
  }
}
```

## SDK and Libraries

<!-- Links to official SDKs -->

Official SDKs available:

- [JavaScript/TypeScript](https://github.com/example/sdk-js)
- [Python](https://github.com/example/sdk-python)
- [Ruby](https://github.com/example/sdk-ruby)
- [Go](https://github.com/example/sdk-go)

## Changelog

### v1.1.0 (2025-01-15)

- Added filter parameter to list endpoint
- Improved error messages

### v1.0.0 (2025-01-01)

- Initial release

## Support

- **Documentation:** https://docs.example.com
- **Support Email:** api-support@example.com
- **Status Page:** https://status.example.com

---

## Template Usage Notes

### When to Create API Documentation

Document APIs for:

- REST APIs
- GraphQL APIs
- WebSocket APIs
- Internal service APIs
- Public/partner APIs

### Documentation Best Practices

- **Show examples:** Every endpoint should have request/response examples
- **Document errors:** Show all possible error responses
- **Be specific:** Include exact field types, lengths, constraints
- **Keep updated:** Update docs when API changes
- **Version clearly:** Use semantic versioning
- **Provide SDKs:** Make integration easier
- **Test examples:** Ensure all examples work

### What to Include

- Authentication and authorization
- Rate limiting
- All endpoints with examples
- Data models
- Error handling
- Pagination
- Webhooks (if applicable)
- Changelog
