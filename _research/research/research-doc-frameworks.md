# Documentation Framework Research

## Overview

This research examines six major documentation frameworks and style guides used across the software industry to understand effective documentation principles, structures, and practices.

---

## 1. Divio Documentation System / Diataxis

**Source**: https://diataxis.fr/ (formerly https://docs.divio.com/documentation-system/)

### Background

Originally developed by Daniele Procida at Divio, the framework has been renamed to **Diataxis** and represents a widely-adopted, pragmatic approach to documentation architecture. Adopted by hundreds of projects including Canonical/Ubuntu, Gatsby, Cloudflare, Python, LangChain, and numerous Web3 projects.

### Core Principle: Four Documentation Types

Diataxis identifies four fundamentally different types of documentation, each serving a distinct user need:

| Type | Purpose | User Need | Analogy |
|------|---------|-----------|---------|
| **Tutorials** | Learning-oriented | "Teach me" | Taking a child by the hand through a new experience |
| **How-to Guides** | Problem-oriented | "Show me how" | A recipe for accomplishing a specific task |
| **Reference** | Information-oriented | "Tell me" | An encyclopedia article with dry, factual descriptions |
| **Explanation** | Understanding-oriented | "Explain why" | An article discussing background and context |

### Key Characteristics

**Tutorials**
- Take the reader by the hand through a series of steps
- Learning-oriented, designed for newcomers
- Must be safe, reliable, and repeatable
- Should provide immediate, tangible results
- Example: "Build your first Django app"

**How-to Guides**
- Answer questions only users with experience could formulate
- Goal-oriented and practical
- Assume some knowledge and context
- Focus on solving specific, real-world problems
- Example: "How to configure S3 bucket permissions"

**Reference**
- Technical descriptions of machinery and how to operate it
- Information-oriented, comprehensive, and accurate
- Should reflect the structure/architecture of the thing described
- Like a map: representation matches territory
- Example: API documentation, CLI flag reference

**Explanation**
- Provides background, concepts, theoretical knowledge
- Understanding-oriented, not action-oriented
- Discusses alternatives, opinions, design decisions
- Clarifies and illuminates topics
- Example: "Why we chose event-driven architecture"

### Architectural Principles

1. **Bottom-up emergence**: Discourages top-down planning; patterns should emerge from small, responsive iterations
2. **Inside-out restructuring**: Changes documentation structure from the inside rather than imposing external structure
3. **Mirroring architecture**: Reference documentation should reflect the structure of what it describes (code modules, API endpoints, etc.)
4. **Separation of concerns**: Each documentation type has different needs and should be written differently

### What Makes It Effective

- **Clarity of purpose**: Each documentation type has a clear, single purpose
- **User-centered**: Organized around user needs rather than product features
- **Actionable framework**: Provides concrete guidance on what to write and where
- **Scalable**: Works for projects of any size
- **Adoption success**: Proven across diverse projects and domains

### Implementation Recommendations

- Start by identifying what documentation you have and categorize it into the four types
- Look for documentation that tries to serve multiple purposes and split it
- Create clear boundaries between sections
- Use consistent patterns within each type
- Allow the structure to evolve through iteration

---

## 2. Google Developer Documentation Style Guide

**Source**: https://developers.google.com/style

### Background

Released publicly in 2017 to support external contributors to open source projects (Kubernetes, AMP, Dart). Updated January 2025. Designed for technical practitioners including software developers.

### Core Principles

**Voice and Tone**
- **Second person**: Address the reader as "you"
- **Present tense**: "The API returns" not "The API will return"
- **Active voice**: "Click the button" not "The button should be clicked"
- **Serial (Oxford) comma**: Always use in lists
- **Conversational but respectful**: Sound like a knowledgeable friend

**Guidelines, Not Rules**
- The guide provides recommendations, not mandates
- Prioritize clarity and consistency for your domain
- Depart from guidelines when it improves content
- Content quality > strict adherence

### Reference Hierarchy

When questions arise, consult in this order:
1. Project-specific guidelines
2. Google Developer Documentation Style Guide
3. Third-party references (Merriam-Webster, Chicago Manual of Style)

### Key Best Practices

**Accessibility**
- Write for screen readers and assistive technology
- Provide alt text for images
- Use semantic HTML structures
- Ensure sufficient color contrast

**Global Audience**
- Write clearly for non-native English speakers
- Avoid idioms, cultural references, colloquialisms
- Use simple sentence structures
- Consider translation requirements

**Inclusive Language**
- Gender-neutral writing (use "they" as singular pronoun)
- Avoid ableist language
- Address diverse audiences
- Avoid offensive or triggering content

**Consistency**
- Follow established patterns in existing docs
- Use consistent terminology
- Maintain consistent formatting
- Create and follow style sheets for your project

### Technical Writing Recommendations

- Use descriptive link text (never "click here")
- Front-load important information
- Use headings to create scannable content
- Break content into manageable chunks
- Include code examples with explanations
- Test all procedures and code samples

### What Makes It Effective

