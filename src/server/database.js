// src/server/database.js
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

const Company = sequelize.define('Company', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ctc: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  stipend: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  college: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const syncDatabase = async () => {
  await sequelize.sync();
};

const getCompanyData = async () => {
  return await Company.findAll();
};

const addCompanyData = async (companyData) => {
  return await Company.create(companyData);
};

module.exports = {
  syncDatabase,
  getCompanyData,
  addCompanyData,
};
