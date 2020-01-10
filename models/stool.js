'use strict';
module.exports = (sequelize, DataTypes) => {
  const stool = sequelize.define('stool', {
    user: DataTypes.STRING
  }, {});
  stool.associate = function(models) {
    // associations can be defined here
  };
  return stool;
};