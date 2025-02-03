import cors from "cors";

const allowedOrigins = [
    // Production frontend
    "http://localhost:5173", // Development frontend
    "http://116.203.134.67", // Allowed IP 1
    "http://116.203.129.16", // Allowed IP 2
    "http://23.88.105.37", // Allowed IP 3
    "http://128.140.8.200" // Allowed IP 4
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow request
        } else {
            console.log(`Blocked CORS request from origin: ${origin}`); // Log blocked origin
            callback(new Error("Not allowed by CORS")); // Reject request
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Allow cookies/auth headers
};

export default cors(corsOptions);
