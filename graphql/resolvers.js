const C = require('../types')

const User = require('./../models/User')
const UserChat = require('./../models/UserChat')
const Role = require('./../models/Role')
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

function generateSessionID(user) {
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
        availableAvatars: async (parent) => {
            const avatars = []

            for (id of parent.avatars) {
                const avatar = await Avatar.findById(id)
                avatars.push(avatar)
            }

            return avatars
        },
        offers: async (parent) => {
            const offers = await Offer.find({ user: parent.id })
            return offers
        },
        role: async (parent) => await Role.findById(parent.role),
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
        // All Queries
        allUsers: async (_, args, { user }) => {
            if (!user) return null

            return await User.find()
        },
        allUserArticles: async (_, { id }, { user }) => {
            if (!user) return null
            
            const articles = await Article.find({ author: id })
            return articles.filter(n => n.status === 'PUBLISHED')
        },
        allUserOffers: async (_, { id }, { user }) => {
            if (!user) return null
            
            const offers = await Offer.find({ user: id })
            return offers || []
        },

        allRoles: async (_, args, { user }) => {
            if (!user) return null

            return await Role.find()
        },
        allImages: async (_, args, { user }) => {
            if (!user) return null
            
            return await Image.find()
        },
        allAvatars: async (_, args, { user }) => {
            if (!user) return null
            
            return await Avatar.find()
        },
        allChats: async (_, args, { user }) => {
            if (!user) return null
            
            return await Chat.find()
        },
        allStatus: (_, args, { user }) => {
            if (!user) return null
            
            return ([ C.MODERATION, C.PUBLISHED ])
        },
        allOffers: async (_, args, { user }) => {
            if (!user) return null
            
            return await Offer.find()
        },
        allArticles: async (_, { status }, { user }) => {
            if (!user) return null
            
            const articles = await Article.find()
            if (status) return articles.filter(n => n.status === status)
            return articles
        },
        allHubs: async (_, { status }, { user }) => {
            if (!user) return null
            
            const hubs = await Hub.find()
            if (status) return hubs.filter(h => h.status === status)
            return hubs
        },
        allPermissions: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.ACCESS_CLIENT,
                C.ACCESS_DASHBOARD,
                C.ADD_USER,
                C.ADD_ARTICLE,
                C.ADD_OFFER,
                C.ADD_HUB,
                C.EDIT_USER,
                C.EDIT_ARTICLE,
                C.EDIT_OFFER,
                C.EDIT_HUB,
                C.DELETE_USER,
                C.DELETE_ARTICLE,
                C.DELETE_OFFER,
                C.DELETE_HUB,
                C.OPEN_CHAT,
                C.CLOSE_CHAT,
                C.USER_MESSAGING,
                C.SYSTEM_MESSAGING
            ])
        },
        allSettings: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.VERIFIED_EMAIL,
                C.VERIFIED_PHONE,
                C.NOTIFIED_EMAIL
            ])
        },
        allImageCategories: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.ICON,
                C.POSTER
            ])
        },
        allAchievementAreas: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.HUB,
                C.OFFER,
                C.CHAT,
                C.TOURNAMENT,
                C.PROFILE
            ])
        },

        getUser: async (_,  { id }, { user, req }) => {
            if (id) {
                const _user = await User.findOne({ id })
                req.session.user = _user
                if (sessionID === _user.sessionID)
                    return _user
            }

            if (user) return user
            return null
        },
        getAvatar: async (_,  { id }, { user }) => {
            if (!user) return null
            
            await Avatar.findById(id)
        },
        getImage: async (_,  { id }, { user }) => {
            if (!user) return null
            
            await Image.findById(id)
        },
        getOffer: async (_,  { id }, { user }) => {
            if (!user) return null
            
            await Offer.findById(id)
        },
        getArticle: async (_,  { id }, { user }) => {
            if (!user) return null
            
            await Article.findById(id)
        },
        getHub: async (_,  { id }, { user }) => {
            if (!user) return null
            
            await Hub.findById(id)
        },
        getChat: async (_,  { id }, { user }) => {
            if (!user) return null
            
            await Chat.findById(id)
        },

        countAvatars: async (_, args, { user }) => {
            if (!user) return null
            
            await Avatar.estimatedDocumentCount()
        },
        countImages: async (_, args, { user }) => {
            if (!user) return null
            
            await Image.estimatedDocumentCount()
        },
        countUsers: async (_, args, { user }) => {
            if (!user) return null
            
            await User.estimatedDocumentCount()
        },
        countOffers: async (_, args, { user }) => {
            if (!user) return null
            
            await Offer.estimatedDocumentCount()
        },
        countArticles: async (_, args, { user }) => {
            if (!user) return null
            
            await Article.estimatedDocumentCount()
        },
        countHubs: async (_, args, { user }) => {
            if (!user) return null
            
            await Hub.estimatedDocumentCount()
        },
        countChats: async (_, args, { user }) => {
            if (!user) return null
            
            await Chat.estimatedDocumentCount()
        }
    },
    Mutation: {
        // Auth/Reg
        async login(_, { name, password, sessionID }, { req }) {
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
            
            req.session.user = user
            if (sessionID === user.sessionID) return user
            else {
                user.sessionID = req.sessionID
                await user.save()
            }
        
            return user
        },
        async register(_, {
                registerInput: {
                    name,
                    email,
                    password,
                    confirmPassword,
                    role,
                    phone,
                    avatar
                }
            }, { req }) {
            // Validate user data
            const { valid, errors } = validateRegisterInput(
                name,
                email,
                password,
                confirmPassword, 
                phone,
                avatar
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
            
            const userRole = await Role.findOne({ name: 'USER' })
            const newUser = new User({
                email,
                name,
                password,
                role: role || userRole.id,
                phone,
                avatar
            })

            req.session.user = newUser
            newUser.sessionID = req.sessionID
            await newUser.save()
        
            return newUser
        },

        // Avatar
        addAvatar: async (_, args, { storeUpload, user }) => {
            if (!user) return false
            
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
        editAvatar: async (_, args, { storeUpload, user }) => {
            if (!user) return false
            
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
        deleteAvatar: async (_, { id, user }) => {
            if (!user) return false
            
            await Avatar.findById(id).deleteOne()
            return true
        },

        // Image
        addImage: async (_, args, { storeUpload, user }) => {
            if (!user) return false
            
            const image = await storeUpload(args.name, args.file)
            await Image.create({
                name: args.name,
                path: image.path,
                category: args.category
            })
            return true
        },
        editImage: async (_, args, { storeUpload, user }) => {
            if (!user) return false
            
            const image = await Image.findById(args.id)
            const file = args.file && await storeUpload(args.name, args.file)

            image.name = args.name || image.name
            image.path = (file && file.path) || image.path
            image.category = args.category || image.category
            await image.save()
            
            return true
        },
        deleteImage: async (_, { id }, { user }) => {
            if (!user) return false
            
            for (i of id) {
                await Image.findById(id).deleteOne()
            }
            return true
        },

        // Role
        addRole: async (_, args, { user }) => {
            if (!user) return false

            await Role.create(args)

            return true
        },
        editRole: async (_, args, { user }) => {
            if (!user) return false

            const role = await Role.findById(args.id)

            role.name = args.name || role.name
            role.permissions = args.permissions || role.permissions

            await role.save()

            return true
        },
        deleteRoles: async (_, { id }, { user }) => {
            if (!user) return false
            
            for (i of id) {
                await Role.findById(i).deleteOne()
            }

            return true
        },

        // User
        addUser: async (_, args, { pubsub, user }) => {
            if (!user) return false
            
            const avatar = await Avatar.findById(args.avatar)
            await User.create({
                ...args,
                avatar
            })
            
            const users = await User.find()
            pubsub.publish('users', { users })

            return true
        },
        editUser: async (_, args, { pubsub, user }) => {
            if (!user) return false
            
            const _user = await User.findById(args.id)
            const avatar = await Avatar.findById(args.avatar)

            _user.name = args.name || _user.name
            _user.password = args.password || _user.password
            _user.email = args.email || _user.email
            _user.phone = args.phone || _user.phone
            _user.role = args.role || _user.role
            _user.balance = args.balance || _user.balance
            _user.level = args.level || _user.level
            _user.avatar = (avatar && avatar.id) || _user.avatar
            _user.availableAvatars = _user.availableAvatars || _user.availableAvatars
            _user.experience = args.experience || _user.experience
            _user.preferences = args.preferences || _user.preferences
            _user.permissions = args.permissions || _user.permissions
            _user.settings = args.settings || _user.settings

            await _user.save()
            
            const users = await User.find()
            pubsub.publish('users', { users })

            return true
        },
        deleteUsers: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await User.findById(i).deleteOne()
            }

            const users = await User.find()
            pubsub.publish('users', { users })

            return true
        },

        // Offer
        addOffer: async (_, args, { pubsub, user }) => {
            if (!user) return false
            
            await Offer.create(args)

            const offers = await Offer.find()
            pubsub.publish('offers', { offers })
            pubsub.publish('user-offers', { offers: offers.filter(a => a.user === args.user) })

            return true
        },
        editOffer: async (_, args, { pubsub, user }) => {
            if (!user) return false
            
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
        deleteOffers: async (_, { offers }, { pubsub, user }) => {
            if (!user) return false
            
            for (offer of offers) {
                await Offer.findById(offer.id).deleteOne()
            }

            const newOffers = await Offer.find()
            pubsub.publish('offers', { offers: newOffers })

            for (offer of newOffers) {
                pubsub.publish('user-offers', { offers: newOffers.filter(o => o.user === offer.user) })
            }

            return true
        },

        // Article
        addArticle: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false
            
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
        editArticle: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false
            
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
        deleteArticles: async (_, { articles }, { pubsub, user }) => {
            if (!user) return false
            
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

        // Hub
        addHub: async (_, args, { pubsub, user }) => {
            if (!user) return false
            
            await Hub.create(args)

            const hubs = await Hub.find()
            pubsub.publish('hubs', { hubs })

            return true
        },
        editHub: async (_, args, { pubsub, user }) => {
            if (!user) return false
            
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
        deleteHubs: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Hub.findById(id).deleteOne()
            }

            const hubs = await Hub.find()
            pubsub.publish('hubs', { hubs })

            return true
        },

        // Chat
        addChat: async (_, args, { pubsub, user }) => {
            if (!user) return false
            
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
        closeUserChat: async (_, args, { pubsub, user }) => {
            if (!user) return false
            
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

        addMessage: async (_, args, { pubsub, user }) => {
            if (!user) return false
            
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
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('users')
        },
        hubs: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('hubs'),
            resolve: (payload, { status }) => payload.hubs.filter(hub => hub.status === status)
        },
        offers: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('offers'),
            resolve: (payload, { status }) => payload.offers.filter(offer => offer.status === status)
        },
        articles: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('articles'),
            resolve: (payload, { status }) => payload.articles.filter(article => article.status === status)
        },

        userOffers: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('user-offers'),
            resolve: (payload, { id }) => payload.offers.filter(offer => offer.user === id)
        },
        userArticles: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('user-articles'),
            resolve: (payload, { id }) => payload.articles.filter(article => article.author === id)
        },

        messages: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('message-added'),
        },
        userchats: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('userchats'),
        }
    }
}