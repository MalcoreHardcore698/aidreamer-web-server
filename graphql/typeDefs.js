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

    enum ChatType {
        USER_CHAT
        GROUP_CHAT
    }

    enum Rarity {
        AVAILABLE
        COMMON
        RARE
        EPIC
        LEGENDARY
    }

    enum MessageType {
        READED
        UNREADED
    }

    enum Area {
        USER
        ARTICLE
        HUB
        OFFER
        CHAT
        TOUR
        PROFILE
    }

    enum ActStatus {
        WAITING
        COMPLETED
    }

    enum AwardType {
        GEM
        EXP
    }

    enum Action {
        ADD
        EDIT
        DELETE
        SEND
        JOIN
        LEAVE
    }

    enum Goal {
        ONCE
        QUANTITY
        SPECIFIC
    }

    enum Union {
        AND
        OR
        THEN
    }

    ## TYPES ##
    type Image {
        id: ID!
        path: String!
        name: String!
        updatedAt: String,
        createdAt: String!
    }

    type Avatar {
        id: ID!
        name: String!
        path: String!
        rarity: Rarity!
        hub: Hub!
        updatedAt: String,
        createdAt: String!
    }

    type Icon {
        id: ID!
        hub: Hub!
        name: String!
        path: String!
        updatedAt: String,
        createdAt: String!
    }

    type Flag {
        id: ID!
        name: String!
        path: String!
        updatedAt: String
        createdAt: String!
    }

    type Language {
        id: ID!
        code: String!
        title: String!
        flag: Flag!
        updatedAt: String
        createdAt: String!
    }

    type UserAct {
        id: ID!
        user: User!
        act: Act!
        tasks: [UserActTask]!
        status: ActStatus!
        updatedAt: String
        createdAt: String!
    }

    type UserActTask {
        id: ID!
        user: User!
        task: ActTask!
        status: ActStatus!
        updatedAt: String
        createdAt: String!
    }

    type Act {
        id: ID!
        title: String!
        description: String!
        tasks: [ActTask]!
        awards: [Award]
        successor: Act
        status: Status!
        isSource: Boolean
        updatedAt: String
        createdAt: String!
    }

    type Award {
        id: ID!
        award: AwardType!
        quantity: Int!
        updatedAt: String
        createdAt: String!
    }

    type ActTask {
        id: ID!
        title: String!
        icon: Icon!
        condition: [ConditionBlock]!
        awards: [Award]!
        updatedAt: String
        createdAt: String!
    }

    type Specific {
        id: ID!
        area: Area!
    }

    type ConditionBlock {
        id: ID!
        action: Action!
        target: Area!
        goals: [Goal]!
        multiply: Int
        specific: Specific
        union: Union
        link: ConditionBlock
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
        gems: Int
        avatar: Avatar
        availableAvatars: [Avatar]
        chats: [UserChat]
        preferences: [Hub]
        settings: [Setting]
        updatedAt: String
        createdAt: String!
    }

    type Role {
        id: ID!
        name: String!
        permissions: [Permission]
        updatedAt: String
        createdAt: String!
    }

    type Notification {
        id: ID!
        user: User!
        text: String!
        updatedAt: String
        createdAt: String!
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
        type: ChatType
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
        icon: Icon!
        color: String!
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
        user: User!
        article: Article!
        text: String!
        updatedAt: String,
        createdAt: String!
    }

    type Query {
        allUsers: [User]
        allUserActs: [UserAct]
        allUserArticles: [Article]
        allUserOffers: [Offer]
        allUserChats: [UserChat]
        allUserNotifications: [Notification]

        allImages: [Image]
        allAvatars: [Avatar]
        allIcons: [Icon]
        allFlags: [Flag]
        allRoles: [Role]
        allStatus: [Status]
        allRarities: [Rarity]
        allChats: [Chat]
        allChatTypes: [ChatType]
        allChatMessages(id: ID!): [Message]
        allOffers(status: Status): [Offer]
        allArticles(status: Status): [Article]
        allArticleComments(id: ID!): [Comment]
        allHubs(status: Status): [Hub]
        allPermissions: [Permission]
        allSettings: [Setting]
        allLanguages: [Language]
        allActs: [Act]
        allActTasks: [ActTask]
        allConditionBlocks: [ConditionBlock]
        allAwardTypes: [AwardType]
        allActions: [Action]
        allGoals: [Goal]
        allUnions: [Union]
        allAreas: [Area]

        getUser(id: ID): User
        getAvatar(id: ID!): Avatar
        getImage(id: ID!): Image
        getIcon(id: ID!): Icon
        getOffer(id: ID!): Offer
        getArticle(id: ID!): Article
        getHub(id: ID!): Hub

        countAvatars: Int!
        countImages: Int!
        countUsers: Int!
        countOffers: Int!
        countArticles: Int!
        countComments(id: ID): Int!
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

    input InputAward {
        award: AwardType!
        quantity: Int!
    }

    input InputSpecific {
        id: ID!
        area: Area!
    }

    input InputConditionBlock {
        id: ID
        action: Action!
        goals: [Goal]!
        target: Area!
        multiply: Int
        specific: InputSpecific
        union: Union
        link: ID
    }

    input InputActTask {
        id: ID
        title: String!
        icon: ID!
        condition: [InputConditionBlock]!
        awards: [InputAward]!
    }

    input InputComment {
        id: ID
        user: ID
        article: ID
        text: String
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

        # Image
        addImage(
            file: Upload!
        ): Boolean!
        editImage(
            id: ID!
            file: Upload
        ): Boolean!
        deleteImages(
            id: [ID]!
        ): Boolean!

        # Avatar
        addAvatar(
            file: Upload!
            rarity: Rarity!
            hub: ID!
        ): Boolean!
        editAvatar(
            id: ID!
            file: Upload
            rarity: Rarity
            hub: ID
        ): Boolean!
        deleteAvatars(
            id: [ID]!
        ): Boolean!

        # Icon
        addIcon(
            file: Upload!
            hub: ID!
        ): Boolean!
        editIcon(
            id: ID!
            file: Upload
            hub: ID
        ): Boolean!
        deleteIcons(
            id: [ID]!
        ): Boolean!

        # Act
        addAct(
            title: String!
            description: String!
            tasks: [InputActTask]!
            awards: [InputAward]
            successor: ID
            isSource: Boolean
            status: Status!
        ): Boolean!
        editAct(
            id: ID!
            title: String
            description: String
            tasks: [InputActTask]
            awards: [InputAward]
            successor: ID
            isSource: Boolean
            status: Status
        ): Boolean!
        deleteActs(
            id: [ID]!
        ): Boolean!

        # ActTask
        addActTask(
            title: String!
            icon: ID!
            condition: [ID]!
            awards: [InputAward]!
        ): Boolean!
        editActTask(
            id: ID!
            title: String
            icon: ID
            condition: [ID]
            awards: [InputAward]
        ): Boolean!
        deleteActTasks(
            id: [ID]!
        ): Boolean!

        # ConditionBlock
        addConditionBlock(
            action: Action!
            target: Area!
            goals: [Goal]!
            multiply: Int
            specific: ID
            union: Union
            link: ID
        ): Boolean!
        editConditionBlock(
            id: ID!
            action: Action
            target: Area
            goals: [Goal]
            multiply: Int
            specific: ID
            union: Union
            link: ID
        ): Boolean!
        deleteConditionBlocks(
            id: [ID]!
        ): Boolean!
        
        # Flag
        addFlag(
            file: Upload!
        ): Boolean!
        editFlag(
            id: ID!
            file: Upload
        ): Boolean!
        deleteFlags(
            id: [ID]!
        ): Boolean!

        # Language
        addLanguage(
            code: String!
            title: String!
            flag: ID!
        ): Boolean!
        editLanguage(
            id: ID!
            code: String
            title: String
            flag: ID
        ): Boolean!
        deleteLanguages(
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
            names: [String]
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

        # Comment
        addComment(
            article: ID!
            text: String!
        ): Boolean!
        editComment(
            id: ID!
            user: ID
            article: ID
            text: String
        ): Boolean!
        deleteComments(
            id: [ID]!
            article: ID!
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
        addChat(
            type: ChatType!
            title: String!
            members: [String]!
        ): Boolean!
        editChat(
            id: ID!
            type: ChatType
            title: String
            members: [String]
        ): Boolean!
        deleteChats(
            id: [ID]!
        ): Boolean!

        # UserChat
        openUserChat(
            name: String!
            type: ChatType
        ): UserChat
        addUserChatMessage(
            id: ID!
            text: String!
        ): Boolean!
    }

    ## SUBSCRIPTIONS ##
    type Subscription {
        users: [User]
        chats: [Chat]
        hubs: [Hub]
        offers: [Offer]
        messages(id: ID!): [Message]
        articles(status: Status): [Article]
        comments(id: ID!): [Comment]
        images: [Image]
        avatars: [Avatar]
        icons: [Icon]
        flags: [Flag]
        roles: [Role]
        languages: [Language]
        acts: [Act]
        actTasks: [ActTask]
        conditionBlocks: [ConditionBlock]

        userActs(name: String!): [UserAct]
        userNotifications(name: String!): [Notification]
        userOffers(name: String!): [Offer]
        userArticles(name: String!): [Article]
        userChats(name: String!): [UserChat]
    }
`