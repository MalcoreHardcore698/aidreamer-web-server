const { gql } = require('apollo-server-express')

module.exports = gql`
    enum UserRoles {
        ADMINISTRATOR
        MODERATOR
        USER
    }

    enum Status {
        MODERATION
        PUBLISHED
    }

    enum ChatStatus {
        OPEN
        CLOSE
    }

    enum AchievementArea {
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

    type Image {
        id: ID!
        name: String!
        path: String!
        category: ImageCategory!
    }

    type Avatar {
        id: ID!
        order: Int!
        name: String!
        path: String!
        complexity: Int!
        hub: Hub!
    }

    type Achievement {
        id: ID!
        title: String!
        description: String!
        area: AchievementArea!
    }

    type User {
        id: ID!
        name: String!
        password: String!
        email: String!
        phone: String
        role: UserRoles!
        token: String!
        balance: Int
        level: Int
        experience: Int
        avatar: Avatar
        availableAvatars: [Avatar]
        offers: [Offer]
        payment: [Payment]
        preferences: [Hub]
        achievements: [Achievement]
        transactions: [Transaction]
        chats: [UserChat]
        isVerifiedEmail: Boolean
        isVerifiedPhone: Boolean
        isNotified: Boolean,
        updatedAt: String,
        createdAt: String
    }

    type Payment {
        id: ID!
        bankBranding: String!
        cardNumber: Int!
        securityCode: Int
        expirationDate: String
        cardHolderName: String
        bankContactInfo: String
        updatedAt: String
        createdAt: String!
    }

    type Transaction {
        id: ID!
        title: String!
        date: String!
        sum: Float
        updatedAt: String
        createdAt: String!
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
    }

    input PaymentInput {
        bankBranding: String!
        cardNumber: Int!
        securityCode: Int
        expirationDate: String
        cardHolderName: String
        bankContactInfo: String
    }

    input TransactionInput {
        title: String!
        date: String!
        sum: Float
    }

    input UserIDInput {
        id: ID!
    }

    type Query {
        allAvatars: [Avatar]
        allImages: [Image]
        allUsers: [User]
        allOffers(status: Status): [Offer]
        allArticles(status: Status): [Article]
        allUserArticles(id: ID!): [Article]
        allHubs(status: Status): [Hub]
        allChats: [Chat]
        allUserRoles: [UserRoles]
        allStatus: [Status]
        allImageCategories: [ImageCategory]
        allAchievementAreas: [AchievementArea]
        allUserOffers(id: ID!): [Offer]!

        authUser(
            name: String
            email: String
            password: String!
        ): User!
        
        getAvatar(id: ID!): Avatar
        getImage(id: ID!): Image
        getUser(id: ID!): User
        getOffer(id: ID!): Offer
        getArticle(id: ID!): Article
        getHub(id: ID!): Hub
        getChat(id: ID!): Chat

        countAvatars: Int!
        countImages: Int!
        countUsers: Int!
        countOffers: Int!
        countHubs: Int!
    }

    input RegisterInput {
        name: String!
        password: String!
        confirmPassword: String!
        email: String!
        phone: String
        role: UserRoles
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

    type Mutation {
        register(registerInput: RegisterInput): User!
        login(name: String!, password: String!): User!

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
        
        addUser(
            name: String!
            password: String!
            email: String!
            phone: String!
            role: UserRoles!
            balance: Int
            level: Int
            experience: Int
            avatar: ID
            preferences: [ID]
            payment: PaymentInput
            isVerifiedEmail: Boolean
            isVerifiedPhone: Boolean
            isNotified: Boolean
        ): Boolean!
        editUser(
            id: ID!
            name: String
            password: String
            email: String
            phone: String
            role: UserRoles
            balance: Int
            level: Int
            experience: Int
            avatar: ID
            preferences: [ID]
            isVerifiedEmail: Boolean
            isVerifiedPhone: Boolean
            isNotified: Boolean
        ): Boolean!
        deleteUsers(
            id: [ID]
        ): Boolean!

        # ARTICLE
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