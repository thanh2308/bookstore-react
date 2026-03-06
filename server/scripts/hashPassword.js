// Script để hash password cho MongoDB seeding
import bcrypt from 'bcryptjs';

const password = 'admin123';
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

console.log('Password:', password);
console.log('Hashed:', hashedPassword);
console.log('\nMongoDB Document:');
console.log(JSON.stringify({
    name: "Admin User",
    email: "admin@bookstore.com",
    password: hashedPassword,
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
}, null, 2));
