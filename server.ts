import 'dotenv/config'
import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
// import { express as voyagerMiddleware } from 'graphql-voyager'
import express from 'express'
import cors from 'cors'
import objection from 'objection'
import knex from 'knex'
import { compiledSchema } from './resolvers/RootResolver'
import knexFile from './knexfile'
import https from 'https'
import fs from 'fs'
const db = knex(knexFile.development)

objection.Model.knex(db)
const ae = require('altair-express-middleware')
;(async () => {
  const apollo = new ApolloServer({ schema: compiledSchema, tracing: true })

  const app = express()
  app.use(cors())
  const httpsOptions = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
  }
  // Mount voyager middleware
  const { PORT } = process.env

  // app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }))
  app.use(
    '/altair',
    ae.altairExpress({
      endpointURL: '/graphql',
      subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
    })
  )

  apollo.applyMiddleware({ app })
  const server = https.createServer(httpsOptions, app)
  server.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${apollo.graphqlPath}`
    )
    console.log(
      `🚀 Subscriptions ready at http://localhost:${PORT}${
        apollo.subscriptionsPath
      }`
    )
  })
})().catch(err => {
  console.error('err: ', err)
})
