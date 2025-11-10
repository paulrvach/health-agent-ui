import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    console.log("[Thread API] Fetching state for thread:", threadId);

    const deploymentUrl = process.env.NEXT_PUBLIC_HEALTH_AGENT_URL;
    console.log("[Thread API] Deployment URL:", deploymentUrl);
    if (!deploymentUrl) {
      console.error("[Thread API] No deployment URL configured");
      return Response.json(
        { error: "Health agent URL not configured" },
        { status: 500 }
      );
    }

    // Fetch thread state from the health agent
    const url = `${deploymentUrl}/threads/${threadId}/state`;
    console.log("[Thread API] Requesting:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[Thread API] Response status:", response.status);

    if (!response.ok) {
      // If thread doesn't exist, return empty state
      if (response.status === 404) {
        console.log("[Thread API] Thread not found, returning empty state");
        return Response.json({
          todos: [],
          files: {},
          messages: [],
        });
      }

      return Response.json(
        { error: `Health agent returned status ${response.status}` },
        { status: response.status }
      );
    }

    const state = await response.json();
    console.log(
      "[Thread API] Full state received:",
      JSON.stringify(state, null, 2)
    );

    // Extract todos and files from state
    const values = state.values || {};
    console.log("[Thread API] State values:", values);
    console.log("[Thread API] Todos in state:", values.todos);
    console.log(
      "[Thread API] Files in state:",
      values.files ? Object.keys(values.files) : "none"
    );

    const result = {
      todos: values.todos || [],
      files: values.files || {},
      messages: values.messages || [],
    };

    console.log("[Thread API] Returning:", result);
    return Response.json(result);
  } catch (error) {
    console.error("[Thread API] Error:", error);

    // Return empty state on error instead of failing
    return Response.json({
      todos: [],
      files: {},
      messages: [],
    });
  }
}