- **Flexibility**: Adapts to project needs while providing structure
- **Comprehensive scope**: Covers technical writing, grammar, formatting, and tone
- **Accessibility focus**: Ensures documentation is usable by all
- **Real-world proven**: Used across Google's extensive documentation

### Implementation Recommendations

- Start with the quick reference guide
- Adapt principles to your project's context
- Create a project-specific style guide that references Google's
- Prioritize consistency within your project over perfect adherence
- Train team members on key principles

---

## 3. Microsoft Writing Style Guide

**Source**: https://learn.microsoft.com/en-us/style-guide/welcome/

### Background

Evolved from the Microsoft Manual of Style (last print edition 2012). Transitioned to online format in 2018 as the Microsoft Writing Style Guide. One of the most comprehensive technical writing guides available.

### Scope and Purpose

Your guide to writing style and terminology for all communication—apps, websites, white papers, and all technical content. Applies to both Microsoft and non-Microsoft materials.

### Comprehensive Coverage Areas

**Content Planning and Design**
- Structuring information architecture
- Planning content types and flows
- Design considerations for technical content
- User journey mapping

**Text Formatting**
- Responsive and scannable text
- Formatting for readability
- Visual hierarchy
- Information density

**Language and Style**
- Word choice for technical content
- Grammar and punctuation
- Acronyms and abbreviations
- Capitalization rules

**Specialized Guidance**
- Writing for different platforms (web, mobile, desktop)
- API documentation
- Error messages and UI text
- Release notes and changelogs

### Core Principles

**Scannable Content**
- Use headings and subheadings effectively
- Create meaningful lists and tables
- Front-load important information
- Use white space strategically

**Readability and Comprehension**
- Choose simple words over complex ones
- Keep sentences and paragraphs short
- Use active voice predominantly
- Avoid jargon when possible

**Professional Yet Approachable**
- Conversational without being casual
- Helpful and respectful tone
- Consistent voice across content
- Appropriate formality for context

### What Makes It Effective

- **Breadth**: Covers more ground than most style guides
- **Industry recognition**: Referenced as authoritative source across tech writing
- **Practical examples**: Includes numerous before/after examples
- **Free and accessible**: Available online to all
- **Regular updates**: Maintained and kept current

### Implementation Recommendations

- Use as primary reference for technical writing questions
- Particularly valuable for content planning sections
- Excellent resource for training new technical writers
- Supplement project-specific guidelines
- Focus on scannable content principles for developer docs

---

## 4. Write the Docs Best Practices

**Source**: https://www.writethedocs.org/guide/

### Background

Write the Docs is a global community of documentarians focused on software documentation and technical writing. Represents collective wisdom from thousands of practitioners.

### Core Documentation Principles

#### 1. Start Documentation Early

**Principle**: Begin documenting before you begin developing.

- Write requirements and specifications first
- These become first drafts of documentation
- Follows "documentation-driven design" philosophy
- Prevents knowledge loss and assumptions
- Creates shared understanding before coding

#### 2. Involve Everyone

**Principle**: Include everyone from developers to end users in the documentation process.

- Integrate documentation into standard developer workflow
- Reduce silos that isolate documentation work
- Treat docs as part of definition of done
- Enable all contributors to improve documentation

#### 3. ARID (Accept Repetition In Documentation)

