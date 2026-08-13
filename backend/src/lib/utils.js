import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    // frontend and backend live on different origins in production, so the
    // cookie must be sent cross-site; "none" requires "secure" to be set
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  return token;
};