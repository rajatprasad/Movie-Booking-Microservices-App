import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import timeout from "connect-timeout";
import proxy from "express-http-proxy";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("combined"));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
}));

app.use(timeout("15s"));


interface ProxyError extends Error {
    message: string;
}

interface ProxyOptions {
    proxyReqPathResolver: (req: Request) => string;
    proxyErrorHandler: (err: ProxyError, res: Response, next: NextFunction) => void;
}

const proxyOptions: ProxyOptions = {
    proxyReqPathResolver: (req: Request): string => {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err: ProxyError, res: Response, next: NextFunction): void => {
        res.status(500).json({
            message: `Internal server error`,
            error: err.message 
        })
    }
}

// Setting up proxy for Auth service
app.use('/v1/auth', proxy(process.env.BOOKING_AUTH_URL || 'http://localhost:8001', {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq: any) => {
        proxyReqOpts.headers["Content-Type"] = "application/json"
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        return proxyResData
    }
}))


// Setting up proxy for Movie service
app.use('/v1/movies', proxy(process.env.MOVIE_SERVICE_URL || 'http://localhost:8002', {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq: any) => {
        proxyReqOpts.headers["Content-Type"] = "application/json"
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        return proxyResData
    }
}))


// Setting up proxy for Bookink service
app.use('/v1/bookings', proxy(process.env.BOOKING_SERVICE_URL || 'http://localhost:8003', {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq: any) => {
        proxyReqOpts.headers["Content-Type"] = "application/json"
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        return proxyResData
    }
}))

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "API Gateway healthy" });
});

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err?.timeout) {
    res.status(503).json({ error: "Request timed out" });
    return;
  }
  next(err);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
