const C = require('../types')
const ObjectId = require('mongoose').Types.ObjectId

const User = require('./../models/User')
const UserChat = require('./../models/UserChat')
const Chat = require('./../models/Chat')
const Message = require('./../models/Message')
const Notification = require('./../models/Notification')
const Language = require('./../models/Language')
const Role = require('./../models/Role')
const Post = require('../models/Post')
const Comment = require('./../models/Comment')
const Hub = require('./../models/Hub')
const Avatar = require('./../models/Avatar')
const Image = require('./../models/Image')
const Icon = require('./../models/Icon')
const UserAct = require('./../models/UserAct')
const UserActTask = require('./../models/UserActTask')
const Act = require('./../models/Act')
const ActTask = require('./../models/ActTask')
const ConditionBlock = require('./../models/ConditionBlock')

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
    Act: {
        tasks: async (parent) => {
            const tasks = []

            for (id of parent.tasks) {
                const task = await ActTask.findById(id)
                if (task) tasks.push(task)
            }

            return tasks
        },
        successor: async (parent) => await Act.findById(parent.successor)
    },
    ActTask: {
        icon: async (parent) => await Icon.findById(parent.icon),
        condition: async (parent) => {
            const condition = []

            for (id of parent.condition) {
                const conditionBlock = await ConditionBlock.findById(id)
                if (conditionBlock) condition.push(conditionBlock)
            }

            return condition
        } 
    },
    ConditionBlock: {
        link: async (parent) => await ConditionBlock.findById(parent.link),
    },
    Language: {
        flag: async (parent) => {
            const flag = await Icon.findById(parent.flag)
            if (flag) return flag
            return { name: '', path: '' }
        }
    },
    User: {
        id: parent => parent.id,
        name: parent => parent.name,
        avatar: async (parent) => {
            const avatar = await Avatar.findById(parent.avatar)
            if (avatar) return avatar
            return { id: '', name: '', path: '' }
        },
        availableAvatars: async ({ availableAvatars }) => {
            const avatars = []

            const availables = await Avatar.find({ rarity: C.AVAILABLE })
            if (availables) avatars.push(...availables)

            for (id of availableAvatars) {
                const avatar = await Avatar.findById(id)
                if (avatar) avatars.push(avatar)
            }

            return avatars
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
    UserAct: {
        user: async (parent) => await User.findById(parent.user),
        act: async (parent) => await Act.findById(parent.act),
        tasks: async (parent) => {
            const userTasks = []

            for (let task of parent.tasks) {
                const userActTask = await UserActTask.findById(task)
                userTasks.push(userActTask)
            }

            return userTasks || []
        }
    },
    UserActTask: {
        user: async (parent) => await User.findById(parent.user),
        task: async (parent) => await ActTask.findById(parent.task)
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
    Post: {
        author: async (parent) => await User.findById(parent.author),
        preview: async (parent) => {
            if (!parent.preview) return {
                path: ''
            }

            return await Image.findById(parent.preview)
        },
        hub: async (parent) => await Hub.findById(parent.hub),
        comments: async (parent) => await Comment.find({ post: parent.id })
    },
    Comment: {
        post: async (parent) => await Post.findById(parent.post),
        user: async (parent) => await User.findById(parent.user)
    },
    Query: {
        // All Queries
        allUsers: async (_, args, { user }) => {
            if (!user) return null

            return await User.find()
        },
        allUserActs: async (_, args, { user }) => {
            if (!user) return null

            const userActs = await UserAct.find({ user: user.id })

            if (!userActs || (userActs && userActs.length === 0)) {
                const sourceAct = await Act.findOne({ isSource: true })

                if (sourceAct) {
                    const userActTasks = []

                    for (let actTask of sourceAct.tasks) {
                        const userActTask = await UserActTask.create({
                            user: user.id,
                            task: actTask,
                            status: C.WAITING
                        })

                        userActTasks.push(userActTask.id)
                    }

                    await UserAct.create({
                        user: user.id,
                        act: sourceAct.id,
                        tasks: userActTasks,
                        status: C.WAITING
                    })
                }
            }
            
            return userActs || []
        },
        allUserPosts: async (_, args, { user }) => {
            if (!user) return null
            
            const posts = await Post.find({ author: user.id })
            return posts.filter(n => n.status === 'PUBLISHED')
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
        allActs: async (_, args, { user }) => {
            if (!user) return null
            return await Act.find()
        },
        allActTasks: async (_, args, { user }) => {
            if (!user) return null
            return await ActTask.find()
        },
        allConditionBlocks: async (_, args, { user }) => {
            if (!user) return null
            return await ConditionBlock.find()
        },
        allAwardTypes: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.GEM,
                C.EXP
            ])
        },
        allIconTypes: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.HUB,
                C.FLAG,
                C.TASK,
                C.AWARD
            ])
        },
        allPostTypes: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.OFFER,
                C.ARTICLE
            ])
        },
        allActions: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.ADD,
                C.EDIT,
                C.DELETE,
                C.SEND,
                C.JOIN,
                C.LEAVE
            ])
        },
        allGoals: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.ONCE,
                C.QUANTITY,
                C.SPECIFIC
            ])
        },
        allUnions: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.AND,
                C.OR,
                C.THEN
            ])
        },
        allLanguages: async (_, args, { user }) => {
            if (!user) return null
            return await Language.find()
        },
        allRoles: async (_, args, { user }) => {
            if (!user) return null

            return await Role.find()
        },
        allRarities: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.AVAILABLE,
                C.COMMON,
                C.RARE,
                C.EPIC,
                C.LEGENDARY
            ])
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
        allPosts: async (_, { status, type }, { user }) => {
            if (!user) return null
            
            let posts = []
            
            if (type) posts = await Post.find({ type })
            else posts = await Post.find()

            if (status) posts.filter(n => n.status === status)
            return posts
        },
        allPostComments: async (_, { id }, { user }) => {
            if (!user) return null

            const comments = await Comment.find({ post: id })
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
                C.ADD_POST,
                C.ADD_HUB,
                C.EDIT_USER,
                C.EDIT_POST,
                C.EDIT_HUB,
                C.DELETE_USER,
                C.DELETE_POST,
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
        allAreas: (_, args, { user }) => {
            if (!user) return null
            
            return ([
                C.USER,
                C.POST,
                C.HUB,
                C.CHAT,
                C.TOUR,
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
        getPost: async (_,  { id }, { user }) => {
            if (!user) return null
            
            return await Post.findById(id)
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
        countPosts: async (_, args, { user }) => {
            if (!user) return null
            
            return await Post.estimatedDocumentCount()
        },
        countUserPosts: async (_,  args, { user }) => {
            if (!user) return null
            
            return await Post.find({ author: user.id }).estimatedDocumentCount()
        },
        countComments: async (_, { id }, { user }) => {
            if (!user) return null

            if (!id) return await Comment.find().estimatedDocumentCount()
            return await Comment.find({ post: id }).estimatedDocumentCount()
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
            password = await bcrypt.hash(password, 12)
            
            let userRole = await Role.findOne({ name: 'USER' })
            /*
            if (!userRole) {
                userRole = await Role.create({ name: 'ADMIN' })
            }
            */

            const newUser = new User({
                email,
                name,
                password,
                role: userRole.id,
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
                name: file.filename,
                path: file.path,
                rarity: args.rarity,
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

            if (file) {
                avatar.name = file.filename
                avatar.path = file.path
            }

            avatar.rarity = args.rarity || avatar.rarity
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
            language.title = args.title || language.title
            language.flag = args.flag || language.flag
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

        // Act
        addAct: async (_, args, { pubsub, user }) => {
            if (!user) return false

            const actTasks = []

            for (let task of args.tasks) {
                const conditionBlocks = []
                for (let condition of task.condition) {
                    const conditionBlock = await ConditionBlock.create(condition)
                    conditionBlocks.push(conditionBlock.id)
                }

                const actTask = await ActTask.create({
                    ...task,
                    condition: conditionBlocks
                })

                actTasks.push(actTask.id)
            }

            const options = {
                title: args.title,
                description: args.description,
                tasks: actTasks,
                status: args.status || C.PUBLISHED
            }

            if (args.awards)
                options.awards = args.awards

            if (args.successor)
                options.successor = args.successor

            if (args.isSource)
                options.isSource = args.isSource

            await Act.create(options)

            const acts = await Act.find()
            pubsub.publish('acts', { acts })

            return true
        },
        editAct: async (_, args, { pubsub, user }) => {
            if (!user) return false

            const act = await Act.findById(args.id)

            const actTasks = []
            for (let task of args.tasks) {
                if (ObjectId.isValid(task.id)) {
                    const candidate = await ActTask.findById(task.id)

                    if (candidate) {
                        candidate.title = task.title || candidate.title
                        candidate.icon = task.icon || candidate.icon
                        candidate.awards = task.awards || candidate.awards
    
                        await candidate.save()
    
                        actTasks.push(candidate.id)
                    }
                } else {
                    const conditionBlocks = []
                    for (let condition of task.condition) {
                        const conditionBlock = await ConditionBlock.create(condition)
                        conditionBlocks.push(conditionBlock.id)
                    }

                    const actTask = await ActTask.create({
                        title: task.title,
                        icon: task.icon,
                        translation: task.translation,
                        condition: conditionBlocks,
                        awards: task.awards
                    })
                    actTasks.push(actTask.id)
                }
            }
            
            if (args.isSource) {
                const acts = await Act.find()
                for (let _act of acts) {
                    _act.isSource = false
                    await _act.save()
                }
            }

            act.title = args.title || act.title
            act.description = args.description || act.description
            act.tasks = actTasks
            act.successor = args.successor || act.successor
            act.isSource = args.isSource || act.isSource
            act.status = args.status || act.status

            await act.save()

            const acts = await Act.find()
            pubsub.publish('acts', { acts })

            return true
        },
        deleteActs: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Act.findById(i).deleteOne()
            }

            const acts = await Act.find()
            pubsub.publish('acts', { acts })

            return true
        },

        // ActTask
        addActTask: async (_, args, { pubsub, user }) => {
            if (!user) return false

            await ActTask.create(args)

            const actTasks = await ActTask.find()
            pubsub.publish('actTasks', { actTasks })

            return true
        },
        editActTask: async (_, args, { pubsub, user }) => {
            if (!user) return false

            const actTask = await ActTask.findById(args.id)

            actTask.title = args.title || actTask.title
            actTask.icon = args.icon || actTask.icon
            actTask.translation= args.translation || actTask.translation
            actTask.awards = args.awards || actTask.awards

            await actTask.save()

            const actTasks = await ActTask.find()
            pubsub.publish('act-tasks', { actTasks })

            return true
        },
        deleteActTasks: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await ActTask.findById(i).deleteOne()
            }

            const actTasks = await ActTask.find()
            pubsub.publish('act-tasks', { actTasks })

            return true
        },
        
        // ActTask
        addConditionBlock: async (_, args, { pubsub, user }) => {
            if (!user) return false

            await ConditionBlock.create(args)

            const conditionBlocks = await ConditionBlock.find()
            pubsub.publish('condition-blocks', { conditionBlocks })

            return true
        },
        editConditionBlock: async (_, args, { pubsub, user }) => {
            if (!user) return false

            const conditionBlock = await ConditionBlock.findById(args.id)

            conditionBlock.action = args.action || conditionBlock.action
            conditionBlock.target = args.target || conditionBlock.target
            conditionBlock.goals = args.goals || conditionBlock.goals
            conditionBlock.multiply = args.multiply || conditionBlock.multiply
            conditionBlock.specific = args.specific || conditionBlock.specific
            conditionBlock.union = args.union || conditionBlock.union
            conditionBlock.link = args.link || conditionBlock.link

            await conditionBlock.save()

            const conditionBlocks = await ConditionBlock.find()
            pubsub.publish('condition-blocks', { conditionBlocks })

            return true
        },
        deleteConditionBlocks: async (_, { id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await ConditionBlock.findById(i).deleteOne()
            }

            const conditionBlocks = await ConditionBlock.find()
            pubsub.publish('condition-blocks', { conditionBlocks })

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
        deleteUsers: async (_, { names }, { pubsub, user }) => {
            if (!user) return false
            
            for (name of names) {
                await User.find({ name }).deleteOne()
            }

            const users = await User.find()
            pubsub.publish('users', { users })

            return true
        },

        // Post
        addPost: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false

            let preview = null
            if (args.preview) {
                const file = await storeUpload(args.preview)
                const image = (file) && await Image.create({
                    name: file.filename,
                    path: file.path
                })

                if (image) preview = image.id
            }

            const options ={
                ...args,
                author: user.id
            }

            if (preview) options.preview = preview
            
            await Post.create(options)

            const posts = await Post.find()
            pubsub.publish('posts', { posts })
            pubsub.publish('user-posts', { posts: posts.filter(a => a.author === args.author) })

            return true
        },
        editPost: async (_, args, { storeUpload, pubsub, user }) => {
            if (!user) return false
            
            const post = await Post.findById(args.id)

            if (args.preview) {
                const file = await storeUpload(args.preview)
                const image = (file) && await Image.create({
                    name: file.filename,
                    path: file.path
                })

                if (image) post.preview = image.id
            }

            post.author = args.author || post.author
            post.type = args.type || post.type
            post.title = args.title || post.title
            post.subtitle = args.subtitle || post.subtitle
            post.description = args.description || post.description
            post.content = args.content || post.content
            post.hub = args.hub || post.hub
            post.views = args.views || post.views
            post.comments = args.comments || post.comments
            post.status = args.status || post.status

            await post.save()

            const posts = await Post.find()
            pubsub.publish('posts', { posts })
            pubsub.publish('user-posts', { posts: posts.filter(a => a.author === args.author) })

            return true
        },
        deletePosts: async (_, { posts }, { pubsub, user }) => {
            if (!user) return false
            
            for (post of posts) {
                await Post.findById(post.id).deleteOne()
            }

            const newPosts = await Post.find()
            pubsub.publish('posts', { posts: newPosts })

            for (post of newPosts) {
                pubsub.publish('user-posts', { posts: newPosts.filter(o => o.author === post.author) })
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
    
                const comments = await Comment.find({ post: args.post })
                pubsub.publish('comments', { comments })
            } catch (err) {
                console.log(err)
                throw new Error('Failed to create a new comment')
            }

            try {
                const post = await Post.findById(args.post)
                const authorPost = await User.findById(post.author)

                if (authorPost.id !== user.id) {
                    await Notification.create({
                        user: authorPost.id,
                        text: `${user.name} left a comment on the ${authorPost.title}`
                    })
        
                    const notifications = await Notification.find({ user: authorPost.id })
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
            comment.post = args.post || comment.post
            comment.text = args.text || comment.text
            await comment.save()

            return true
        },
        deleteComments: async (_, { post, id }, { pubsub, user }) => {
            if (!user) return false
            
            for (i of id) {
                await Comment.findById(i).deleteOne()
            }

            const comments = await Comment.find({ post })
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
                    pubsub.publish('user-notifications', { notifications })
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
        posts: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('posts'),
            resolve: (payload, { status, type }) => payload.posts.filter(post => (post.status === status) && (post.type === type))
        },
        comments: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('comments'),
            resolve: (payload, { id }) => payload.comments.filter(comment => comment.post.equals(id))
        },
        chats: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('chats')
        },
        messages: {
            subscribe: async (_, args, { pubsub, user }) =>
                pubsub.asyncIterator('messages'),
            resolve: async (payload, { id }) => payload.messages.filter(message => message.chat.equals(id))
        },
        roles: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('roles')
        },
        languages: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('languages')
        },
        acts: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('acts')
        },
        actTasks: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('act-tasks')
        },
        conditionBlocks: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('condition-blocks')
        },
        
        userActs: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('user-acts'),
            resolve: async (payload, { name }) => {
                const user = await User.findOne({ name })
                return payload.acts.filter(userAct => userAct.user.equals(user._id))
            }
        },
        userNotifications: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('user-notifications'),
            resolve: async (payload, { name }) => {
                const user = await User.findOne({ name })
                return payload.notifications.filter(notification => notification.user.equals(user._id))
            }
        },
        userPosts: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('user-posts'),
            resolve: async (payload, { name, type }) => {
                const user = await User.findOne({ name })
                return payload.posts.filter(post => post.author.equals(user._id))
            }
        },
        userChats: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator('user-chats'),
            resolve: async (payload, { name }) => {
                const user = await User.findOne({ name })
                return payload.chats.filter(chat => chat.user.equals(user._id))
            }
        }
    }
}