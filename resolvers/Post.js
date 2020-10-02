const { publish, create, edit, remove } = require('../utils/functions')
const C = require('../types')
const User = require('./../models/User')
const Notification = require('./../models/Notification')
const Post = require('../models/Post')
const Comment = require('./../models/Comment')
const Hub = require('./../models/Hub')
const Image = require('./../models/Image')

module.exports = {  
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
    Query: {
        allUserPosts: async (_, args, { user }) =>
            checkout(() => {
                const posts = await Post.find({ author: user.id })
                return posts.filter(n => n.status === 'PUBLISHED')
            }),

        allPosts: async (_, { status, type }, { user }) =>
            checkout(() => {
                let posts = []
            
                if (type) posts = await Post.find({ type })
                else posts = await Post.find()

                if (status) posts.filter(n => n.status === status)
                return posts
            }, user),
        
        allPostTypes: (_, args, { user }) =>
            checkout(() => ([C.OFFER, C.ARTICLE]), user),

        allPostComments: async (_, { id }, { user }) =>
            checkout(() => await Comment.find({ post: id }), user),

        getPost: async (_,  { id }, { user }) =>
            checkout(() => await Post.findById(id), user),

        countPosts: async (_, args, { user }) =>
            checkout(() => await Post.find().estimatedDocumentCount(), user),

        countUserPosts: async (_,  args, { user }) =>
            checkout(() => await Post.find({ author: user.id }).estimatedDocumentCount(), user),

        countComments: async (_, { id }, { user }) =>
            checkout(() => await Comment.find((id) ? { post: id } : {}).estimatedDocumentCount(), user),
    },
    Mutation: {
        addPost: async (_, args, { storeUpload, pubsub, user }) =>
            checkout(() => {
                if (args.preview) {
                    const file = await storeUpload(args.preview)
                    const image = (file) && create(Image, { name: file.filename, path: file.path })

                    if (image) args.preview = image.id
                }

                await create(Post, { ...args, author: user.id })
                await publish(Post, {}, C.SUB_POSTS, pubsub)
                await publish(Post, {}, C.SUB_USER_POSTS, pubsub, (posts) =>
                    posts.filter(o => o.author === args.author)
                )
            }, user),

        editPost: async (_, args, { storeUpload, pubsub, user }) =>
            checkout(() => {
                if (args.preview) {
                    const file = await storeUpload(args.preview)
                    const image = (file) && create(Image, { name: file.filename, path: file.path })
    
                    if (image) args.preview = image.id
                }
                
                await edit(Post, args)
                await publish(Post, {}, C.SUB_POSTS, pubsub)
                await publish(Post, {}, C.SUB_USER_POSTS, pubsub, (posts) =>
                    posts.filter(o => o.author === args.author)
                )
            }, user),

        deletePosts: async (_, { posts }, { pubsub, user }) =>
            checkout(() => {
                await remove(Post, posts, true)
                const documents = await publish(Post, {}, C.SUB_POSTS, pubsub)
    
                for (post of documents) {
                    await publish(Post, {}, C.SUB_USER_POSTS, pubsub, (posts) =>
                        posts.filter(o => o.author === post.author)
                    )
                }
            }, user),

        addComment: async (_, args, { pubsub, user }) =>
            checkout(() => {
                await create(Comment, { ...args, user: user.id })
                await publish(Comment, { post: args.post }, C.SUB_COMMENTS, pubsub)
    
                try {
                    const post = await Post.findById(args.post)
                    const authorPost = await User.findById(post.author)
    
                    if (authorPost.id !== user.id) {
                        await create(Notification, { user: authorPost.id, text: `${user.name} left a comment on the ${authorPost.title}` })
                        await publish(Notification, { user: authorPost.id }, C.SUB_USER_NOTIFICATION, pubsub)
                    }
                } catch (err) {
                    console.log(err)
                    throw new Error('Failed to notify author about a new comment')
                }
            }, user),

        editComment: async (_, args, { pubsub, user }) =>
            checkout(() => {
                await edit(Comment, args)
                await publish(Comment, { post }, C.SUB_COMMENTS, pubsub)
            }, user),

        deleteComments: async (_, { post, id }, { pubsub, user }) =>
            checkout(() => {
                await remove(Comment, id)
                await publish(Comment, { post }, C.SUB_COMMENTS, pubsub)
            }, user)
    },
    Subscription: {
        posts: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator(C.SUB_POSTS),
            resolve: (payload, { status, type }) => payload.posts.filter(post => (post.status === status) && (post.type === type))
        },

        comments: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator(C.SUB_COMMENTS),
            resolve: (payload, { id }) => payload.comments.filter(comment => comment.post.equals(id))
        },
        
        userPosts: {
            subscribe: async (_, args, { pubsub, user }) =>
                (!user) ? null : pubsub.asyncIterator(C.SUB_USER_POSTS),
            resolve: async (payload, { name, type }) => {
                const user = await User.findOne({ name })
                return payload.posts.filter(post => post.author.equals(user._id))
            }
        }
    }
}