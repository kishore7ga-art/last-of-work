const NodeCache = require('node-cache');

const apiCache = new NodeCache({
  stdTTL: 30,
  checkperiod: 60,
  useClones: false,
});

const cache = (seconds) => (req, res, next) => {
  if (req.method !== 'GET') {
    apiCache.flushAll();
    return next();
  }
  const key = `${req.user?._id}:${req.originalUrl}`;
  const hit = apiCache.get(key);
  if (hit) {
    return res.json(hit);
  }
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    apiCache.set(key, data, seconds);
    return originalJson(data);
  }
  next();
};

module.exports = {
  cache,
  apiCache
};
