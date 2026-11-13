# Deployment

Where your app runs and how to reach it. You don't need to edit this file
until Checkpoint 2. At Checkpoint 2, if your app is deployed, describe the
deployment; if not, describe what you **plan** to do. By the final repo,
describe what's actually there, including how we can log in and try it.

## Where it runs

The host (for example, a GCP VM), and what runs there: the server, the
built client, MongoDB. If the client and server are served from different
places, say which is where.

## The URL

The address people use, over HTTPS:

`https://…`

## Configuration

Every environment variable the deployed app needs, and what it's for.
**Names only — never put secret values in this file.**

| Variable | Used by | What it's for |
| --- | --- | --- |
| JWT_SECRET | server | Signs login tokens |
| | | |

## Test accounts

One account for each role, so we can try every part of the app. Use
accounts made just for testing, with passwords you don't use anywhere
else: this file is in your repo.

| Role | Username | Password |
| --- | --- | --- |
| | | |

## Updating it

The steps one of you follows to put a new version live, from a fresh
`git pull` to the app running again.
