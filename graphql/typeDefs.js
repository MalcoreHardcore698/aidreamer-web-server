const { gql } = require('apollo-server-express')

module.exports = gql`
    ## ENUMS ##
    enum ChatType {
        USER_CHAT
        GROUP_CHAT
    }
    
    enum MessageType {
        READED
        UNREADED
    }

    enum PostType {
        ARTICLE
        OFFER
    }

    enum AwardType {
        GEM
        EXP
    }

    enum IconType {
        HUB
        FLAG
        TASK
        AWARD
    }

    enum Permission {
        ACCESS_CLIENT
        ACCESS_DASHBOARD
        ADD_USER
        ADD_POST
        ADD_HUB
        EDIT_USER
        EDIT_POST
        EDIT_HUB
        DELETE_USER
        DELETE_POST
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

    enum Rarity {
        AVAILABLE
        COMMON
        RARE
        EPIC
        LEGENDARY
    }

    enum Area {
        USER
        POST
        HUB
        CHAT
        TOUR
        PROFILE
    }

    enum ActStatus {
        WAITING
        COMPLETED
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

    type Language {
        id: ID!
        code: String!
        title: String!
        flag: Icon!
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
        translation: String!
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

    type Post {
        id: ID!
        author: User!
        type: PostType!
        title: String!
        subtitle: String
        description: String
        content: String
        preview: Image
        hub: Hub
        views: Int
        comments: [Comment]
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

    type Comment {
        id: ID!
        user: User!
        post: Post!
        text: String!
        updatedAt: String,
        createdAt: String!
    }

    type Query {
        allUsers: [User]
        allUserPosts: [Post]
        allUserActs: [UserAct]
        allUserChats: [UserChat]
        allUserNotifications: [Notification]

        allImages: [Image]
        allAvatars: [Avatar]
        allIcons(type: IconType): [Icon]
        allRoles: [Role]
        allStatus: [Status]
        allRarities: [Rarity]
        allChats: [Chat]
        allChatMessages(id: ID!): [Message]
        allPosts(status: Status, type: PostType): [Post]
        allPostComments(id: ID!): [Comment]
        allHubs(status: Status): [Hub]
        allPermissions: [Permission]
        allSettings: [Setting]
        allLanguages: [Language]
        allActs: [Act]
        allActTasks: [ActTask]
        allConditionBlocks: [ConditionBlock]
        allActions: [Action]
        allGoals: [Goal]
        allUnions: [Union]
        allAreas: [Area]

        allChatTypes: [ChatType]
        allAwardTypes: [AwardType]
        allIconTypes: [IconType]
        allPostTypes: [PostType]

        getUser(id: ID): User
        getAvatar(id: ID!): Avatar
        getImage(id: ID!): Image
        getIcon(id: ID!): Icon
        getPost(id: ID!): Post
        getHub(id: ID!): Hub

        countAvatars: Int!
        countImages: Int!
        countUsers: Int!
        countPosts(type: PostType): Int!
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
        translation: String!
        condition: [InputConditionBlock]!
        awards: [InputAward]!
    }

    input InputComment {
        id: ID
        user: ID
        post: ID
        text: String
    }

    input InputPost {
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
            translation: String!
            condition: [ID]!
            awards: [InputAward]!
        ): Boolean!
        editActTask(
            id: ID!
            title: String
            icon: ID
            translation: String
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

        # Post
        addPost(
            author: ID
            type: PostType!
            title: String!
            subtitle: String
            description: String
            content: String
            preview: Upload
            hub: ID
            views: Int
            comments: [InputComment]
            status: Status!
        ): Boolean!
        editPost(
            id: ID!
            author: ID
            type: PostType
            title: String
            subtitle: String
            description: String
            content: String
            preview: Upload
            hub: ID
            views: Int
            comments: [InputComment]
            status: Status
        ): Boolean!
        deletePosts(
            posts: [InputPost]
        ): Boolean!

        # Comment
        addComment(
            post: ID!
            text: String!
        ): Boolean!
        editComment(
            id: ID!
            user: ID
            post: ID
            text: String
        ): Boolean!
        deleteComments(
            id: [ID]!
            post: ID!
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
        posts(status: Status, type: PostType): [Post]
        messages(id: ID!): [Message]
        comments(id: ID!): [Comment]
        images: [Image]
        avatars: [Avatar]
        icons: [Icon]
        roles: [Role]
        languages: [Language]
        acts: [Act]
        actTasks: [ActTask]
        conditionBlocks: [ConditionBlock]

        userActs(name: String!): [UserAct]
        userNotifications(name: String!): [Notification]
        userPosts(name: String!, type: PostType): [Post]
        userChats(name: String!): [UserChat]
    }
`