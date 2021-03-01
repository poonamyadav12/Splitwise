const { Sequelize, DataTypes } = require('sequelize');

const { DB_USERNAME, DB_PASSWORD, DB_NAME, CLOUD_SQL_CONNECTION_NAME } = require("../database/constants");

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    dialect: 'mysql',
    host: "35.193.109.48", //IP address of my Cloud SQL Server
    timestamps: false,
    dialectOptions: {
        host: "35.193.109.48", //IP address of my Cloud SQL Server
        user: 'root',
        password: 'poonam2802',
        database: DB_NAME,
    },
});

export const UserInfo = sequelize.define('UserInfo', {
    // Model attributes are defined here
    User: {
        type: DataTypes.JSON,
        allowNull: false
    },
    UserId: {
        type: DataTypes.STRING,
        unique: true,
    },
}, {
});