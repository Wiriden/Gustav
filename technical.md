# Technical Specifications - Svenssons Bygg AB
## Architecture
- Frontend: React with TypeScript, Vite for build, responsive design (desktop/tablet/mobile).
- Backend: Supabase with PostgreSQL, REST API (GET/PUT), WebSocket for real-time.
- Multi-tenant: Data isolation per company_id with Row-Level Security (RLS).
## Patterns
- Repository Pattern for Supabase data access.
- Observer Pattern for real-time notifications (e.g., Gantt updates).
- Factory Pattern for Gantt task creation.
## Performance
- Paginate Gantt data (100 tasks/page).
- Cache frequent queries (e.g., employee availability) with Redis.
- Optimize for 500-1000 projects across 100 companies.
## Security
- RBAC with roles (Admin, Manager, Worker).
- Encrypt sensitive data (e.g., employee hours) with AES-256.
- GDPR compliance: Data processing agreement, user consent.
## UI/UX
- Integrate with existing task-kort and manöverpanel.
- Support ÄTA-arbeten and ROT-avdrag fields.
- Use Shadcn/UI components with Tailwind CSS (#1E2A44, #3498DB).
## Integrations
- Fortnox for billing and invoicing. 