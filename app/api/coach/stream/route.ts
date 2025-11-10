import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[API Proxy] Request body:", JSON.stringify(body, null, 2));

    const deploymentUrl = process.env.NEXT_PUBLIC_HEALTH_AGENT_URL;
    console.log("[API Proxy] Deployment URL:", deploymentUrl);
    if (!deploymentUrl) {
      return new Response(
        JSON.stringify({ error: "Health agent URL not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const url = `${deploymentUrl}/stream`;
    console.log("[API Proxy] Forwarding to:", url);

    // Forward the request to the health agent
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("[API Proxy] Response status:", response.status);

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `Health agent returned status ${response.status}`,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
