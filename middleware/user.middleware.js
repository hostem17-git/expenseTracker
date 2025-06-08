import jwt from "jsonwebtoken";

const userMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      res.locals.userId = decoded.userId;
      return next();
    }

    return res.status(403).json({ error: "Unauthorized" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Authorization token expired" });
    }

    console.error("User JWT verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default userMiddleware;
