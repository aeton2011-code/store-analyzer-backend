// api/ping.js
module.exports = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "backend is working!"
  });
};
