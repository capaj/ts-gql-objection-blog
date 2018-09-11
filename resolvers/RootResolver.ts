import { compileSchema, SchemaRoot, Query, Mutation } from '@capaj/typegql'
import { Author } from '../models/Author'

@SchemaRoot()
class RootResolver {
  @Query({
    type: [Author],
    description: 'Get all authors'
  })
  async authors() {
    // const a = new Author()
    // a.firstName = 'Michał'
    // a.lastName = 'Lytek'
    // a.profileImageUrl =
    //   'https://avatars2.githubusercontent.com/u/10618781?s=460&v=4'
    return Author.query()
  }

  @Mutation({
    type: Author,
    description: `markdown [yeaaah](https://avatars2.githubusercontent.com/u/10618781?s=460&v=4)`
  })
  async createAuthor(data: Author) {
    return Author.query().insertAndFetch(data)
  }
}

export const compiledSchema = compileSchema({ roots: [RootResolver] })
