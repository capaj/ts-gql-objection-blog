import {
  compileSchema,
  SchemaRoot,
  Query,
  Mutation,
  Arg,
  registerEnum
} from '@capaj/typegql'
import { GraphQLInt, GraphQLID } from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import { GraphQLDateTime } from 'graphql-custom-types'

enum aOrB {
  a,
  b
}

registerEnum(aOrB, 'aOrB')

@SchemaRoot()
export class ScalarTypesResolver {
  @Query()
  bool(b: boolean): boolean {
    return b
  }
  @Query()
  string(s: string): string {
    return s
  }
  @Query()
  float(float: number): number {
    return float
  }
  @Query({
    type: GraphQLInt
  })
  integer(@Arg({ type: GraphQLInt }) integer: number) {
    return integer
  }
  @Query({
    type: GraphQLID
  })
  ID(id: string) {
    return id
  }

  @Query({
    type: GraphQLJSON
  })
  json(@Arg({ type: GraphQLJSON }) data: object) {
    return data
  }
  @Query()
  enum(en: aOrB): aOrB {
    return en
  }
}
