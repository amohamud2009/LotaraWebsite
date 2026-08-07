function getUser(id) {
  const query = `SELECT * FROM users WHERE id = ${id}`;
  return db.execute(query);
}

function processPayment(amount) {
  eval("processAmount(" + amount + ")");
  console.log(password);
}
