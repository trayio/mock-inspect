export const simpleGraphQLExampleSchemaString = `directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
  ) on FIELD_DEFINITION | OBJECT | INTERFACE
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  enum HeightUnit {
    METRE
    CENTIMETRE
    FOOT
  }

  type Post {
    id: ID!
    author: User
    title: String
    content: String
    createdAt: String
    likeGivers: [User]
  }

  type Query {
    hello: String
    me: User
    users: [User]
    user(name: String!): User
  }

  scalar Upload

  type User {
    id: ID!
    email: String!
    name: String
    age: Int
    height(unit: HeightUnit = CENTIMETRE): Float
    weight(unit: WeightUnit = KILOGRAM): Float
    friends: [User]
    posts: [Post]
    birthDay: String
  }

  enum WeightUnit {
    KILOGRAM
    GRAM
    POUND
  }
`
