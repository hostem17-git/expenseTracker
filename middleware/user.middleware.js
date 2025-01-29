import jwt from "jsonwebtoken";

export default userMiddleware = async (req, res, next) => {
  try {
    const cookie = req.cookies;

    if (!cookie || !cookie.token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = cookie.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded){
        res.locals.userId = decodedValue.userId;
        return next();
    }

    return res.status(403).json({ error: "Unauthorized" });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "authorization token expired" });
    }
    console.log("admin JWT verification error", error);
    res.status(401).json({ error: "Invalid inputs" });
  }
};
