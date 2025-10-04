
import { Handler } from '@netlify/functions';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { phoneNumber, password } = JSON.parse(event.body || '{}');

    if (!phoneNumber || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Phone number and password are required' }),
      };
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.phoneNumber, phoneNumber),
    });

    if (existingUser) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'User with this phone number already exists' }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      phoneNumber,
      password: hashedPassword,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User created successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating user', error: error.message }),
    };
  }
};

export { handler };
