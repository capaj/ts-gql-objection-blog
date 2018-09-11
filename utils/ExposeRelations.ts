// @ts-nocheck
import { Model, RelationMapping } from 'objection'
import { Field, Info, Arg, InputObjectType, InputField } from '@capaj/typegql'
import getFieldNames from 'graphql-list-fields'
import hasProtochainProperty from './hasProtochainProperty'
import { GraphQLInt, GraphQLString } from 'graphql'
import { capitalize } from 'lodash'

@InputObjectType()
export class FilterDescriptor {
  @InputField({
    type: GraphQLString,
    isNullable: false
  })
  name: string

  @InputField({
    type: GraphQLString,
    isNullable: true
  })
  value?: string
}

@InputObjectType()
export class OrderDescriptor {
  @InputField({
    type: GraphQLString,
    isNullable: false
  })
  name: string

  @InputField({
    type: GraphQLString,
    isNullable: true
  })
  sort?: 'asc' | 'desc'
}

/**
 * Beware, there is some meta magic going on in this file
 */

const applyFilters = (
  modelClass: any,
  query: any,
  filters: FilterDescriptor[]
): void => {
  filters.forEach(({ name, value }) => {
    if (modelClass.namedFilters[name]) {
      modelClass.namedFilters[name](query, value)
    } else {
      throw new Error(
        `Named filter ${name} does not exist on ${modelClass.name}`
      )
    }
  })
}

const applyOrder = (query: any, order: OrderDescriptor[]): void =>
  order.forEach(({ name, sort }) => {
    const direction = sort || 'asc'
    query.orderBy(name, direction)
  })

/**
 *  used on a class, it iterates all the relationMappings and exposes them as typegql fields,
 * these fields are actually named with a "RelationResolve" suffix to not get in the way of
 * working with relations on the backend
 *
 * by default all relations are exposed. If you want to opt out, just use `exposeAsTypegqlField: false` on your objection relation mapping
 */
