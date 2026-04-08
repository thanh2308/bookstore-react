import mongoose from 'mongoose';

const connectDB = async () => {
    const MAX_RETRIES = 3; 
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            break; 
            
        } catch (error) {
            retries += 1;
            console.error(`❌ Lỗi kết nối MongoDB. Đang thử lại lần ${retries}/${MAX_RETRIES}...`);
            console.error(`Chi tiết: ${error.message}`);
            
            if (retries === MAX_RETRIES) {
                console.error('🔥 Đã hết số lần thử kết nối Database. Đang tắt server!');
                process.exit(1); 
            }
            
            await new Promise(res => setTimeout(res, 5000));
        }
    }
};

export default connectDB;