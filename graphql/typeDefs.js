const { gql } = require('apollo-server-express')

module.exports = gql`
    ## ENUMS ##
    enum Permission {
        ACCESS_CLIENT
        ACCESS_DASHBOARD
        ADD_USER
        ADD_ARTICLE
        ADD_OFFER
        ADD_HUB
        EDIT_USER
        EDIT_ARTICLE
        EDIT_OFFER
        EDIT_HUB
        DELETE_USER
        DELETE_ARTICLE
        DELETE_OFFER
        DELETE_HUB
        OPEN_CHAT
        CLOSE_CHAT
        USER_MESSAGING
        SYSTEM_MESSAGING
    }

    enum Setting {
        VERIFIED_EMAIL
        VERIFIED_PHONE
        NOTIFIED_EMAIL
    }

    enum Status {
        MODERATION
        PUBLISHED
    }

    enum ChatStatus {
        OPEN
        CLOSE
    }

    enum Area {
        HUB
        OFFER
        CHAT
        TOURNAMENT
        PROFILE
    }

    enum ImageCategory {
        ICON
        POSTER
    }

    ## TYPES ##
    type Image {
        id: ID!
        name: String!
        path: String!
        category: ImageCategory!
        updatedAt: String,
        createdAt: String
    }

    type Avatar {
        id: ID!
        order: Int!
        name: String!
        path: String!
        complexity: Int!
        hub: Hub!
        updatedAt: String,
        createdAt: String
    }

    type Achievement {
        id: ID!
        title: String!
        description: String!
        area: Area!
        updatedAt: String,
        createdAt: String
    }

    type User {
        id: ID!
        sessionID: String!
        name: String!
        password: String!
        email: String!
        phone: String
        role: Role!
        balance: Int
        level: Int
        experience: Int
        avatar: Avatar
        availableAvatars: [Avatar]
        offers: [Offer]
        chats: [UserChat]
        preferences: [Hub]
        achievements: [Achievement]
        settings: [Setting]
        updatedAt: String,
        createdAt: String
    }

    type Role {
        id: ID!
        name: String!
        permissions: [Permission]
    }

    type Message {
        id: ID!
        chat: Chat!
        sender: User!
        receiver: User!
        message: String!
        updatedAt: String
        createdAt: String!
    }
    
    type Chat {
        id: ID!
        owner: ID!
        title: String!
        participants: [User!]!
        messages: [Message]
        updatedAt: String
        createdAt: String!
    }

    type UserChat {
        id: ID!
        userId: ID!
        chatId: ID!
        status: ChatStatus!
        updatedAt: String,
        createdAt: String
    }

    type Offer {
        id: ID!
        user: User!
        hub: Hub!
        title: String!
        message: String!
        status: Status!
        updatedAt: String
        createdAt: String!
    }

    type Hub {
        id: ID!
        title: String!
        description: String!
        slogan: String!
        icon: Image!
        color: String!
        offers: [Offer]
        countUsers: Int
        countOffers: Int
        status: Status!
        updatedAt: String
        createdAt: String!
    }

    type Article {
        id: ID!
        author: User!
        title: String!
        description: String!
        body: String!
        image: Image!
        hub: Hub!
        views: Int
        comments: [Comment]
        status: Status!
        updatedAt: String
        createdAt: String!
    }

    type Comment {
        id: ID!
        user: ID!
        message: String!
        updatedAt: String,
        createdAt: String
    }

    type Query {
        allUsers: [User]
        allUserArticles(id: ID!): [Article]
        allUserOffers(id: ID!): [Offer]

        allImages: [Image]
        allAvatars: [Avatar]
        allRoles: [Role]
        allChats: [Chat]
        allStatus: [Status]
        allOffers(status: Status): [Offer]
        allArticles(status: Status): [Article]
        allHubs(status: Status): [Hub]
        allPermissions: [Permission]
        allSettings: [Setting]
        allImageCategories: [ImageCategory]
        allAchievementAreas: [Area]
        
        getAvatar(id: ID!): Avatar
        getImage(id: ID!): Image
        getUser(sessionID: String!): User
        getOffer(id: ID!): Offer
        getArticle(id: ID!): Article
        getHub(id: ID!): Hub
        getChat(id: ID!): Chat

        countAvatars: Int!
        countImages: Int!
        countUsers: Int!
        countOffers: Int!
        countArticles: Int!
        countHubs: Int!
        countChats: Int!
    }

    # Inputs
    input UserIDInput {
        id: ID!
    }

    input RegisterInput {
        name: String!
        password: String!
        confirmPassword: String!
        email: String!
        role: ID
        phone: String
        avatar: ID
    }

    input InputComment {
        user: ID!
        message: String!
    }

    input InputOffer {
        id: ID!
        user: ID!
    }

    input InputArticle {
        id: ID!
        author: ID!
    }
    
    ## MUTATIONS ##
    type Mutation {
        # Auth/Reg
        register(registerInput: RegisterInput!): User!
        login(name: String!, password: String!): User!

        # Avatar
        addAvatar(
            order: Int!
            name: String!
            file: Upload!
            complexity: Int!
            hub: ID!
        ): Boolean!
        editAvatar(
            id: ID!
            name: String
            file: Upload
            complexity: Int
            hub: ID
        ): Boolean!
        deleteAvatar(
            id: [ID]!
        ): Boolean!

        # Image
        addImage(
            name: String!
            file: Upload!
            category: ImageCategory!
        ): Boolean!
        editImage(
            id: ID!
            name: String
            file: Upload
            category: ImageCategory
        ): Boolean!
        deleteImage(
            id: [ID]!
        ): Boolean!

        # Role
        addRole(
            name: String!
            permissions: [Permission!]!
        ): Boolean!
        editRole(
            id: ID!
            name: String
            permissions: [Permission]
        ): Boolean!
        deleteRoles(
            id: [ID]!
        ): Boolean!
        
        # User
        addUser(
            name: String!
            password: String!
            email: String!
            phone: String!
            role: ID!
            balance: Int
            level: Int
            avatar: ID
            availableAvatars: [ID]
            experience: Int
            preferences: [ID]
            permissions: [Permission]
            settings: [Setting]
        ): Boolean!
        editUser(
            id: ID!
            name: String
            password: String
            email: String
            phone: String
            role: ID
            balance: Int
            level: Int
            avatar: ID
            availableAvatars: [ID]
            experience: Int
            preferences: [ID]
            permissions: [Permission]
            settings: [Setting]
        ): Boolean!
        deleteUsers(
            id: [ID]
        ): Boolean!

        # Article
        addArticle(
            author: ID!
            title: String!
            description: String!
            body: String!
            image: Upload
            hub: ID!
            views: Int
            comments: [InputComment]
            status: Status!
        ): Boolean!
        editArticle(
            id: ID!
            title: String
            description: String
            body: String
            image: Upload
            views: Int
            comments: [InputComment]
            hub: ID
            status: Status
        ): Boolean!
        deleteArticles(
            articles: [InputArticle]
        ): Boolean!
        
        # Hub
        addHub(
            title: String!
            description: String!
            slogan: String!
            icon: ID
            color: String
            status: Status!
        ): Boolean!
        editHub(
            id: ID!
            title: String
            description: String
            slogan: String
            icon: ID
            color: String
            status: Status
        ): Boolean!
        deleteHubs(
            id: [ID!]!
        ): Boolean!
        
        # Offer
        addOffer(
            user: ID!
            hub: ID!
            title: String!
            message: String!
            status: Status!
        ): Boolean!
        editOffer(
            id: ID!
            user: ID
            hub: ID
            title: String
            message: String
            status: Status
        ): Boolean!
        deleteOffers(
            offers: [InputOffer]
        ): Boolean!
        
        # Chat
        addChat(
            id: ID!
            title: String!
            participants: [UserIDInput!]!
            owner: ID!
        ): ID!
        closeUserChat(
            userId: ID!
            chatId: ID!
        ): Boolean!

        addMessage(
            chat: ID!
            sender: ID!
            receiver: ID!
            message: String!
        ): Boolean!
    }

    ## SUBSCRIPTIONS ##
    type Subscription {
        users: [User]
        hubs: [Hub]
        offers: [Offer]
        articles(status: Status): [Article]

        userOffers(id: ID!): [Offer]
        userArticles(id: ID!): [Article]

        messages(chat: ID!): [Message]
        userchats(user: ID!): [UserChat]
    }
`