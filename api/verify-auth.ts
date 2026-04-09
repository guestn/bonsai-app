export async function verifyAuthorizedFirebaseUser(
  authorizationHeader: string | undefined,
): Promise<{ email: string } | null> {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authorizationHeader.slice('Bearer '.length).trim();
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  const allowedEmail = process.env.VITE_AUTHORIZED_EMAIL;

  if (!apiKey || !allowedEmail) {
    console.error(
      'Blob API: set VITE_FIREBASE_API_KEY and VITE_AUTHORIZED_EMAIL on Vercel',
    );
    return null;
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    users?: Array<{ email?: string }>;
  };

  const email = data.users?.[0]?.email;
  if (!email || email !== allowedEmail) {
    return null;
  }

  return { email };
}

export function isAllowedBonsaiBlobPath(
  pathname: string,
  bonsaiId: string,
): boolean {
  if (pathname.includes('..') || !bonsaiId) {
    return false;
  }

  const prefix = `bonsai/${bonsaiId}/`;
  if (!pathname.startsWith(prefix)) {
    return false;
  }

  const rest = pathname.slice(prefix.length);
  if (!rest) {
    return false;
  }

  if (rest.includes('/')) {
    return false;
  }

  return true;
}
