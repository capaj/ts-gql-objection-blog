import { DuplexObjectType, DuplexField, Field } from '@capaj/typegql'
import TimestampedModel from './TimestampedModel'
import { GraphQLEmail, GraphQLURL } from 'graphql-custom-types'
import Post from './Post'
import { Model } from 'objection'
import path from 'path'
import { GraphQLInt } from 'graphql'
import { ObjectionRelationsAsTypegqlFields } from '../utils/ExposeRelations'

@DuplexObjectType()
@ObjectionRelationsAsTypegqlFields()
export default class Author extends TimestampedModel {
  static tableName = 'authors'
  @Field({ type: GraphQLInt })
  readonly id!: number

  @DuplexField()
  firstName: string
  @DuplexField()
  lastName: string
  @DuplexField({ type: GraphQLEmail })
  email: string
  @DuplexField({ type: GraphQLURL })
  profileImageUrl: string

  @Field({ type: Author })
  async patch(data: Author) {
    return this.$query<Author>().patchAndFetch(data)
  }

  @Field({ type: Post })
  async createPost(data: Post) {
    return this.$relatedQuery<Post>('posts').insertAndFetch(data)
  }

  static relationMappings = {
    posts: {
      relation: Model.HasManyRelation,
      modelClass: path.join(__dirname, '/Post'),
      join: {
        from: 'authors.id',
        to: 'posts.authorId'
      }
    }
  }
}
