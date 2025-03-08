# Cursor Development Rules - Svenssons Bygg AB
## Coding Standards
- Use strict TypeScript typing, avoid 'any'.
- Follow SOLID principles (Single Responsibility, Open/Closed, etc.).
- Write unit tests for all public methods using Jest.
- Document with JSDoc for all functions.
- Colors: #1E2A44 (background), #3498DB (accents), #E74C3C (errors).
- Animation: 0.3s slide transitions, 0.5s bounce for interactions.
## AI Guidelines
- Break tasks into small, specific instructions (e.g., "Add dependency logic to Gantt").
- Reference @{architecture.mermaid}, @{status.md}, @{technical.md}, @{tasks.md}, @{legal.md} for context.
- Avoid code duplication; validate against existing files.
- Test edge cases (e.g., 1000 tasks, multi-tenant conflicts).
## Project Constraints
- Optimize for 500-1000 projects across 100 companies with multi-tenant support.
- Ensure GDPR compliance for employee and customer data.
- Maintain 99.9% uptime for SaaS deployment.
- Integrate with existing manöverpanel and task-kort design. 