// hash-passwords.js
const bcrypt = require('bcryptjs');

const passwords = ['nysei2024'];
const saltRounds = 10;

async function hashPasswords() {
  for (const password of passwords) {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
}

hashPasswords();