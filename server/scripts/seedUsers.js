import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

dotenv.config();

const sampleUsers = [
    {
        name: "Admin User",
        email: "admin@bookstore.com",
        password: "admin123",
        role: "admin",
        addresses: [
            {
                fullName: "Admin User",
                phone: "0123456789",
                address: "123 Đường Nguyễn Huệ",
                city: "TP.HCM",
                isDefault: true
            }
        ]
    },
    {
        name: "Nguyễn Văn A",
        email: "customer@bookstore.com",
        password: "customer123",
        role: "user",
        addresses: [
            {
                fullName: "Nguyễn Văn A",
                phone: "0987654321",
                address: "456 Đường Lê Lợi",
                city: "TP.HCM",
                isDefault: true
            }
        ]
    }
];

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Create users one by one to trigger pre-save hooks
        const users = [];
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            users.push(user);
        }

        console.log(`✅ Added ${users.length} sample users to database`);

        console.log('\n👥 Sample Users:');
        sampleUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.role})`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Password: ${user.password}`);
            console.log('');
        });

        console.log('💡 Login credentials:');
        console.log('Admin:    admin@bookstore.com / admin123');
        console.log('Customer: customer@bookstore.com / customer123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedUsers();
