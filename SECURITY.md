# Security Policy

## Scope

Weatherminus contains a local CLI, a FastAPI backend, a React frontend, and a
Docker Compose deployment. The supported security surface is the code on
`main` and the latest tagged release, including API routes, configuration,
container boundaries, and browser-facing behavior.

## Reporting a vulnerability

Please report issues privately through GitHub's **Report a vulnerability** flow
on this repository. Never commit or paste API keys, `.env` files, personal
location data, or exploit details into a public issue. If private reporting is
unavailable, open a public issue with only a non-sensitive summary and request
a private channel.

Include the affected commit or release, deployment mode, endpoint or browser
surface, reproduction steps, and the expected versus observed behavior.

## Response

Reports are investigated against the current `main` branch and coordinated
with the reporter before disclosure. API keys should be supplied only through
the documented environment configuration, never through source control.
