# Real-time

Your real-time feature, planned the way `endpoints.md` plans your REST API.
At Checkpoint 1, describe what you **intend** to send. By the final repo,
the table should match your code. One or two events is plenty.

## The feature in one sentence

What happens live, and who sees it happen — without refreshing.

## Events

Replace the example row with your own.

| Event | Sent by | Received by | Payload | Sent when |
| --- | --- | --- | --- | --- |
| order:ready | server | the customer who placed the order | { orderId } | staff mark the order ready |
| | | | | |

## Who may listen

- How does a socket prove who it is? (Usually the same JWT your REST API
  uses, sent when the socket connects.)
- How do you make sure each event reaches only the people who should see it?
  (For example, a room per user, or per resource.) Sending every event to
  everyone is the real-time version of a missing ownership check.

## Where it lives

The files that send and receive each event, on the server and in the client,
and any tests that cover them.
