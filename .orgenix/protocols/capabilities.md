# Capabilities and connector tools

This protocol explains how durable agents discover and use integrations such as Slack, email, GitHub, and any future capability the platform supports.

Capabilities are **named integrations** the platform makes available to a practice. Each capability is implemented by a *connector* the platform host has registered (one connector per capability). A practice declares which capabilities it expects to use in its `capabilities.json`; the platform exposes them to the agent through the runtime API.

You do **not** import or hardcode connector behavior. You discover what is available at runtime and call connector tools the same way you call any other practice tool.

## Discovery

To see which capabilities your installation supports, your practice declares, and which are currently installed:

```
GET /api/v1/capabilities
```

Response shape (illustrative):

```json
{
  "capabilities": [
    {
      "id": "slack",
      "name": "Slack",
      "description": "DM the founder and post to workspace channels.",
      "installed": true,
      "tools": ["slack.dm_founder", "slack.list_recent_dm_messages"]
    },
    {
      "id": "email",
      "name": "Email",
      "description": "Read and send the founder's email when they approve.",
      "installed": false,
      "tools": ["email.send", "email.list_recent"]
    }
  ]
}
```

`installed: true` means the founder has connected the integration and you can call its tools. `installed: false` means the capability is registered but not yet connected.

## Calling a connector tool

Connector tools live under the same dispatcher as practice tools, scoped by capability id:

```
POST /api/v1/tools/connector:<capability_id>/<tool_id>
```

Example:

```
POST /api/v1/tools/connector:slack/slack.dm_founder
Content-Type: application/json

{ "text": "Quick update: ..." }
```

If the capability is not installed, the dispatcher responds with HTTP 409 and:

```json
{
  "error": "capability_not_installed",
  "message": "Slack is not installed for this organization.",
  "capability": "slack",
  "install_url": "https://.../api/connectors/slack/install"
}
```

Treat this as the normal “not ready yet” path, not a system error.

## Asking the founder to install a capability

When you need a capability the founder has not connected yet, use:

```
POST /api/v1/capabilities/<capability_id>/request_install
Content-Type: application/json

{
  "task_id": "<the task you are working on>",
  "reason": "Short, plain-language explanation the founder will read"
}
```

The platform posts an `agent_reply` on that task containing your reason and a link the founder can click to start the install (`install_url`). After the founder completes the OAuth flow, the platform wakes you again with new task work in the normal way. Your next `GET /api/v1/capabilities` will show the capability as `installed: true`.

Do not invent install URLs or restate OAuth mechanics in your own messages. Use `request_install` and let the platform render the link.

## Behavior rules

- Always discover before assuming a tool will work. If `installed: false`, call `request_install` instead of calling the tool.
- Capabilities marked optional in the practice declaration may legitimately never be installed. Do not block on them.
- If a tool returns a non-installed error mid-task, ask the founder via `request_install` and continue with the rest of the work that does not depend on the capability.
- Connector tokens belong to the founder. Do not share them, do not expose them in messages, and do not attempt to use a capability outside the tools the connector exposes.
- The set of available capabilities is data, not policy. The platform may add new ones; your behavior toward each is governed by your practice playbooks, not by this protocol.
