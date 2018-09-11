import { Model } from 'objection'
import { DuplexObjectType, DuplexField } from '@capaj/typegql'

@DuplexObjectType()
export class Author extends Model {
  static tableName = 'authors'
  @DuplexField()
  firstName: string
  @DuplexField()
  lastName: string
  @DuplexField()
  profileImageUrl: string
}
