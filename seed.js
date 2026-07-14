require('dotenv').config(); // لقراءة DATABASE_URL من ملف .env
const mongoose = require('mongoose');
const { fakerEN: faker } = require('@faker-js/faker');

// 1. استيراد الموديلز الخاصة بمشروعك
const User = require('./models/user.model');
const Service = require('./models/service.model');
const Review = require('./models/review.model');
const Order = require('./models/order.model');

// 2. استيراد التصنيفات الثابتة من ملف الـ constants
const { CATEGORIES } = require('./utils/constants'); 

// --- قائمة بتوصيفات إنجليزية حقيقية ومفهومة لكل مجال لتجنب اللاتيني تماماً ---
const englishServiceData = {
    "Web Developement": {
        titles: [
            "Build a Responsive Full-Stack Web Application",
            "Develop a Custom REST API using Node.js & Express",
            "Create a High-Performance React Dashboard",
            "Bug Fixing and Performance Optimization for Web Apps"
        ],
        descriptions: [
            "I will build a modern, responsive, and secure web application tailored to your business needs using cutting-edge technologies.",
            "Need a solid backend? I will design and develop secure and scalable RESTful APIs with clean architecture and complete documentation.",
            "I will optimize your existing website's performance, fix layout issues, improve SEO scores, and make it load incredibly fast."
        ]
    },
    "Mobile Application Developement": {
        titles: [
            "Develop a Cross-Platform Flutter Mobile App",
            "Create a Beautiful React Native App for iOS & Android",
            "Custom Mobile App UI/UX Implementation"
        ],
        descriptions: [
            "Get a high-quality, native-performing mobile app for both Android and iOS devices with a single clean codebase.",
            "I will convert your app ideas into a fully functional, user-friendly mobile application with smooth animations and robust offline support.",
            "Need to integrate APIs or push notifications? I will handle all complex integrations and deploy your app to the App Store and Google Play."
        ]
    },
    "Security": {
        titles: [
            "Professional Web Application Penetration Testing",
            "Secure Your Node.js API and Fix Vulnerabilities",
            "Implement Advanced JWT and OAuth Authentication"
        ],
        descriptions: [
            "I will perform a comprehensive security audit of your web application, identify vulnerabilities, and provide a detailed patch report.",
            "Protect your users' data. I will secure your backend server against common OWASP Top 10 threats like SQL injection and XSS.",
            "I will implement state-of-the-art authentication and authorization flows to ensure only authorized users can access your valuable endpoints."
        ]
    },
    "Graphic Design": {
        titles: [
            "Design a Modern and Minimalist Brand Logo",
            "Create Complete Social Media Post Templates",
            "Professional Business Card and Stationery Design"
        ],
        descriptions: [
            "I will design a unique, eye-catching, and professional logo that represents your brand values and stands out in the market.",
            "Get high-quality, custom graphics for your Instagram, LinkedIn, or Facebook pages to boost your audience engagement and reach.",
            "I will create clean, print-ready marketing materials and corporate brand identity packages designed to impress your clients."
        ]
    },
    "Video Editing": {
        titles: [
            "Professional Video Editing for YouTube and TikTok",
            "Create Engaging Cinematic Promo and Promo Videos",
            "Add Premium Subtitles and Motion Graphics to Your Videos"
        ],
        descriptions: [
            "I will edit your raw footage into an engaging, high-retention video with smooth transitions, sound effects, and color grading.",
            "Need an outstanding commercial for your product? I will craft a high-converting promotional video with licensed background music.",
            "I will add dynamic captions, eye-catching title cards, and modern lower-thirds to make your social media reels look incredibly professional."
        ]
    }
};

