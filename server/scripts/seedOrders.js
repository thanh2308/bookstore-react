import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Book from '../src/models/Book.js';

dotenv.config();

const seedOrders = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Get users and books
        const users = await User.find();
        const books = await Book.find().limit(10);

        if (users.length === 0 || books.length === 0) {
            console.log('❌ Please seed users and books first!');
            process.exit(1);
        }

        const customer = users.find(u => u.role === 'user');
        if (!customer) {
            console.log('❌ No customer found!');
            process.exit(1);
        }

        // Clear existing orders
        await Order.deleteMany({});
        console.log('🗑️  Cleared existing orders');

        // Create sample orders
        const sampleOrders = [
            {
                user: customer._id,
                customer: {
                    name: customer.name,
                    email: customer.email,
                    phone: customer.addresses[0]?.phone || '0987654321'
                },
                items: [
                    {
                        book: books[0]._id,
                        title: books[0].title,
                        price: books[0].price,
                        quantity: 2
                    },
                    {
                        book: books[1]._id,
                        title: books[1].title,
                        price: books[1].price,
                        quantity: 1
                    }
                ],
                shippingAddress: {
                    address: customer.addresses[0]?.address || '456 Đường Lê Lợi',
                    city: customer.addresses[0]?.city || 'TP.HCM'
                },
                paymentMethod: 'COD',
                itemsPrice: books[0].price * 2 + books[1].price,
                shippingPrice: 30000,
                totalPrice: books[0].price * 2 + books[1].price + 30000,
                status: 'delivered',
                paymentStatus: 'paid',
                paymentDetails: {
                    paidAt: new Date()
                }
            },
            {
                user: customer._id,
                customer: {
                    name: customer.name,
                    email: customer.email,
                    phone: customer.addresses[0]?.phone || '0987654321'
                },
                items: [
                    {
                        book: books[2]._id,
                        title: books[2].title,
                        price: books[2].price,
                        quantity: 1
                    }
                ],
                shippingAddress: {
                    address: customer.addresses[0]?.address || '456 Đường Lê Lợi',
                    city: customer.addresses[0]?.city || 'TP.HCM'
                },
                paymentMethod: 'Banking',
                itemsPrice: books[2].price,
                shippingPrice: 30000,
                totalPrice: books[2].price + 30000,
                status: 'shipping',
                paymentStatus: 'paid',
                paymentDetails: {
                    paidAt: new Date()
                }
            },
            {
                user: customer._id,
                customer: {
                    name: customer.name,
                    email: customer.email,
                    phone: customer.addresses[0]?.phone || '0987654321'
                },
                items: [
                    {
                        book: books[3]._id,
                        title: books[3].title,
                        price: books[3].price,
                        quantity: 3
                    },
                    {
                        book: books[4]._id,
                        title: books[4].title,
                        price: books[4].price,
                        quantity: 1
                    }
                ],
                shippingAddress: {
                    address: customer.addresses[0]?.address || '456 Đường Lê Lợi',
                    city: customer.addresses[0]?.city || 'TP.HCM'
                },
                paymentMethod: 'COD',
                itemsPrice: books[3].price * 3 + books[4].price,
                shippingPrice: 30000,
                totalPrice: books[3].price * 3 + books[4].price + 30000,
                status: 'pending'
            }
        ];

        // Create orders one by one to trigger pre-save hooks
        const orders = [];
        for (const orderData of sampleOrders) {
            const order = new Order(orderData);
            await order.save();
            orders.push(order);
        }

        console.log(`✅ Created ${orders.length} sample orders`);

        console.log('\n📦 Sample Orders:');
        orders.forEach((order, index) => {
            console.log(`${index + 1}. Order ${order.orderNumber}`);
            console.log(`   Items: ${order.items.length}`);
            console.log(`   Total: ${order.totalPrice.toLocaleString('vi-VN')}₫`);
            console.log(`   Status: ${order.status}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedOrders();
