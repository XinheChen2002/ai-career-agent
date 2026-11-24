# Roles and permissions

## Current implementation

`GET /jobs` is public. The users collection and seed data include `user` and `admin` roles, but login and authorization middleware are not implemented.

## Planned permissions

| Role | Intended permissions | Restrictions |
| --- | --- | --- |
| Visitor | Browse jobs and required skills; register or log in once implemented | Cannot access private profiles, plans or generation tasks; no catalog writes |
| User | Browse the catalog; manage own profile, request and read own plans, update own learning tasks | Cannot edit the shared catalog or access another user's private data |
| Admin | Manage jobs and skills; use personal planning features | No automatic access to another user's plans or generation events |

Visitor is an unauthenticated state, not a stored user role. Future REST handlers must enforce both role and ownership checks; hiding client controls is insufficient. Future Socket.IO events go only to the owner's room, including for admins. See [real-time design](realtime.md).
