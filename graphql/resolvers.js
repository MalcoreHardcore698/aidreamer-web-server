const C = require('../types')

const User = require('./../models/User')
const UserChat = require('./../models/UserChat')
const Chat = require('./../models/Chat')
const Message = require('./../models/Message')
const Notification = require('./../models/Notification')
const Language = require('./../models/Language')
const Role = require('./../models/Role')
const Offer = require('./../models/Offer')
const Article = require('./../models/Article')
const Comment = require('./../models/Comment')
const Hub = require('./../models/Hub')
const Avatar = require('./../models/Avatar')
const Image = require('./../models/Image')
const Icon = require('./../models/Icon')

const bcrypt = require('bcryptjs')
const { UserInputError } = require('apollo-server-express')

const {
  validateRegisterInput,
  validateLoginInput
} = require('../utils/validators')

module.exports = {
    Avatar: {
        hub: async (parent) => await Hub.findById(parent.hub)
    },
    Icon: {
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
        chats: async (parent) => await UserChat.find({ sender: parent.id, status: C.OPEN_CHAT })
    },
    Notification: {
        user: async (parent) => await User.findById(parent.user)
    },
    Message: {
        chat: async (parent) => await Chat.findById(parent.chat),
        user: async (parent) => await User.findById(parent.user)
    },
    Chat: {
        members: async (parent) => {
            const members = []

            for (let member of parent.members) {
                const usr = await User.findById(member)
                members.push(usr)
            }

            return members
        },
        messages: async (parent) => {
            const messages = []

            for (let message of parent.messages) {
                const msg = await Message.findById(message)
                messages.push(msg)
            }

            return messages
        }
    },
    UserChat: {
        chat: async (parent) => await Chat.findById(parent.chat),
        user: async (parent) => await User.findById(parent.user),
        interlocutor: async (parent) => await User.findById(parent.interlocutor)
    },
    Hub: {
        id: parent => parent.id,
        icon: async (parent) => {
            const icon = await Icon.findById(parent.icon)
            if (icon) return icon
            return { id: '', name: '', path: '' }
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
        hub: async (parent) => await Hub.findById(parent.hub),
        comments: async (parent) => await Comment.find({ article: parent.id })
    },
    Comment: {
        article: async (parent) => await Article.findById(parent.article),
        user: async (parent) => await User.findById(parent.user)
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
        allUserArticles: async (_, args, { user }) => {
            if (!user) return null
            
            const articles = await Article.find({ author: user.id })
            return articles.filter(n => n.status === 'PUBLISHED')
        },
        allUserOffers: async (_, args, { user }) => {
            if (!user) return null
            
            const offers = await Offer.find({ user: user.id })
            return offers || []
        },
        allUserChats: async (_, args, { user }) => {
            if (!user) return null
            
            const userChats = await UserChat.find({ user: user.id })
            return userChats || []
        },
        allUserNotifications: async (_, args, { user }) => {
            if (!user) return null

            const notifications = await Notification.find({ user: user.id })
            return notifications || []
        },
        allChats: async (_, args, { user }) => {
            if (!user) return null

            const chats = await Chat.find()
            return chats
        },
        allChatTypes: (_, args, { user }) => {
            if (!user) return null
            
            return ([ C.USER_CHAT, C.GROUP_CHAT ])
        },
        allChatMessages: async (_, { id }, { user }) => {
            if (!user) return null

            const messages = await Message.find({ chat: id })
            return messages
        },
        allLanguages: async (_, args, { user }) => {
            if (!user) return null

            return await Language.find()
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
        allIcons: async (_, args, { user }) => {
            if (!user) return null

            return await Icon.find()
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
        allArticleComments: async (_, { id }, { user }) => {
            if (!user) return null

            const comments = await Comment.find({ article: id })
            return comments || []
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
            
            return await Avatar.findById(id)
        },
        getImage: async (_,  { id }, { user }) => {
            if (!user) return null
            
            return await Image.findById(id)
        },
        getIcon: async (_,  { id }, { user }) => {
            if (!user) return null
            
            return await Icon.findById(id)
        },
        getOffer: async (_,  { id }, { user }) => {
            if (!user) return null
            
            return await Offer.findById(id)
        },
        getArticle: async (_,  { id }, { user }) => {
            if (!user) return null
            
            return await Article.findById(id)
        },
        getHub: async (_,  { id }, { user }) => {
            if (!user) return null
            
            return await Hub.findById(id)
        },

        countAvatars: async (_, args, { user }) => {
            if (!user) return null
            
            return await Avatar.estimatedDocumentCount()
        },
        countImages: async (_, args, { user }) => {
            if (!user) return null
            
            return await Image.estimatedDocumentCount()
        },
        countUsers: async (_, args, { user }) => {
            if (!user) return null
            
            return await User.estimatedDocumentCount()
        },
        countOffers: async (_, args, { user }) => {
            if (!user) return null
            
            return await Offer.estimatedDocumentCount()
        },
        countArticles: async (_, args, { user }) => {
            if (!user) return null
            
            return await Article.estimatedDocumentCount()
        },
        countComments: async (_, { id }, { user }) => {
            if (!user) return null

            if (!id) return await Comment.find().estimatedDocumentCount()
            return await Comment.find({ article: id }).estimatedDocumentCount()
        },
        countHubs: async (_, args, { user }) => {
            if (!user) return null
            
            return await Hub.estimatedDocumentCount()
        }
    },
    Mutation: {
        // Auth/Reg
        async login(_, { name, password, area }, { req }) {
            const { errors, valid } = validateLoginInput(name, password)
        
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ name })

            if (area) {
                const role = await Role.findById(user.role)
                
                if (!role.permissions.find(p => p === C.ACCESS_DASHBOARD)) {
                    errors.general = 'Not enough permissions'
                    throw new UserInputError('Not enough permissions', { errors })
                }
            }
        
            if (!user) {
                errors.general = 'User not found'
                throw new UserInputError('User not found', { errors })
            }
        
            const match = await bcrypt.compare(password, user.password)
            if (!match) {
                errors.general = 'Wrong crendetials'
                throw new UserInputError('Wrong crendetials', { errors })
            }
            
            const sessionID = req.sessionID
            req.session.user = user

            if (sessionID === user.sessionID) return user
            else {
                user.sessionID = sessionID
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
        addAvatar: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false
            
            const file = await storeUpload(args.file)
            await Avatar.create({
                order: args.order,
                name: file.filename,
                path: file.path,
                complexity: args.complexity,
                hub: args.hub
            })

            const avatars = await Avatar.find()
            pubsub.publish('avatars', { avatars })

            return true
        },
        editAvatar: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false
            
            const avatar = await Avatar.findById(args.id)
            const file = args.file && await storeUpload(args.file)

            avatar.order = args.order || avatar.order
            avatar.name = args.name || file.filename
            avatar.path = (file && file.path) || file.path
            avatar.complexity = args.complexity || avatar.complexity
            avatar.hub = args.hub || avatar.hub
            await avatar.save()

            const avatars = await Avatar.find()
            pubsub.publish('avatars', { avatars })

            return true
        },
        deleteAvatars: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Avatar.findById(i).deleteOne()
            }

            const avatars = await Avatar.find()
            pubsub.publish('avatars', { avatars })

            return true
        },

        // Image
        addImage: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false
            
            const file = await storeUpload(args.file)
            await Image.create({
                name: file.name,
                path: file.path,
                hub: args.hub
            })

            const images = await Image.find()
            pubsub.publish('images', { images })

            return true
        },
        editImage: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false
            
            const image = await Image.findById(args.id)
            const file = args.file && await storeUpload(args.file)

            image.name = args.name || file.filename
            image.path = (file && file.path) || file.path
            image.hub = args.hub || image.hub
            await image.save()

            const images = await Image.find()
            pubsub.publish('images', { images })
            
            return true
        },
        deleteImages: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Image.findById(i).deleteOne()
            }

            const images = await Image.find()
            pubsub.publish('images', { images })

            return true
        },

        // Icon
        addIcon: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false
            
            const file = await storeUpload(args.file)
            await Icon.create({
                name: file.filename,
                path: file.path,
                hub: args.hub
            })

            const icons = await Icon.find()
            pubsub.publish('icons', { icons })

            return true
        },
        editIcon: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false
            
            const icon = await Icon.findById(args.id)
            const file = args.file && await storeUpload(args.file)

            icon.name = args.name || icon.filename
            icon.path = (file && file.path) || icon.path
            icon.hub = args.hub || icon.hub
            await icon.save()

            const icons = await Icon.find()
            pubsub.publish('icons', { icons })
            
            return true
        },
        deleteIcons: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Icon.findById(i).deleteOne()
            }

            const icons = await Icon.find()
            pubsub.publish('icons', { icons })

            return true
        },

        // Language
        addLanguage: async (_, args, { pubsub, user }) => {
            if (!user) return false

            await Language.create(args)

            const languages = await Language.find()
            pubsub.publish('languages', { languages })

            return true
        },
        editLanguage: async (_, args, { pubsub, user }) => {
            if (!user) return false

            const language = await Language.findById(args.id)
            language.code = args.code || language.code
            await language.save()

            const languages = await Language.find()
            pubsub.publish('languages', { languages })

            return true
        },
        deleteLanguages: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Language.findById(i).deleteOne()
            }

            const languages = await Language.find()
            pubsub.publish('languages', { languages })

            return true
        },

        // Role
        addRole: async (_, args, { pubsub, user }) => {
            if (!user) return false

            await Role.create(args)

            const roles = await Role.find()
            pubsub.publish('roles', { roles })

            return true
        },
        editRole: async (_, args, { pubsub, user }) => {
            if (!user) return false

            const role = await Role.findById(args.id)

            role.name = args.name || role.name
            role.permissions = args.permissions || role.permissions

            await role.save()

            const roles = await Role.find()
            pubsub.publish('roles', { roles })

            return true
        },
        deleteRoles: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Role.findById(i).deleteOne()
            }

            const roles = await Role.find()
            pubsub.publish('roles', { roles })

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
            
            const _user = await User.findOne({ name: args.name })
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
            
            await Offer.create({
                ...args,
                user: user.id
            })

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

            const _user = await User.findOne({ name: args.author })
            
            const article = await Article.create({
                author: _user.id,
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
                    path: file.path
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
                    path: file.path
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
        addComment: async (_, args, { pubsub, user }) => {
            if (!user) return false

            try {
                await Comment.create({
                    ...args,
                    user: user.id
                })
    
                const comments = await Comment.find({ article: args.article })
                pubsub.publish('comments', { comments })
            } catch (err) {
                console.log(err)
                throw new Error('Failed to create a new comment')
            }

            try {
                const article = await Article.findById(args.article)
                const authorArticle = await User.findById(article.author)

                if (authorArticle.id !== user.id) {
                    await Notification.create({
                        user: authorArticle.id,
                        text: `${user.name} left a comment on the ${article.title}`
                    })
        
                    const notifications = await Notification.find({ user: authorArticle.id })
                    pubsub.publish('notifications', { notifications })
                }
            } catch (err) {
                console.log(err)
                throw new Error('Failed to notify author about a new comment')
            }

            return true
        },
        editComment: async (_, args, { pubsub, user }) => {
            if (!user) return false

            const comment = await Comment.findById(args.id)

            comment.user = args.user || comment.user
            comment.article = args.article || comment.article
            comment.text = args.text || comment.text
            await comment.save()

            return true
        },
        deleteComments: async (_, { article, id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Comment.findById(i).deleteOne()
            }

            const comments = await Comment.find({ article })
            pubsub.publish('comments', { comments })

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
            hub.icon = args.icon || hub.icon
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

            const members = []

            for (let member of args.members) {
                const _user = await User.findOne({ name: member })
                if (_user) members.push(_user.id)
            }
            
            await Chat.create({
                type: args.type,
                title: args.title,
                members
            })

            const chats = await Chat.find()
            pubsub.publish('chats', { chats })

            return true
        },
        editChat: async (_, args, { pubsub, user }) => {
            if (!user) return false

            const chat = await Chat.findById(args.id)

            const members = []

            for (let member of args.members) {
                const _user = await User.findOne({ name: member })
                if (_user) members.push(_user.id)
            }
            
            chat.type = args.type || chat.type
            chat.title = args.title || chat.title
            chat.members = members || chat.members

            await chat.save()

            const chats = await Chat.find()
            pubsub.publish('chats', { chats })

            return true
        },
        deleteChats: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Chat.findById(id).deleteOne()
            }

            const chats = await Chat.find()
            pubsub.publish('chats', { chats })

            return true
        },

        // UserChat
        openUserChat: async (_, { name }, { pubsub, user }) => {
            if (!user)
                return false

            if (name === user.name)
                return false

            const interlocutor = await User.findOne({ name })

            let userChat = await UserChat.findOne({
                user: user.id,
                interlocutor: interlocutor.id
            })
            
            if (userChat) {
                userChat.status = C.OPEN_CHAT
                await userChat.save()
            } else {
                const chat = await Chat.create({
                    title: name,
                    type: C.USER_CHAT,
                    members: [
                        user.id,
                        interlocutor.id
                    ]
                })
                userChat = await UserChat.create({
                    chat: chat.id,
                    user: user.id,
                    interlocutor: interlocutor.id,
                    status: C.OPEN_CHAT
                })
            }

            const chats = await UserChat.find({
                user: user.id,
                status: C.OPEN_CHAT
            })
            pubsub.publish('user-chats', { chats })

            return userChat
        },
        addUserChatMessage: async (_, args, { pubsub, user }) => {
            if (!user) return false

            const chat = await Chat.findById(args.id)

            const message = await Message.create({
                chat: chat.id,
                user: user.id,
                text: args.text,
                type: C.UNREADED
            })
            
            chat.messages.push(message)
            await chat.save()

            const messages = await Message.find({
                chat: chat.id
            })
            pubsub.publish('messages', { messages })

            for (let member of chat.members) {
                if (!member.equals(user._id)) {
                    const candidateChat = await UserChat.findOne({ user: member })
                    
                    if (candidateChat && chat._id.equals(candidateChat.chat)) {
                        candidateChat.status = C.OPEN_CHAT
                    } else {
                        await UserChat.create({
                            user: member,
                            chat: chat.id,
                            interlocutor: user.id,
                            status: C.OPEN_CHAT
                        })

                        const chats = await UserChat.find({
                            user: member,
                            status: C.OPEN_CHAT
                        })
                        pubsub.publish('user-chats', { chats })
                    }

                    await Notification.create({
                        user: member,
                        text: `${user.name} sent you message`
                    })

                    const notifications = await Notification.find({ user: member })
                    pubsub.publish('notifications', { notifications })
                }
            }

            return true
        }
    },
    Subscription: {
        images: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('images')
        },
        avatars: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('avatars')
        },
        icons: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('icons')
        },
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
        comments: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('comments'),
            resolve: (payload, { id }) => payload.comments.filter(comment => comment.article === id)
        },
        chats: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('chats')
        },
        messages: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('messages'),
            resolve: async (payload, { id }) => {
                // console.log(payload.messages)
                return payload.messages.filter(message => message.chat.equals(id))
            }
        },
        notifications: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('notifications'),
            resolve: async (payload, args, { user }) => {
                return payload.notifications.filter(notification => notification.user.equals(user._id))
            }
        },
        roles: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('roles')
        },
        languages: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('languages')
        },

        userOffers: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('user-offers'),
            resolve: async (payload, { name }) => {
                const user = await User.findOne({ name })
                return payload.offers.filter(offer => offer.user.equals(user.id))
            }
        },
        userArticles: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('user-articles'),
            resolve: async (payload, { name }) => {
                const user = await User.findOne({ name })
                return payload.articles.filter(article => article.author.equals(user.id))
            }
        },
        userChats: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('user-chats'),
            resolve: async (payload, { name }) => {
                const user = await User.findOne({ name })
                return payload.chats.filter(chat => chat.user.equals(user.id))
            }
        }
    }
}