const { createWriteStream, existsSync, mkdirSync, unlink } = require('fs')
const { createServer } = require('http')
const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const { ApolloServer, PubSub } = require('apollo-server-express')
const mkdirp = require('mkdirp')
const shortid = require('shortid')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
require('dotenv').config()

const UPLOAD_DIR = './uploads'
mkdirp.sync(UPLOAD_DIR)

const User = require('./models/User')

function getCookie(cookie, cname) {
    const name = cname + "="
    const decodedCookie = decodeURIComponent(cookie)
    const ca = decodedCookie.split(';')

    let r = ''

    for(var i = 0; i < ca.length; i++) {
        let c = ca[i]

        while (c.charAt(0) === ' ') {
            c = c.substring(1)
        }

        if (c.indexOf(name) === 0) {
            r = c.substring(name.length, c.length)
        }
    }

    return r.replace('"', '').replace('"', '')
}

// Server
async function start() {
    const port = process.env.PORT || 5000
    const url = process.env.URL
    const app = express()
    const http = createServer(app)

    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    mongoose.connection.once('open', () =>
        console.log(`Connected to MongoDB`)
    )

    const storeUpload = async (upload) => {
        const { createReadStream, filename, mimetype } = await upload
        const stream = createReadStream()
        const id = shortid.generate()

        const dirname = shortid.generate()
        if (!existsSync(`${UPLOAD_DIR}/${dirname}`)){
            mkdirSync(`${UPLOAD_DIR}/${dirname}`)
        }

        const path = `${UPLOAD_DIR}/${dirname}/${id}-${filename}`
        const file = { id, filename, mimetype, path }

        await new Promise((resolve, reject) => {
            const writeStream = createWriteStream(path)

            writeStream.on('finish', resolve)
            writeStream.on('error', (error) => {
                unlink(path, () => {
                    reject(error)
                })
            })

            stream.on('error', (error) => writeStream.destroy(error))
            stream.pipe(writeStream)
        })

        return file
    }

    const pubsub = new PubSub()
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const cookie = req.headers.cookie
            const sessionID = (cookie) ? getCookie(cookie, 'secret') : null

            const user = await User.findOne({ sessionID })

            return { storeUpload, pubsub, req, user }
        }
    })
    
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    }))

    app.use(express.json())
    app.use('/uploads', express.static('uploads'))
    app.use(express.urlencoded({ extended: true }))

    server.applyMiddleware({ app, cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }})
    server.installSubscriptionHandlers(http)

    app.get('/', (req, res) => {
        res.send('<p>API</p>')
    })

    http.listen({ port }, () =>
        console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
    )
}

start()