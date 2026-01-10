require('dotenv').config({ path: './server/.env' });
console.log('Hello from debug script');
console.log('CWD:', process.cwd());
console.log('MONGO_URI exists:', !!process.env.MONGODB_URI);
if (process.env.MONGODB_URI) {
    console.log('MONGO_URI starts with:', process.env.MONGODB_URI.substring(0, 10));
}
