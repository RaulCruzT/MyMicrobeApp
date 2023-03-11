import { cleanEnv } from 'envalid';
import { port, str, num, email, url } from 'envalid/dist/validators';

export default cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
    PORT: port(),
    SESSION_SECRET: str(),
    NODEMAILER_HOST: str(),
    NODEMAILER_PORT: num(),
    NODEMAILER_USER: email(),
    NODEMAILER_PASSWORD: str(),
    NODEMAILER_SERVICE: str(),
    BASE_URL: url(),
})