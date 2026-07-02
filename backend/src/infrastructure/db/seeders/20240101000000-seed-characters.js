'use strict'

const axios = require('axios')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    console.log('[Seed] Fetching 15 characters from Rick & Morty API...')

    const response = await axios.get('https://rickandmortyapi.com/api/character?page=1')
    const characters = response.data.results.slice(0, 15)
    const now = new Date()

    await queryInterface.bulkInsert(
      'characters',
      characters.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        species: c.species,
        type: c.type || '',
        gender: c.gender,
        origin: c.origin.name,
        image: c.image,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })),
      { ignoreDuplicates: true },
    )

    console.log(`[Seed] Inserted ${characters.length} characters`)
  },

  async down(queryInterface) {
    const ids = Array.from({ length: 15 }, (_, i) => i + 1)
    await queryInterface.bulkDelete('characters', { id: ids }, {})
  },
}