**Principle**: DRY (Don't Repeat Yourself) applies to code, not documentation.

- Business logic described in code must be re-described in docs
- Repetition serves different audiences and contexts
- Same information explained different ways for different needs
- Documentation serves learning, not code reuse

#### 4. Answer Likely Questions

**Principle**: Focus on satisfying probable questions, not all possible questions.

- Cannot create enough documentation for every obscure question
- Prioritize common use cases and workflows
- Identify and address frequent pain points
- Use analytics and user feedback to guide coverage

### Structural Best Practices

#### Write Like a Newspaper

Structure content for scanning and selective reading:

**Headings**
- Descriptive and concise
- Enable quick navigation
- Create clear hierarchy
- Summarize section content

**Hyperlinks**
- Surround descriptive words (not "click here")
- Help users understand destination before clicking
- Enable quick navigation between related topics

**Paragraphs and Lists**
- Begin with identifiable concepts early
- Front-load key information
- Use lists for scannable content
- Keep paragraphs focused on single ideas

#### Include Examples

**Principle**: Many readers look to examples first for quick answers.

- Examples save time for practical learners
- Complement explanatory text
- Show real-world usage
- Provide starting points for adaptation

### What Makes It Effective

- **Community-driven**: Reflects real-world experience, not theory
- **Pragmatic**: Acknowledges real constraints and trade-offs
- **Tool-agnostic**: Principles apply regardless of tech stack
- **Holistic**: Addresses process, people, and content
- **Evidence-based**: Derived from actual practice

### Implementation Recommendations

- Start documentation in initial project planning phases
- Make documentation part of PR/code review process
- Design documentation for scanning, not sequential reading
- Include practical examples early and often
- Use analytics to identify documentation gaps
- Foster documentation culture across entire team

---

## 5. GitLab Documentation Style Guide

**Source**: https://docs.gitlab.com/development/documentation/styleguide/

### Background

GitLab maintains comprehensive style guide for their extensive product documentation. Managed by dedicated Technical Writing team that collaborates with developers, product managers, and community.

### Core Writing Standards

**Voice and Clarity**
- Write clearly and directly
- Keep translation requirements in mind
- Avoid unnecessary words
- Be concise and stick to topic goals
- Use US English with US grammar

**Active Voice Preference**
- Text is easier to understand and translate in active voice
- Subject performs the action
- More direct and engaging
- Exceptions allowed when passive is clearer

### Elements to Avoid (Translation-Focused)

**Problematic Patterns**:
- "There is" and "there are" (hide the subject)
- Ambiguous pronouns like "it"
- Words ending in -ing (can be ambiguous)
- Easily confused words ("since" vs "because")
- Latin abbreviations (e.g., i.e.)
- Culture-specific references

**Rationale**: These patterns create translation difficulties and reduce clarity for global audiences.

### Formatting Standards

**Markdown Structure**
- Write in Markdown for version control
- Split long lines at ~100 characters (except links)
- Start each sentence on new line (aids diffs)
- Use serial (Oxford) commas
- Spell out zero through nine, numerals for 10+

**Content Organization**
- Clear hierarchy with heading levels
- Consistent formatting within sections
- Meaningful link text
- Code examples with context

### Team Collaboration Model

**Technical Writing Team**:
- Collaborates with developers and PMs
- Manages docs.gitlab.com site
- Maintains documentation processes and tooling
- Reviews community contributions
- Ensures consistency across documentation

### What Makes It Effective

- **Translation-first thinking**: Anticipates global audience needs
- **Team structure**: Dedicated technical writers improve quality
- **Clear standards**: Removes ambiguity in contribution process
- **Tooling integration**: Vale rules enforce consistency automatically
- **Community-friendly**: Clear guidelines enable external contributions

### Implementation Recommendations

- Prioritize translation considerations from the start
- Use linting tools (Vale) to enforce style automatically
- Maintain word list for consistent terminology
- Involve technical writers in planning and review
- Document processes as well as products
- Make style guide accessible and discoverable

---

## 6. Comparison Matrix

| Framework | Primary Focus | Best For | Key Strength | Implementation Complexity |
|-----------|---------------|----------|--------------|---------------------------|
| **Diataxis** | Documentation architecture | Organizing doc strategy | Clear structural framework | Medium |
| **Google** | Technical writing style | Developer documentation | Flexibility + accessibility | Low |
| **Microsoft** | Comprehensive style | Enterprise documentation | Breadth of coverage | Medium |
| **Write the Docs** | Community practices | Building doc culture | Practical wisdom | Low |
| **GitLab** | Translation + collaboration | Global open source | Translation-first approach | Medium |

---

## Synthesis: Common Themes

### 1. User-Centered Organization
All frameworks emphasize organizing documentation around user needs, not product features or internal structure.

### 2. Clarity Above All
Simplicity, directness, and clarity consistently ranked above cleverness or complexity.

### 3. Scannable Structure
Universal agreement on importance of headings, lists, and visual hierarchy for enabling quick information discovery.

### 4. Active Voice + Present Tense
Near-universal recommendation for active voice and present tense for clarity and directness.

### 5. Consistent Patterns
All frameworks emphasize consistency within a documentation set as critical for usability.

### 6. Practical Examples
Every framework recommends including real-world examples to ground explanations.

### 7. Global Audience
Growing emphasis on writing for translation and non-native English speakers.

### 8. Accessibility
Increasing focus on ensuring documentation is usable by people with disabilities.

---

## Key Principles for Project Documentation Template

Based on analysis of these frameworks, a documentation template should:

1. **Adopt Diataxis structure** as organizational framework (tutorials, how-to, reference, explanation)
2. **Use Google's flexible guidelines** for style (guidelines not rules, adapt to context)
3. **Apply Write the Docs practices** for process integration (docs-driven development, involve everyone)
4. **Follow GitLab's translation principles** for global accessibility (avoid problematic patterns)
5. **Reference Microsoft guide** for comprehensive technical writing questions
6. **Provide clear examples** showing proper structure and content for each doc type
7. **Make it scannable** with strong headings, front-loaded information, meaningful links
8. **Support multiple audiences** with clear pathways for different user needs
9. **Enable easy contribution** with clear guidelines and automated enforcement
10. **Evolve over time** through iterative improvement rather than top-down imposition

---

## Citations and Further Reading

- **Diataxis Framework**: https://diataxis.fr/
- **Google Developer Documentation Style Guide**: https://developers.google.com/style
- **Microsoft Writing Style Guide**: https://learn.microsoft.com/en-us/style-guide/welcome/
- **Write the Docs Guide**: https://www.writethedocs.org/guide/
- **GitLab Documentation Style Guide**: https://docs.gitlab.com/development/documentation/styleguide/
- **Write the Docs Documentation Principles**: https://www.writethedocs.org/guide/writing/docs-principles/

---

*Research conducted: 2025-10-11*
