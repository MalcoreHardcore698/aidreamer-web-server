const User = require('./../models/User')
const UserChat = require('./../models/UserChat')
const Offer = require('./../models/Offer')
const Article = require('./../models/Article')
const Hub = require('./../models/Hub')
const Chat = require('./../models/Chat')
const Message = require('./../models/Message')
const Avatar = require('./../models/Avatar')
const Image = require('./../models/Image')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server-express')

const {
  validateRegisterInput,
  validateLoginInput
} = require('../utils/validators')
const SECRET_KEY = 'secret'

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  )
}

module.exports = {
    Avatar: {
        hub: async (parent) => await Hub.findById(parent.hub)
    },
    User: {
        id: parent => parent.id,
        name: parent => parent.name,
        avatar: async (parent) => {
            const avatar = await Avatar.findById(parent.avatar)
            if (avatar) return avatar
            return { id: '', name: '', path: '' }
        },
        offers: async (parent) => {
            const offers = await Offer.find({ user: parent.id })
            return offers
        },
        preferences: async (parent) => {
            const hubs = []
            if (parent.preferences) {
                for (id of parent.preferences) {
                    const hub = await Hub.findById(id)
                    hubs.push(hub)
                }
            }
            return hubs
        },
        chats: async (parent) => await UserChat.find({ userId: parent.id, status: 'OPEN' })
    },
    Chat: {
        id: (parent) => parent.id,
        title: (parent) => parent.title,
        participants: async (parent) => {
            const participants = []
            for (const participant of parent.participants) {
                const user = await User.findById(participant)
                participants.push(user)
            }
            return participants
        },
        messages: async (parent) => await Message.find({ chat: parent.id })
    },
    Message: {
        sender: async (parent) => await User.findById(parent.sender),
        receiver: async (parent) => await User.findById(parent.receiver)
    },
    Hub: {
        id: parent => parent.id,
        offers: async (parent) => {
            const offers = await Offer.find({ hub: parent.id })
            return offers
        },
        icon: async (parent) => {
            const icon = await Image.findById(parent.icon)
            if (icon) return icon
            return { id: '', name: '', path: '' }
        },
        countUsers: () => 0,
        countOffers: async (parent) => {
            const offers = await Offer.find({ hub: parent.id })
            return offers.length
        }
    },  
    Article: {
        author: async (parent) => await User.findById(parent.author),
        image: async (parent) => {
            if (!parent.image) return {
                path: ''
            }

            return await Image.findById(parent.image)
        },
        hub: async (parent) => await Hub.findById(parent.hub)
    },
    Offer: {
        id: parent => parent.id,
        user: async (parent) => {
            const user = await User.findById(parent.user)
            return user
        },
        hub: async (parent) => {
            const hub = await Hub.findById(parent.hub)
            return hub
        }
    },
    Query: {
        allAvatars: async () => await Avatar.find(),
        allImages: async () => await Image.find(),
        allUsers: async (_, args, context) => {
            return await User.find()
        },
        allOffers: async () => await Offer.find(),
        allArticles: async (_, { status }) => {
            const articles = await Article.find()
            if (status) return articles.filter(n => n.status === status)
            return articles
        },
        allUserArticles: async (_, { id }) => {
            const articles = await Article.find({ author: id })
            return articles.filter(n => n.status === 'PUBLISHED')
        },
        allHubs: async (_, { status }) => {
            const hubs = await Hub.find()
            if (status) return hubs.filter(h => h.status === status)
            return hubs
        },
        allChats: async () => await Chat.find(),
        allUserRoles: () => ([
            'ADMINISTRATOR',
            'MODERATOR',
            'USER'
        ]),
        allStatus: () => ([
            'MODERATION',
            'PUBLISHED'
        ]),
        allImageCategories: () => ([
            'ICON',
            'POSTER'
        ]),
        allAchievementAreas: () => ([
            'HUB',
            'OFFER',
            'CHAT',
            'TOURNAMENT',
            'PROFILE'
        ]),
        allUserOffers: async (_, { id }) => {
            const offers = await Offer.find({ user: id })
            return offers || []
        },

        authUser: async (_, args) => {
            const user = await User.find(args)
            return (user && user.length > 0) ? user[0] : {}
        },

        getUser: async (_,  { id }) => {
            return await User.findById(id)
        },
        getOffer: async (_,  { id }) => await Offer.findById(id),
        getArticle: async (_,  { id }) => await Article.findById(id),
        getHub: async (_,  { id }) => await Hub.findById(id),
        getChat: async (_,  { id }) => await Chat.findById(id),

        countAvatars: async () => await Avatar.estimatedDocumentCount(),
        countImages: async () => await Image.estimatedDocumentCount(),
        countUsers: async () => await User.estimatedDocumentCount(),
        countOffers: async () => await Offer.estimatedDocumentCount(),
        countHubs: async () => await Hub.estimatedDocumentCount()
    },
    Mutation: {
        async login(_, { name, password }) {
            const { errors, valid } = validateLoginInput(name, password)
        
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }
        
            const user = await User.findOne({ name })
        
            if (!user) {
                errors.general = 'User not found'
                throw new UserInputError('User not found', { errors })
            }
        
            const match = await bcrypt.compare(password, user.password)
            if (!match) {
                errors.general = 'Wrong crendetials'
                throw new UserInputError('Wrong crendetials', { errors })
            }
        
            const token = generateToken(user)
        
            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
        async register(_, {
                registerInput: { name, email, password, confirmPassword }
            }) {
            // Validate user data
            const { valid, errors } = validateRegisterInput(
                name,
                email,
                password,
                confirmPassword
            )

            if (!valid) {
                throw new UserInputError('Errors', { errors })
            }

            // TODO: Make sure user doesnt already exist
            const user = await User.findOne({ name })
            if (user) {
                throw new UserInputError('Name is taken', {
                    errors: {
                        name: 'This name is taken'
                    }
                })
            }
            // hash password and create an auth token
            password = await bcrypt.hash(password, 12);
        
            const newUser = new User({
                email,
                name,
                password,
                role: 'USER'
            })
        
            const res = await newUser.save()
            const token = generateToken(res)
        
            return {
                ...res._doc,
                id: res._id,
                token
            }
        },

        addAvatar: async (_, args, { storeUpload }) => {
            const avatar = await storeUpload(args.name, args.file)
            await Avatar.create({
                order: args.order,
                name: args.name,
                path: avatar.path,
                complexity: args.complexity,
                hub: args.hub
            })
            return true
        },
        editAvatar: async (_, args, { storeUpload }) => {
            const avatar = await Avatar.findById(args.id)
            const file = args.file && await storeUpload(args.name, args.file)

            avatar.order = args.order || avatar.order
            avatar.name = args.name || avatar.name
            avatar.path = (file && file.path) || avatar.path
            avatar.complexity = args.complexity || avatar.complexity
            avatar.hub = args.hub || avatar.hub
            await avatar.save()

            return true
        },
        deleteAvatar: async (_, { id }) => {
            await Avatar.findById(id).deleteOne()
            return true
        },

        addImage: async (_, args, { storeUpload }) => {
            const image = await storeUpload(args.name, args.file)
            await Image.create({
                name: args.name,
                path: image.path,
                category: args.category
            })
            return true
        },
        editImage: async (_, args, { storeUpload }) => {
            const image = await Image.findById(args.id)
            const file = args.file && await storeUpload(args.name, args.file)

            image.name = args.name || image.name
            image.path = (file && file.path) || image.path
            image.category = args.category || image.category
            await image.save()
            
            return true
        },
        deleteImage: async (_, { id }) => {
            for (i of id) {
                await Image.findById(id).deleteOne()
            }
            return true
        },

        addUser: async (_, args) => {
            const avatar = await Avatar.findById(args.avatar)
            await User.create({
                ...args,
                avatar
            })
            return true
        },
        editUser: async (_, args) => {
            const user = await User.findById(args.id)
            const avatar = await Avatar.findById(args.avatar)

            user.name = args.name || user.name
            user.password = args.password || user.password
            user.email = args.email || user.email
            user.phone = args.phone || user.phone
            user.role = args.role || user.role
            user.balance = args.balance || user.balance
            user.level = args.level || user.level
            user.experience = args.experience || user.experience
            user.avatar = (avatar && avatar.id) || user.avatar
            user.preferences = args.preferences || user.preferences

            user.isVerifiedEmail = args.isVerifiedEmail || user.isVerifiedEmail
            user.isVerifiedPhone = args.isVerifiedPhone || user.isVerifiedPhone
            user.isNotified = args.isNotified || user.isNotified
            await user.save()
            return true
        },
        deleteUsers: async (_, { id }, { pubsub }) => {
            for (i of id) {
                await User.findById(i).deleteOne()
            }

            const users = await User.find()
            pubsub.publish('users', { users })

            return true
        },

        addOffer: async (_, args, { pubsub }) => {
            await Offer.create(args)

            const offers = await Offer.find()
            pubsub.publish('offers', { offers })
            pubsub.publish('user-offers', { offers: offers.filter(a => a.user === args.user) })

            return true
        },
        editOffer: async (_, args, { pubsub }) => {
            const offer = await Offer.findById(args.id)
            offer.user = args.user || offer.user
            offer.hub = args.hub || offer.hub
            offer.title = args.title || offer.title
            offer.message = args.message || offer.message
            offer.status = args.status || offer.status
            offer.dateEdited = args.dateEdited || offer.dateEdited
            offer.datePublished = args.datePublished || offer.datePublished
            offer.dateCreated = args.dateCreated || offer.dateCreated

            await offer.save()

            const offers = await Offer.find()
            pubsub.publish('offers', { offers })
            pubsub.publish('user-offers', { offers: offers.filter(a => a.user === args.user) })

            return true
        },
        deleteOffers: async (_, { offers }, { pubsub }) => {
            for (offer of offers) {
                await Offer.findById(offer.id).deleteOne()
            }

            const newOffers = await Offer.find()
            pubsub.publish('offers', { offers: newOffers })

            for (offer of newOffers) {
                pubsub.publish('user-articles', { offers: newOffers.filter(o => o.user === offer.user) })
            }

            return true
        },

        addArticle: async (_, args, { storeUpload, pubsub }) => {
            const article = await Article.create({
                author: args.author,
                title: args.title,
                description: args.description,
                body: args.body,
                hub: args.hub,
                status: args.status
            })

            if (args.image) {
                const file = await storeUpload(args.image)
                const image = (file) && await Image.create({
                    name: file.filename,
                    path: file.path,
                    category: 'POSTER'
                })

                if (image) {
                    article.image = image.id
                    await article.save()
                }
            }

            const articles = await Article.find()
            pubsub.publish('articles', { articles })
            pubsub.publish('user-articles', { articles: articles.filter(a => a.author === args.author) })

            return true
        },
        editArticle: async (_, args, { storeUpload, pubsub }) => {
            const article = await Article.findById(args.id)

            if (args.image) {
                const file = await storeUpload(args.image)
                const image = (file) && await Image.create({
                    name: file.filename,
                    path: file.path,
                    category: 'POSTER'
                })

                if (image) article.image = image.id
            }

            article.title = args.title || article.title
            article.description = args.description || article.description
            article.body = args.body || article.body
            article.hub = args.hub || article.hub
            article.status = args.status || article.status

            await article.save()

            const articles = await Article.find()
            pubsub.publish('articles', { articles })
            pubsub.publish('user-articles', { articles: articles.filter(a => a.author === args.author) })

            return true
        },
        deleteArticles: async (_, { articles }, { pubsub }) => {
            for (article of articles) {
                await Article.findById(article.id).deleteOne()
            }

            const newArticles = await Article.find()
            pubsub.publish('articles', { articles: newArticles })

            for (article of newArticles) {
                pubsub.publish('user-articles', { articles: newArticles.filter(a => a.author === article.author) })
            }

            return true
        },

        addHub: async (_, args, { pubsub }) => {
            await Hub.create(args)

            const hubs = await Hub.find()
            pubsub.publish('hubs', { hubs })

            return true
        },
        editHub: async (_, args, { pubsub }) => {
            const hub = await Hub.findById(args.id)
            
            hub.title = args.title || hub.title
            hub.description = args.description || hub.description
            hub.slogan = args.slogan || hub.slogan
            hub.color = args.color || hub.color
            hub.status = args.status || hub.status

            await hub.save()

            const hubs = await Hub.find()
            pubsub.publish('hubs', { hubs })

            return true
        },
        deleteHubs: async (_, { id }, { pubsub }) => {
            for (i of id) {
                await Hub.findById(id).deleteOne()
            }

            const hubs = await Hub.find()
            pubsub.publish('hubs', { hubs })

            return true
        },

        addChat: async (_, args, { pubsub }) => {
            let candidate = await Chat.findOne({
                owner: args.owner,
                participants: [args.id, args.owner]
            })

            if (!candidate) {
                candidate = await Chat.create({
                    ...args,
                    participants: args.participants.map(participant => participant.id),
                    dateCreated: new Date()
                })
            }
            
            // CHANGE STATUS ON 'OPEN'
            for (const participant of args.participants) {
                const userChat = await UserChat.findOne({ chatId: candidate.id })
                
                if (userChat) {
                    userChat.status = 'OPEN'
                    await userChat.save()
                } else {
                    await UserChat.create({
                        userId: participant.id,
                        chatId: candidate.id,
                        status: 'OPEN'
                    })
                }
            }

            const userchats = await UserChat.find({
                userId: args.id,
                status: 'OPEN'
            })
            pubsub.publish('userchats', { userchats })

            return candidate.id
        },
        closeUserChat: async (_, args, { pubsub }) => {
            const chat = await UserChat.findOne(args)
            chat.status = 'CLOSE'
            await chat.save()

            const userchats = await UserChat.find({
                userId: args.id,
                status: 'OPEN'
            })
            pubsub.publish('userchats', { userchats })

            return true
        },

        addMessage: async (_, args, { pubsub }) => {
            await Message.create({
                ...args,
                dateCreated: new Date()
            })

            const receiverchat = await UserChat.findOne({
                userId: args.receiver,
                chatId: args.chat
            })

            if (receiverchat) {
                receiverchat.status = 'OPEN'
                await receiverchat.save()
            } else {
                await UserChat.create({
                    userId: args.receiver,
                    chatId: args.chat,
                    status: 'OPEN'
                })
            }

            const messages = await Message.find({ chat: args.chat })
            pubsub.publish('message-added', { messages })

            const senderchats = await UserChat.find({
                userId: args.sender,
                status: 'OPEN'
            })
            pubsub.publish('userchats', { userchats: senderchats })

            const receiverchats = await UserChat.find({
                userId: args.receiver,
                status: 'OPEN'
            })
            pubsub.publish('userchats', { userchats: receiverchats })

            return true
        }
    },
    Subscription: {
        users: {
            subscribe: async (_, args, { pubsub }) => pubsub.asyncIterator('users')
        },
        hubs: {
            subscribe: async (_, args, { pubsub }) => pubsub.asyncIterator('hubs'),
            resolve: (payload, { status }) => payload.hubs.filter(hub => hub.status === status)
        },
        offers: {
            subscribe: async (_, args, { pubsub }) => pubsub.asyncIterator('offers'),
            resolve: (payload, { status }) => payload.offers.filter(offer => offer.status === status)
        },
        articles: {
            subscribe: async (_, args, { pubsub }) => pubsub.asyncIterator('articles'),
            resolve: (payload, { status }) => payload.articles.filter(article => article.status === status)
        },

        userOffers: {
            subscribe: async (_, args, { pubsub }) => pubsub.asyncIterator('user-offers'),
            resolve: (payload, { id }) => payload.offers.filter(offer => offer.user === id)
        },
        userArticles: {
            subscribe: async (_, args, { pubsub }) => pubsub.asyncIterator('user-articles'),
            resolve: (payload, { id }) => payload.articles.filter(article => article.author === id)
        },

        messages: {
            subscribe: async (_, args, { pubsub }) => pubsub.asyncIterator('message-added'),
        },
        userchats: {
            subscribe: async (_, args, { pubsub }) => pubsub.asyncIterator('userchats'),
        }
    }
}