// Connects the official Notion MCP server, where Fran's metaharness lives.
// Sign in once per Pi home from a session: /mcp login notion
// A "notion" entry in mcp.json takes precedence over this registration.
export default function (pi: any) {
  pi.registerMcpServer("notion", {
    url: "https://mcp.notion.com/mcp",
    // Notion exposes many tools; load them on demand through tool_search.
    exposure: "deferred",
    description: "Fran's Notion workspace: metaharness, notes, tasks and projects.",
  })
}