async function seedDatabase() {
    try {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL is not defined in your .env file!");
        }

        // الاتصال بقاعدة البيانات أونلاين
        await mongoose.connect(connectionString);
        console.log("⚡ Connected successfully to MongoDB Atlas...");

        // تنظيف الجداول القديمة تماماً لتبدأ على نظيف
        console.log("🧹 Clearing old data from Atlas...");
        await User.deleteMany({});
        await Service.deleteMany({});
        await Review.deleteMany({});
        await Order.deleteMany({});
        console.log("🗑️ Old data cleared!");

        // --- 1. توليد مستخدمين وهميين بأسماء إنجليزية (Users) ---
        console.log("👤 Generating dummy English users...");
        const users = [];
        
        for (let i = 0; i < 10; i++) {
            const role = i % 2 === 0 ? 'seller' : 'buyer';
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            
            users.push({
                firstName: firstName,
                lastName: lastName,
                age: faker.number.int({ min: 18, max: 60 }),
                email: faker.internet.email({ firstName, lastName }).toLowerCase(),
                password: 'password123', // باسورد موحدة وسهلة للتجربة
                role: role,
                avatar: '../uploads/default-avatar.jpeg',
                balance: faker.number.int({ min: 0, max: 1000 }),
                frozenBalance: 0
            });
        }
        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} English users successfully.`);

        const sellers = createdUsers.filter(u => u.role === 'seller');
        const buyers = createdUsers.filter(u => u.role === 'buyer');

        // --- 2. توليد خدمات وهمية بتوصيفات إنجليزية مفهومة وحقيقية (Services) ---
        console.log("💼 Generating dummy English services...");
        const services = [];

        for (let i = 0; i < 10; i++) {
            const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];
            const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            
            // جلب البيانات الإنجليزية المخصصة لهذا التصنيف، وإذا لم توجد نستخدم قيم افتراضية
            const categoryData = englishServiceData[randomCategory] || englishServiceData["Web Developement"];
            const randomTitle = faker.helpers.arrayElement(categoryData.titles);
            const randomDesc = faker.helpers.arrayElement(categoryData.descriptions);

            services.push({
                title: randomTitle,
                category: randomCategory,
                description: randomDesc,
                seller: randomSeller._id,
                price: faker.number.int({ min: 15, max: 250 }), // توليد رقم صحيح متوافق مع الـ integer validator
                averageRating: 0,
                ratingsQuantity: 0
            });
        }
        const createdServices = await Service.insertMany(services);
        console.log(`✅ Created ${createdServices.length} English services successfully.`);

        // --- 3. توليد طلبات وهمية (Orders) ---
        console.log("📦 Generating dummy orders...");
        const orders = [];

        for (let i = 0; i < 5; i++) {
            const randomService = createdServices[Math.floor(Math.random() * createdServices.length)];
            const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
            
            orders.push({
                orderNumber: 'ORD-' + faker.string.alphanumeric({ length: 8, casing: 'upper' }),
                buyer: randomBuyer._id,
                seller: randomService.seller,
                service: randomService._id,
                price: randomService.price,
                status: faker.helpers.arrayElement(['pending', 'in progress', 'completed', 'cancelled'])
            });
        }
        const createdOrders = await Order.insertMany(orders);
        console.log(`✅ Created ${createdOrders.length} orders successfully.`);

        // --- 4. توليد تقييمات وتعليقات بالإنجليزية فقط (Reviews) ---
        console.log("⭐ Generating dummy English reviews...");

        const englishComments = [
            "Amazing work! Highly professional and delivered ahead of schedule.",
            "Excellent communication and great quality. Highly recommended!",
            "Did a wonderful job. Took my feedback and made perfect adjustments.",
            "Very satisfied with the results. Will definitely hire again.",
            "Good service, though the delivery took a bit longer than expected.",
            "Great experience! The seller understood my requirements perfectly.",
            "Superb quality! Worth every penny.",
            "Professional service. Answered all my questions promptly."
        ];

        for (const order of createdOrders) {
            const randomComment = faker.helpers.arrayElement(englishComments);

            await Review.create({
                rating: faker.number.int({ min: 3, max: 5 }),
                comment: randomComment,
                buyer: order.buyer,
                seller: order.seller,
                service: order.service,
                order: order._id
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(`✅ Created and calculated ratings for ${createdOrders.length} reviews.`);

        console.log("\n🎉 Database Seeding Completed Successfully! All English dummy data is live on MongoDB Atlas.");

    } catch (error) {
        console.error("❌ Seeding failed with error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB Atlas.");
    }
}

seedDatabase();