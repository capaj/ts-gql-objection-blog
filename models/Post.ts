import { DuplexObjectType, DuplexField, Field } from '@capaj/typegql'
import TimestampedModel from './TimestampedModel'
import { Model } from 'objection'
import path from 'path'
import { ObjectionRelationsAsTypegqlFields } from '../utils/ExposeRelations'

type ElementType =
  | 'text'
  | 'video'
  | 'quiz-checkbox-s'
  | 'quiz-checkbox-o'
  | 'link'

@DuplexObjectType()
@ObjectionRelationsAsTypegqlFields()
export default class Post extends TimestampedModel {
  static tableName = 'posts'
  @DuplexField()
  title: string
  @DuplexField()
  content: string
  @Field()
  type: ElementType

  static relationMappings = {
    author: {
      relation: Model.BelongsToOneRelation,
      modelClass: path.join(__dirname, '/Author'),
      join: {
        to: 'authors.id',
        from: 'posts.authorId'
      }
    }
  }
}