export function ObjectionRelationsAsTypegqlFields(options?): ClassDecorator {
  // tslint:disable-next-line
  return (target: Function) => {
    const { prototype } = target

    if (prototype instanceof Model) {
      // @ts-ignore
      Object.entries(target.relationMappings).forEach(
        ([relationName, objectionRelation]) => {
          // @ts-ignore
          if (objectionRelation.exposeAsTypegqlField === false) {
            return
          }
          // @ts-ignore
          const { relation } = objectionRelation
          const relationToMany =
            relation === Model.ManyToManyRelation ||
            relation === Model.HasManyRelation
          const fieldName = `${relationName}RelationResolver`
          const exportFieldName = `export${capitalize(relationName)}`
          if (relationToMany) {
            prototype[fieldName] = async function(
              info,
              filter?: string,
              filters?: FilterDescriptor[],
              order?: OrderDescriptor[],
              offset?: number,
              limit?: number
            ) {
              if (this[relationName]) {
                return this[relationName]
              }
              // @ts-ignore
              const modelClass = require(objectionRelation.modelClass).default
              let query
              if (options && options.selectRequestedFields) {
                const requestedFields = getFieldNames(info).filter(field => {
                  return (
                    !field.includes('.') && // fields from deeper levels
                    !hasProtochainProperty(modelClass, field) // resolver methods
                  )
                })

                const idColumns = Array.isArray(modelClass.idColumn)
                  ? modelClass.idColumn
                  : [modelClass.idColumn]

                idColumns.forEach(column => {
                  if (!requestedFields.includes(column)) {
                    requestedFields.push(column)
                  }
                })

                query = this.$relatedQuery(relationName).select(requestedFields)
              } else {
                query = this.$relatedQuery(relationName)
              }
              if (filter) {
                if (modelClass.namedFilters[filter]) {
                  modelClass.namedFilters[filter](query)
                } else {
                  throw new Error(
                    `Named filter ${filter} does not exist on ${
                      modelClass.name
                    }`
                  )
                }
              }

              if (filters) {
                applyFilters(modelClass, query, filters)
              }

              if (order) {
                applyOrder(query, order)
              }

              if (limit) {
                query.limit(limit)
              }
              if (offset) {
                query.offset(offset)
              }
              return query
            }
            Info(prototype, fieldName, 0)
            Arg({
              isNullable: true,
              description: 'Deprecated in favour of `filters` param',
              type: String
            })(prototype, fieldName, 1)
            Arg({
              isNullable: true,
              type: [FilterDescriptor]
            })(prototype, fieldName, 2)
            Arg({
              isNullable: true,
              type: [OrderDescriptor]
            })(prototype, fieldName, 3)
            Arg({
              isNullable: true,
              type: GraphQLInt
            })(prototype, fieldName, 4)
            Arg({
              isNullable: true,
              type: GraphQLInt
            })(prototype, fieldName, 5)
          } else {
            prototype[fieldName] = async function(info) {
              if (this[relationName]) {
                return this[relationName]
              }
              // @ts-ignore
              const modelClass = require(objectionRelation.modelClass).default
              let query
              if (options && options.selectRequestedFields) {
                const requestedFields = getFieldNames(info).filter(field => {
                  return (
                    !field.includes('.') && // fields from deeper levels
                    !hasProtochainProperty(modelClass, field) // resolver methods
                  )
                })

                const idColumns = Array.isArray(modelClass.idColumn)
                  ? modelClass.idColumn
                  : [modelClass.idColumn]

                idColumns.forEach(column => {
                  if (!requestedFields.includes(column)) {
                    requestedFields.push(column)
                  }
                })

                query = this.$relatedQuery(relationName).select(requestedFields)
              } else {
                query = this.$relatedQuery(relationName)
              }
              return query
            }
            Info(prototype, fieldName, 0)
          }

          const type = () => {
            // @ts-ignore
            const modelClass = require(objectionRelation.modelClass).default

            if (!modelClass) {
              throw new Error(
                `could not load a default export from ${
                  // @ts-ignore
                  objectionRelation.modelClass
                }, make sure objection model is exported as default and that the path is correct`
              )
            }
            if (relationToMany) {
              return [modelClass]
            }
            return modelClass
          }

          const isNullable = true
          // if (relation === Model.BelongsToOneRelation) {
          //   isNullable = false
          // }

          const decoratorFunction = Field({
            type,
            name: relationName,
            // @ts-ignore
            description: objectionRelation.description,

            isNullable
          })
          decoratorFunction(prototype, fieldName)

          if (relationToMany) {
            const fieldNameCount = `${relationName}Count`

            prototype[fieldNameCount] = async function(
              filter?: string,
              filters?: FilterDescriptor[]
            ) {
              // @ts-ignore
              const modelClass = require(objectionRelation.modelClass).default

              let groupBy
              if (relation === Model.ManyToManyRelation) {
                // @ts-ignore
                groupBy = objectionRelation.join.through.from
              } else {
                // @ts-ignore
                groupBy = objectionRelation.join.to
              }

              const query = this.$relatedQuery(relationName).groupBy(groupBy)

              if (filter) {
                if (modelClass.namedFilters[filter]) {
                  modelClass.namedFilters[filter](query)
                } else {
                  throw new Error(
                    `Named filter ${filter} does not exist on ${
                      modelClass.name
                    }`
                  )
                }
              }

              if (filters) {
                applyFilters(modelClass, query, filters)
              }
              let result

              // Dirty hack to see if filters required extra groupings
              const groupOperationNames = ['groupBy', 'groupByRaw']
              const groupingsCount = query._operations.filter(({ name }) =>
                groupOperationNames.includes(name)
              ).length

              if (groupingsCount > 1) {
                ;[result] = (await query
                  .clearSelect()
                  .select(Model.raw('COUNT(*) OVER() AS count'))
                  .limit(1)) as any[]
              } else {
                result = ((await query.count('*').first()) as any) as {
                  count: number
                }
              }

              return (result && result['count(*)']) || 0
            }

            const decoratorFunctionCount = Field({
              type: GraphQLInt,
              name: `${relationName}Count`
            })

            decoratorFunctionCount(prototype, fieldNameCount)

            Arg({
              isNullable: true,
              description: 'Deprecated in favour of `filters` param',
              type: String
            })(prototype, fieldNameCount, 0)

            Arg({
              isNullable: true,
              type: [FilterDescriptor]
            })(prototype, fieldNameCount, 1)
          }
        }
      )
    } else {
      console.warn(target)
      throw new TypeError('target is not objection model')
    }
  }
}
