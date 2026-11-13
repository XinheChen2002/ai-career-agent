# Client

The client isn't a focus of this course, but your app needs one: it's how
people actually use what you've built on the server. Describe it at a high
level — what it is, what people can do with it, and how it connects to your
server. At Checkpoint 1, describe what you **plan** to build. Once it's
built, describe what's actually there.

## What kind of client

What you're building and with what. The starter's `client/` is set up for
React with Vite, as in class. If you use something else (a mobile app, a
different framework), say what and why, and how we run it (in the README, not here).

## Main screens

The main screens or views, and which role uses each. Tie them to the key
flows in `overview.md`; a short list is plenty.

| Screen | Who uses it | What they can do there |
| --- | --- | --- |
| | | |

## Talking to the server

- How does the client know where the server is? (In class:
  `VITE_API_URL` in `client/.env`.)
- Where do the API calls live? (In class: one place, such as `src/api/`.)
- How does a user log in, where is the token kept, and how is it sent
  with each request?
- What does the client do when a request fails — for example, a 401 or 403?

## Real-time

How the client connects its socket, and what it does when each event in
`realtime.md` arrives (for example, reloading the data on screen, as in
class).

## Where it lives

The main folders and files under `client/src/`, so we know where to look.
