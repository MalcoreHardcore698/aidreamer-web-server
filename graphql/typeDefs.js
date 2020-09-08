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
        OPEN_CHAT
        CLOSE_CHAT
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

    enum MessageType {
        READED
        UNREADED
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
        updatedAt: String,
        createdAt: String
    }

    type Message {
        chat: Chat!
        user: User!
        text: String!
        type: MessageType!
        updatedAt: String
        createdAt: String!
    }

    type Chat {
        id: ID!
        title: String!
        members: [User]!
        messages: [Message]!
        updatedAt: String
        createdAt: String!
    }

    type UserChat {
        id: ID!
        chat: Chat!
        user: User!
        interlocutor: User!
        status: ChatStatus!
        updatedAt: String
        createdAt: String!
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
        allUserArticles: [Article]
        allUserOffers: [Offer]
        allUserChats: [UserChat]

        allImages: [Image]
        allAvatars: [Avatar]
        allRoles: [Role]
        allStatus: [Status]
        allChats: [Chat]
        allChatMessages(id: ID!): [Message]
        allOffers(status: Status): [Offer]
        allArticles(status: Status): [Article]
        allHubs(status: Status): [Hub]
        allPermissions: [Permission]
        allSettings: [Setting]
        allImageCategories: [ImageCategory]
        allAchievementAreas: [Area]
        
        getUser(id: ID): User
        getAvatar(id: ID!): Avatar
        getImage(id: ID!): Image
        getOffer(id: ID!): Offer
        getArticle(id: ID!): Article
        getHub(id: ID!): Hub

        countAvatars: Int!
        countImages: Int!
        countUsers: Int!
        countOffers: Int!
        countArticles: Int!
        countHubs: Int!
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
        user: String!
    }

    input InputArticle {
        id: ID!
        author: String!
    }
    
    ## MUTATIONS ##
    type Mutation {
        # Auth/Reg
        register(registerInput: RegisterInput!): User!
        login(
            name: String!
            password: String!
            area: String
        ): User!

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
            author: String!
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
            hub: ID!
            title: String!
            message: String!
            status: Status!
        ): Boolean!
        editOffer(
            id: ID!
            hub: ID
            title: String
            message: String
            status: Status
        ): Boolean!
        deleteOffers(
            offers: [InputOffer]
        ): Boolean!
        
        # Chat
        openUserChat(
            name: String!
        ): UserChat
        addUserChatMessage(
            id: ID!
            text: String!
        ): Boolean!
    }

    ## SUBSCRIPTIONS ##
    type Subscription {
        users: [User]
        hubs: [Hub]
        offers: [Offer]
        roles: [Role]
        messages: [Message]
        articles(status: Status): [Article]

        userOffers(name: String!): [Offer]
        userArticles(name: String!): [Article]
        userChats(name: String!): [UserChat]
    }
`