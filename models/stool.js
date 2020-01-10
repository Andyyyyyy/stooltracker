'use strict';
module.exports = (sequelize, DataTypes) => {
  const stool = sequelize.define('stool', {
    username: DataTypes.STRING,
    messageid: DataTypes.STRING,
    size: DataTypes.STRING,
    wipes: DataTypes.INTEGER,
    userid: DataTypes.STRING,
    type: DataTypes.STRING
  }, {});
  stool.associate = function(models) {
    // associations can be defined here
  };
  return stool;
};