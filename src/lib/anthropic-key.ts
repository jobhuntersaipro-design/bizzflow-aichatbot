/** Reads ANTHROPIC_API_KEY the way it is usually pasted, and says why a key cannot work. */

export function cleanApiKey(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/^(["'])(.*)\1$/, "$2").trim();
}

/**
 * Why a key cannot work, judged from its prefix alone — never echoes the key.
 * Only the two known wrong kinds are refused; an unfamiliar prefix is let
 * through so a future key format is not blocked by this check.
 */
export function apiKeyProblem(key: string): string | null {
  if (!key) return "ANTHROPIC_API_KEY is not set.";
  if (key.startsWith("sk-ant-admin")) {
    return "ANTHROPIC_API_KEY is an Admin API key (sk-ant-admin…), which cannot send messages. Create a regular API key (sk-ant-api…) in the Claude Console.";
  }
  if (key.startsWith("sk-ant-oat")) {
    return "ANTHROPIC_API_KEY is an OAuth token (sk-ant-oat…), not an API key. Create an API key (sk-ant-api…) in the Claude Console.";
  }
  return null;
}

