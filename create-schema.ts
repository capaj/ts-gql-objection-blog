export default async () => {
  const schema = await buildSchema({
    resolvers: [PostResolver]
  })
  return schema
}
