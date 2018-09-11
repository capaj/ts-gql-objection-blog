import { Model } from 'objection'
import { DuplexObjectType, DuplexField } from '@capaj/typegql'

@DuplexObjectType()
export class Post extends Model {
  static tableName = 'posts'
  @DuplexField()
  firstName: string
  @DuplexField()
  lastName: string
  @DuplexField()
  profileImageUrl: string
  // @DuplexField()
  // age: number
}
