import type { NextApiRequest, NextApiResponse } from 'next';
import {NextResponse} from "next/server";
import {safeParseJSON} from "@uploadthing/shared";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    try {
      console.log('Received POST request');
      console.log('Headers:', req.headers);
      // Read the request body from the ReadableStream
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
      const reader = req.body.getReader();
      const chunks = [];

      while (true) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const bodyBuffer = Buffer.concat(chunks);
      const bodyText = bodyBuffer.toString('utf-8');
      console.log(safeParseJSON(bodyText))
      return NextResponse.json({ error: 'Webhook received' }, { status: 200 })
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  } else {
    res.setHeader('Allow', 'POST');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export { handler as POST };
