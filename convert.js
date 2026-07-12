const postmanToOpenApi = require('postman-to-openapi');
const path = require('path');
const fs = require('fs');
const yaml = require('yaml'); // ستحتاجها فقط هنا لتحويل صيغة الحزمة إلى JSON

const postmanCollection = path.join(__dirname, 'freelance-market.postman_collection.json');
const outputFileJson = path.join(__dirname, 'swagger.json');
const tempYamlPath = path.join(__dirname, 'temp_swagger.yaml');

// 1️⃣ الإعدادات: نضع الـ servers هنا لتكتب تلقائياً داخل الملف
const options = {
    defaultTag: 'General',
    baseUrl: 'http://localhost:4000',
    servers: [
        {
            url: 'http://localhost:4000',
            description: 'Local Development Server'
        }
    ]
};

// 2️⃣ تشغيل التحويل
postmanToOpenApi(postmanCollection, tempYamlPath, options)
    .then(() => {
        // 3️⃣ قراءة ملف الـ YAML المؤقت وتحويله لـ JSON حقيقي ومضمون
        const yamlContent = fs.readFileSync(tempYamlPath, 'utf8');
        const jsonObject = yaml.parse(yamlContent);
        
        // 4️⃣ حفظ الملف النهائي كـ JSON منسق
        fs.writeFileSync(outputFileJson, JSON.stringify(jsonObject, null, 2), 'utf8');
        
        // 5️⃣ حذف ملف الـ YAML المؤقت لتنظيف الفولدر
        fs.unlinkSync(tempYamlPath);

        console.log('✅ Done! swagger.json generated perfectly with correct servers and JSON format.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error converting:', err);
        if (fs.existsSync(tempYamlPath)) fs.unlinkSync(tempYamlPath);
        process.exit(1);
    });