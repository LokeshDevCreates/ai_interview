import { auth } from "@/firebase/admin";

export async function POST(request: Request) {
  const { uid } = await request.json();

  try {
    const customToken = await auth.createCustomToken(uid);

    return Response.json({ success: true, token: customToken });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return Response.json({ success: false }, { status: 500 });
  }
}