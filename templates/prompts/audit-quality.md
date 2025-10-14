# Documentation Quality Assessment

You are assessing the quality and completeness of documentation for a software project. Your goal is to provide a thorough, context-aware analysis that goes beyond simple filename matching and heuristics.

## Project Context

The project has the following characteristics:

```json
{project_context_json}
```

## Documentation Found

The following documentation files exist in the project:

```json
{documentation_json}
```

## Your Task

Assess the documentation quality and completeness with these principles:

### 1. Semantic Analysis

- Don't just check if files exist - consider whether they contain meaningful, complete content
- Read file headings to understand what topics are covered
- Consider file size and line count as indicators of depth (but not the only factor)

### 2. Context-Aware Assessment

- A CLI tool doesn't need API endpoint documentation, but a backend service does
- A solo project may not need onboarding docs, but should still document setup and usage
- Testing frameworks suggest the project cares about quality - is this reflected in the docs?
- Multiple languages/frameworks suggest complexity - is architecture documented?

### 3. Quality Over Coverage

- Having a file called "architecture.md" isn't enough if it's empty or shallow
- Well-documented code can partially compensate for missing docs
- Recent modifications suggest active development - are docs keeping pace?

### 4. Gap Identification

- Identify what's truly missing vs. what exists but is poor quality
- Consider severity based on project type and complexity
- Prioritize gaps that would block new contributors or future maintainers

## Expected Response Format

Provide your assessment as JSON in this exact structure:

```json
{
  "overallScore": 75,
  "rationale": "A 2-3 sentence explanation of the score, highlighting key strengths and weaknesses",
  "criticalGaps": [
    {
      "category": "Architecture",
      "description": "Specific issue found",
      "suggestion": "Actionable recommendation"
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "description": "What should be improved",
      "rationale": "Why this matters for this project"
    }
  ],
  "strengths": [
    "What the project is doing well with documentation",
    "Another strength"
  ]
}
```

## Scoring Guidelines

- **90-100**: Exceptional documentation covering all relevant aspects with depth and clarity
- **75-89**: Strong documentation with minor gaps or areas for improvement
- **60-74**: Adequate documentation but missing important content or lacking depth
- **40-59**: Significant gaps that would hinder new contributors or maintainability
- **0-39**: Critical documentation missing; project would be difficult to understand or maintain

## Important Notes

- Be objective but context-aware - what matters for THIS project?
- A lower score isn't necessarily bad if accompanied by clear, actionable guidance
- Acknowledge what exists and works well, not just what's missing
- Apply semantic reasoning to understand documentation quality beyond simple checks
- Focus on documentation that serves the actual needs of the project type
