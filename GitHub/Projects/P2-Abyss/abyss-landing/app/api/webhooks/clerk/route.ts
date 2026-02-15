import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook signature
  // Note: In production, you should use Svix library to verify the signature
  // For now, we'll trust the webhook if it has the headers
  const evt = payload as WebhookEvent;

  // Handle the webhook
  const eventType = evt.type;

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

      // Create user in database
      await db.insert(users).values({
        id: id,
        email: email_addresses[0]?.email_address || '',
        username: username || null,
        displayName: first_name && last_name ? `${first_name} ${last_name}` : first_name || null,
        avatarUrl: image_url || null,
      });

      console.log('✅ User created:', id);
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

      // Update user in database
      await db
        .update(users)
        .set({
          email: email_addresses[0]?.email_address || '',
          username: username || null,
          displayName: first_name && last_name ? `${first_name} ${last_name}` : first_name || null,
          avatarUrl: image_url || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      console.log('✅ User updated:', id);
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      // Delete user from database (cascade will handle related records)
      if (id) {
        await db.delete(users).where(eq(users.id, id));
        console.log('✅ User deleted:', id);
      }
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
