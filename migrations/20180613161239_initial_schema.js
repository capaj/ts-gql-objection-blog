exports.up = knex => {
  return knex.schema
    .createTable('posts', table => {
      table.increments('id').primary()
      table
        .integer('authorId')
        .unsigned()
        .references('id')
        .inTable('authors')
        .onDelete('SET NULL')
      table.text('title')
      table.text('content')
      table.timestamps(true, true)
    })
    .createTable('tags', table => {
      table.increments('id').primary()
      table.string('name')
      table.timestamps(true, true)
    })
    .createTable('authors', table => {
      table.increments('id').primary()

      table.string('firstName')
      table.string('lastName')
      table.string('email')
      table.string('profileImageUrl')
      table.timestamps(true, true)
    })
    .createTable('posts_tags', table => {
      table
        .integer('postId')
        .unsigned()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE')
      table
        .integer('tagId')
        .unsigned()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE')
      table.timestamps(true, true)
    })
}

exports.down = knex => {
  return knex.schema
    .dropTableIfExists('posts')
    .dropTableIfExists('tags')
    .dropTableIfExists('authors')
    .dropTableIfExists('posts_tags')
}
