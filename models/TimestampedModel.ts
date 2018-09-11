import { ModelOptions, Model } from 'objection'
import { Field, ObjectType } from '@capaj/typegql'
import { GraphQLDateTime } from 'graphql-iso-date'

@ObjectType()
export default class TimestampedModel extends Model {
  @Field({ type: GraphQLDateTime })
  created_at: Date
  @Field({ type: GraphQLDateTime })
  updated_at: Date
  $beforeInsert() {
    this.created_at = new Date()
  }

  $beforeUpdate(opt?: ModelOptions) {
    this.updated_at = new Date()
  }

  $parseDatabaseJson(json) {
    json = super.$parseDatabaseJson(json)

    if (json.created_at) {
      json.created_at = new Date(json.created_at)
    }
    if (json.updated_at) {
      json.updated_at = new Date(json.updated_at)
    }
    return json
  }
}
