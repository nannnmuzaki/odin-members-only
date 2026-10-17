import { Client } from "pg";
import process from "node:process";
import { randomUUIDv7 } from "node:crypto";
import bcrypt from "bcrypt";

try {
  process.loadEnvFile();
} catch (e) {
  console.log(e);
}

const createTablesSql = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  membership BOOLEAN NOT NULL DEFAULT FALSE,
  role VARCHAR(255) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY NOT NULL,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT fk_posts_users
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- connect-pg-simple session store
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session(expire);
`;

const DEMO_PASSWORD = "Password1!";

const DEMO_USERS = [
  {
    key: "alice",
    name: "Alice Member",
    email: "alice@example.com",
    membership: true,
    role: "USER",
  },
  {
    key: "bob",
    name: "Bob Outsider",
    email: "bob@example.com",
    membership: false,
    role: "USER",
  },
  {
    key: "admin",
    name: "Ada Admin",
    email: "admin@example.com",
    membership: true,
    role: "ADMIN",
  },
];

// 14 posts -> 2 pages at the default limit of 10.
const DEMO_POSTS = [
  {
    author: "alice",
    title: "Welcome to the clubhouse",
    text: "Glad to have you all here. Remember, what happens in the clubhouse stays in the clubhouse.",
  },
  {
    author: "bob",
    title: "Can anyone else see my name?",
    text: "I just signed up and I am not sure who can read this. Testing, testing!",
  },
  {
    author: "admin",
    title: "House rules",
    text: "Be kind, keep secrets, and do not share the passcode with outsiders.",
  },
  {
    author: "alice",
    title: "Coffee machine on floor 3",
    text: "It is finally fixed. The trick is to press the button twice, do not ask me why.",
  },
  {
    author: "admin",
    title: "Reminder: rotate the passcode",
    text: "We should change the secret passcode every few months. I will handle it.",
  },
  {
    author: "bob",
    title: "Secret handshake ideas",
    text: "I vote for something with jazz hands. Open to suggestions.",
  },
  {
    author: "alice",
    title: "Book club next Thursday",
    text: "We are reading a mystery novel. Spoiler: the butler did it.",
  },
  {
    author: "admin",
    title: "New member orientation",
    text: "Everyone joining this week, welcome aboard. Your name is now visible to the club.",
  },
  {
    author: "alice",
    title: "Lost umbrella",
    text: "Found a black umbrella near the entrance. Claim it at the front desk.",
  },
  {
    author: "bob",
    title: "Question about admins",
    text: "What exactly can admins do? Asking for a friend who is definitely not me.",
  },
  {
    author: "admin",
    title: "Admins can delete posts",
    text: "Use that power wisely. We mostly remove spam and accidental double posts.",
  },
  {
    author: "alice",
    title: "Movie night poll",
    text: "Drop your favorite heist movie in the replies. Mine is still the original Ocean's Eleven.",
  },
  {
    author: "admin",
    title: "Server maintenance",
    text: "The board will be briefly down on Sunday morning. Nothing to worry about.",
  },
  {
    author: "bob",
    title: "Thanks for the warm welcome",
    text: "This club is way more fun than I expected. See you all around.",
  },
];

function buildClient() {
  if (process.env.DATABASE_URL) {
    return new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

async function main() {
  console.log("seeding...");
  const client = buildClient();

  await client.connect();

  try {
    await client.query("BEGIN");
    await client.query(createTablesSql);

    // Rerunnable: wipe first so ids and pagination counts stay stable.
    await client.query("TRUNCATE TABLE posts, users CASCADE");
    await client.query("TRUNCATE TABLE session");

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
    const userIds = new Map();

    for (const user of DEMO_USERS) {
      const id = randomUUIDv7();
      await client.query(
        `INSERT INTO users (id, name, email, password, membership, role)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, user.name, user.email, hashedPassword, user.membership, user.role],
      );
      userIds.set(user.key, id);
    }

    for (const [index, post] of DEMO_POSTS.entries()) {
      // Space the posts an hour apart so the demo list has a clear order
      // (newest first) and pagination is deterministic.
      const hoursAgo = DEMO_POSTS.length - index;
      await client.query(
        `INSERT INTO posts (id, user_id, title, text, created_at)
         VALUES ($1, $2, $3, $4, NOW() - ($5 * INTERVAL '1 hour'))`,
        [randomUUIDv7(), userIds.get(post.author), post.title, post.text, hoursAgo],
      );
    }

    await client.query("COMMIT");
    console.log(`done: ${DEMO_USERS.length} users, ${DEMO_POSTS.length} posts`);
    console.log(`all demo accounts share the password: ${DEMO_PASSWORD}`);
  } catch (error) {
    await client.query("ROLLBACK");
    await client.end();
    throw error;
  } finally {
    await client.end();
  }
}

main();
