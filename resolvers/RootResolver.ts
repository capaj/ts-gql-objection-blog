import { compileSchema, SchemaRoot, Query, Mutation, Arg } from '@capaj/typegql'
import Author from '../models/Author'
import { printSchema, GraphQLInt } from 'graphql'

@SchemaRoot()
export class RootResolver {
  @Query({
    type: [Author],
    description: 'Get all authors'
  })
  async authors() {
    const authors = await Author.query()
    return authors
  }

  @Query({
    type: Author,
    description: 'Get author by id'
  })
  async author(@Arg({ type: GraphQLInt }) id: number) {
    const author = await Author.query().findById(id)
    return author
  }

  @Mutation({
    type: Author,
    description: `markdown [yeaaah](https://avatars2.githubusercontent.com/u/10618781?s=460&v=4)`
  })
  async createAuthor(data: Author) {
    return Author.query().insertAndFetch(data)
  }
}
