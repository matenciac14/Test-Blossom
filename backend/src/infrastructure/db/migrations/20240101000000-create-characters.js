'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('characters', {
      id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false },
      species: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, defaultValue: '' },
      gender: { type: Sequelize.STRING, allowNull: false },
      origin: { type: Sequelize.STRING, allowNull: false },
      image: { type: Sequelize.STRING, allowNull: false },
      isFavorite: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })

    await queryInterface.addIndex('characters', ['name'])
    await queryInterface.addIndex('characters', ['status'])
    await queryInterface.addIndex('characters', ['species'])
    await queryInterface.addIndex('characters', ['gender'])
    await queryInterface.addIndex('characters', ['isFavorite'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('characters')
  },
}
