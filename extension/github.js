// Small wrapper around the GitHub API for reading and saving files in the diary repo.

const API = "https://api.github.com";

export class GitHubError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const MESSAGES = {
  401: "Your GitHub token isn't working. It may have expired. Create a new one and add it in Settings.",
  403: "Your token can't write to this repo. Check it has Contents: Read and write access to your diary repo.",
  404: "Can't find your diary repo. Check the repo name in Settings, and that your token can access it.",
  409: "GitHub couldn't save the file just now. Please try again.",
  422: "GitHub couldn't save the file just now. Please try again."
};

// GitHub stores file content as base64. These handle emoji and other non-English characters.
export const toBase64 = text => {
  let binary = "";
  new TextEncoder().encode(text).forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
};
export const fromBase64 = b64 =>
  new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), c => c.charCodeAt(0)));

// Accepts "user/repo", a GitHub URL, or an SSH clone address.
export function parseRepo(value) {
  const cleaned = value.trim()
    .replace(/^git@github\.com:/, "")
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/+$/, "");
  const parts = cleaned.split("/");
  return parts.length >= 2 && parts[0] && parts[1] ? `${parts[0]}/${parts[1]}` : null;
}

const encodePath =path => path.split("/").map(encodeURIComponent).join("/");

async function request(token, url, { method = "GET", body, allow404 = false } = {}) {
  let res;
  try {
    res = await fetch(`${API}${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new GitHubError("Can't reach GitHub. Check your internet connection.", 0);
  }
  if (res.status === 404 && allow404) return null;
  if (!res.ok) throw new GitHubError(MESSAGES[res.status] ?? `GitHub returned an error (${res.status}).`, res.status);
  return res.json();
}

export async function testConnection({ token, repo }) {
  const data = await request(token, `/repos/${repo}`);
  return { fullName: data.full_name, isPrivate: data.private, canPush: data.permissions?.push !== false };
}

export async function getFile({ token, repo, path }) {
  const data = await request(token, `/repos/${repo}/contents/${encodePath(path)}`, { allow404: true });
  return data ? { content: fromBase64(data.content), sha: data.sha } : null;
}

export async function putFile({ token, repo, path, content, sha, message }) {
  const data = await request(token, `/repos/${repo}/contents/${encodePath(path)}`, {
    method: "PUT",
    body: { message, content: toBase64(content), ...(sha ? { sha } : {}) }
  });
  return { url: data.content?.html_url };
}
