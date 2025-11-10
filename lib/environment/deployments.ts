export interface Deployment {
  deploymentUrl: string
  agentId?: string
}

export function getDeployment(): Deployment {
  const deploymentUrl = process.env.NEXT_PUBLIC_HEALTH_AGENT_URL

  if (!deploymentUrl) {
    throw new Error(
      "NEXT_PUBLIC_HEALTH_AGENT_URL environment variable is not set"
    )
  }

  return {
    deploymentUrl,
  }
}

