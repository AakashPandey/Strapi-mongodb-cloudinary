module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: process.env.HEROKU_URL,
  admin: {
    auth: {
      secret: process.env.JWT_KEY
    }
  }
});
