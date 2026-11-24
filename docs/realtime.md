# Real-time

Nothing here is built yet. This is what we intend to send.

## The feature in one sentence

A user is told the moment their study plan has finished generating, and when
they update a learning task, their other open tabs and devices show the change
— both without refreshing, and both visible only to that user.

## Events

All events are sent by the server, using Socket.IO. The client never sends
events of its own: it changes things through the REST API, and the server
sends an event after the change is saved.

| Event | Sent by | Received by | Payload | Sent when |
| --- | --- | --- | --- | --- |
| `generation:completed` | server | the user who requested the plan | `{ taskId, planId }` | a generation task finishes and its plan has been saved |
| `generation:failed` | server | the user who requested the plan | `{ taskId, error }` | a generation task fails; `error` is a message that is safe to show |
| `plan:task-updated` | server | the user who owns the plan | `{ planId, taskId, status }` | `PATCH /plans/:planId/tasks/:taskId` succeeds |

`taskId` in the two `generation:` events is the id of a **generation task**
(one background request to build a plan). `taskId` in `plan:task-updated` is
the id of a **learning task** (one step inside a plan). The two are defined in
[`data-model.md`](data-model.md).

The flow for generating a plan:

1. The client calls `POST /generation-tasks` with the target job. The server
   saves a generation task with status `pending` and answers straight away.
2. The server builds the plan in the background and saves it.
3. The server sends `generation:completed` (or `generation:failed`) to the
   user who asked.
4. The client reloads the user's plans over REST.

## Who may listen

- **Proving who a socket is.** The client sends the same JWT the REST API
  uses when it connects (in the Socket.IO `auth` option). The server verifies
  it before accepting the connection and rejects the socket if the token is
  missing, invalid or expired. Visitors, who have no token, cannot connect.
- **Reaching only the right people.** On connecting, the server puts the
  socket in a room named after the user in the token: `user:<userId>`. The
  client cannot choose or join rooms. Every event is sent to exactly one such
  room — the owner of the generation task or of the plan — and never
  broadcast. A user logged in on two devices has two sockets in the same
  room, which is what keeps them in sync.
- **Admins** get no extra events. An admin's socket is in the admin's own
  room and receives only events about the admin's own plans.

## Missed events

Events are a hint that something changed, not the record of it. If a user is
offline when their plan finishes, or refreshes the page, nothing is lost: the
state is in the database and the client reads it back over REST.

- `GET /generation-tasks/:taskId` — is this generation task still running,
  did it succeed, or did it fail?
- `GET /plans` and `GET /plans/:planId` — the user's plans and the current
  status of every learning task.

The client reloads the current screen's data whenever it loads or its socket
reconnects.

## Where it lives

Planned implementation locations. `server/src/index.ts` already exists for HTTP startup; its Socket.IO integration and the other files listed below are not implemented.

| Path | What it will hold |
| --- | --- |
| `server/src/realtime/socket.ts` | Creating the Socket.IO server, checking the JWT on connect, joining the user's room |
| `server/src/realtime/events.ts` | Event names and payload types, and one function per event that sends it to the right room |
| `server/src/index.ts` | Attaching Socket.IO to the HTTP server |
| `server/src/tests/realtime.e2e.test.ts` | A socket receives its own user's events, does not receive another user's, and is rejected without a valid token |
| `client/src/realtime/socket.ts` | Opening the connection with the token, and the handlers described in [`client.md`](client.md) |
