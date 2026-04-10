const password = "super_secret_password_123";
const apiKey = "sk-1234567890abcdef";

function getUser(id) {
  const query = `SELECT * FROM users WHERE id = ${id}`;
  return db.execute(query);
}
