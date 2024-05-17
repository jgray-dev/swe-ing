import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("REQUEST RECEIVED")
  if (req.method === 'POST') {
    try {
      console.log('Received POST request');
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
      res.status(200).json({ message: 'Webhook received successfully' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}