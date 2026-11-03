const { exercises, xpPerLevel } = require('../data/exercises');

/**
 * GET /api/config
 * Returns exercise catalog and level XP requirements
 */
function getConfig(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      exercises,
      xpPerLevel,
    },
  });
}

module.exports = {
  getConfig,
};
