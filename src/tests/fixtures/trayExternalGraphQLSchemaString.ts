/* eslint-disable no-useless-escape */

export const trayExternalGraphQLSchemaWithCustomTypes = `type Query {
    #
    viewer: Viewer!

    # Search for users
    users(
      # Criteria describing how to search the users
      criteria: UserSearchCriteria

      #
      first: Int

      #
      last: Int

      #
      before: String

      #
      after: String
    ): UserConnection!
  }

  type Viewer {
    #
    solutions(
      criteria: SolutionSearchCriteria
      first: Int
      last: Int
      before: String
      after: String
    ): SolutionConnection!

    #
    solutionInstances(
      criteria: SolutionInstanceSearchCriteria
      first: Int
      last: Int
      before: String
      after: String
    ): SolutionInstanceConnection!

    # List authentications for different connectors and services created by the viewer
    authentications: AuthenticationConnection!

    #
    details: UserDetails!
  }

  #
  input SolutionSearchCriteria {
    #
    tags: [String!]
  }

  #
  type SolutionConnection {
    #
    edges: [SolutionConnectionEdge!]!

    #
    pageInfo: PageInfo!
  }

  #
  type SolutionConnectionEdge {
    #
    node: Solution!

    #
    cursor: String!
  }

  #
  type Solution implements Node {
    #
    id: ID!

    #
    title: String!

    #
    description: String

    #
    tags: [String!]!

    #
    customFields: [CustomField!]!

    #
    configSlots: [ConfigSlot!]!
  }

  #
  interface Node {
    #
    id: ID!
  }

  #
  type CustomField {
    #
    key: String!

    #
    value: String!
  }

  #
  type ConfigSlot {
    #
    externalId: String!

    #
    title: String!

    #
    defaultValue: Json!
  }

  scalar Json

  #
  type PageInfo {
    #
    endCursor: String

    #
    hasNextPage: Boolean!

    #
    startCursor: String

    #
    hasPreviousPage: Boolean!
  }

  #
  input SolutionInstanceSearchCriteria {
    #
    id: String

    #
    name: String

    #
    owner: String

    #
    solutionId: String
  }

  #
  type SolutionInstanceConnection {
    #
    edges: [SolutionInstanceConnectionEdge!]!

    #
    pageInfo: PageInfo!

    #
    totalCount: Int!
  }

  #
  type SolutionInstanceConnectionEdge {
    #
    node: SolutionInstance!

    #
    cursor: String!
  }

  #
  type SolutionInstance implements Node {
    #
    id: ID!

    #
    solution: Solution!

    #
    name: String!

    #
    enabled: Boolean!

    #
    authValues: [AuthSlotValue!]!

    #
    configValues: [ConfigSlotValue!]!

    #
    workflows: WorkflowInstanceConnection!

    #
    solutionVersionFlags: SolutionInstanceSolutionVersionFlags!

    #
    created: DateTime!

    #
    owner: String!
  }

  #
  type AuthSlotValue {
    # External ID defined for authentication slot in solution builder
    externalId: String!

    # User authentication ID from tray system
    authId: String!
  }

  #
  type ConfigSlotValue {
    # External ID defined for configuration slot in solution builder
    externalId: String!

    # Configuration value set for slot
    value: Json
  }

  #
  type WorkflowInstanceConnection {
    #
    edges: [WorkflowInstanceConnectionEdge!]!
  }

  #
  type WorkflowInstanceConnectionEdge {
    #
    node: WorkflowInstance!
  }

  #
  type WorkflowInstance implements Node {
    # ID of workflow instance created from source workflow
    id: ID!

    # ID of source workflow
    sourceWorkflowId: String!

    # Name of source workflow
    sourceWorkflowName: String!

    # URL that can be used to trigger workflow
    triggerUrl: String
  }

  #
  type SolutionInstanceSolutionVersionFlags {
    #
    hasNewerVersion: Boolean!

    #
    requiresUserInputToUpdateVersion: Boolean!

    #
    requiresSystemInputToUpdateVersion: Boolean!
  }

  # An ISO-8601 encoded UTC date as string
  scalar DateTime

  #
  type AuthenticationConnection {
    #
    edges: [AuthenticationEdge!]!

    #
    pageInfo: PageInfo!
  }

  #
  type AuthenticationEdge {
    #
    node: Authentication!
  }

  #
  type Authentication implements Node {
    #
    id: ID!

    #
    name: String!

    #
    customFields: Json

    #
    service: Service!

    #
    serviceEnvironment: ServiceEnvironment!
  }

  #
  type Service implements Node {
    #
    id: ID!

    #
    name: String!

    #
    version: String!

    #
    title: String!

    #
    icon: String!
  }

  #
  type ServiceEnvironment implements Node {
    #
    id: ID!

    #
    name: String!
      @deprecated(
        reason: "Please use id as an identifier of the environment and title for human-readable purposes"
      )

    #
    title: String!
  }

  #
  type UserDetails {
    #
    username: String!

    #
    email: String!

    #
    name: String!
  }

  #
  input UserSearchCriteria {
    # ID of the corresponding account in the partner system
    externalUserId: String

    # Name of user
    name: String

    # ID of user account in the tray system
    userId: String
  }

  #
  type UserConnection {
    #
    edges: [UserConnectionEdge!]!

    #
    pageInfo: PageInfo!
  }

  #
  type UserConnectionEdge {
    #
    node: ExternalUser!

    #
    cursor: String!
  }

  # A user corresponding to an account in a partner system
  type ExternalUser implements User & Node {
    #
    id: ID!

    #
    name: String!

    #
    externalUserId: String
  }

  #
  interface User {
    #
    id: ID!
  }

  type Mutation {
    #
    createSolutionInstance(
      input: CreateSolutionInstanceInput!
    ): CreateSolutionInstancePayload!

    #
    updateSolutionInstance(
      input: UpdateSolutionInstanceInput!
    ): UpdateSolutionInstancePayload!

    #
    upgradeSolutionInstance(
      input: UpgradeSolutionInstanceInput!
    ): UpgradeSolutionInstancePayload!

    #
    removeSolutionInstance(
      input: RemoveSolutionInstanceInput!
    ): RemoveSolutionInstancePayload!

    # Create a new user, corresponding to an account in the partner system
    createExternalUser(
      input: CreateExternalUserInput!
    ): CreateExternalUserPayload!

    # Remove a user corresponding to an account in the partner system
    removeExternalUser(
      input: RemoveExternalUserInput!
    ): RemoveExternalUserPayload!

    # As a partner user, create an authorization token for the given external user, that can later be used for calls to this API
    authorize(input: AuthorizeInput!): AuthorizePayload!

    # Generate an authorization code for displaying Tray iframe
    generateAuthorizationCode(
      input: GenerateAuthorizationCodeInput!
    ): GenerateAuthorizationCodePayload!

    # Create a new user authentication; used to authenticate user in external services.
    createUserAuthentication(
      input: CreateUserAuthenticationInput!
    ): CreateUserAuthenticationPayload!

    # Remove given authentication
    removeAuthentication(
      input: RemoveUserAuthenticationInput!
    ): RemoveUserAuthenticationPayload!

    # Call a connector operation
    callConnector(input: ConnectorCallInput!): ConnectorCallPayload!
  }

  # Input to create a solution instance
  input CreateSolutionInstanceInput {
    # ID of the solution
    solutionId: ID!

    # Name of the solution instance
    instanceName: String!

    # Init user authentication values provided by partner
    authValues: [AuthValue!]

    # Init config values provided by partner
    configValues: [ConfigValue!]

    #
    clientMutationId: String
  }

  # Auth slot value input type
  input AuthValue {
    # External ID defined for authentication slot in solution builder
    externalId: String!

    # User authentication ID from tray system
    authId: String!
  }

  #
  input ConfigValue {
    # External ID defined for configuration slot in solution builder
    externalId: String!

    # Json value wrapped inside of a string  e.g. "\"string_json_value\"", "true", "7", "[1, 7, 4]", "{\"json_key\": 5}"
    value: Json
  }

  # Result of creation of the solution instance
  type CreateSolutionInstancePayload {
    #
    solutionInstance: SolutionInstance!

    #
    clientMutationId: String
  }

  # Input to update an solution instance
  input UpdateSolutionInstanceInput {
    # ID of the solution instance
    solutionInstanceId: ID!

    # Name of the solution instance
    instanceName: String

    # Enabled state of the solution instance
    enabled: Boolean

    # User authentication values provided by partner
    authValues: [AuthValue!]

    # Config values provided by partner
    configValues: [ConfigValue!]

    # Error on enabling solution instance with missing values
    errorOnEnablingWithMissingValues: Boolean

    #
    clientMutationId: String
  }

  # Result of update of the solution instance
  type UpdateSolutionInstancePayload {
    #
    solutionInstance: SolutionInstance!

    #
    clientMutationId: String
  }

  # Input to upgrade a solution instance to use latest solution version
  input UpgradeSolutionInstanceInput {
    # ID of the solution instance
    solutionInstanceId: ID!

    # User authentication values provided by partner
    authValues: [AuthValue!]

    # Config values provided by partner
    configValues: [ConfigValue!]

    #
    clientMutationId: String
  }

  # Result of upgrade of the solution instance
  type UpgradeSolutionInstancePayload {
    #
    solutionInstance: SolutionInstance!

    #
    clientMutationId: String
  }

  # Input to remove a solution instance
  input RemoveSolutionInstanceInput {
    # ID of the solution instance
    solutionInstanceId: ID!

    #
    clientMutationId: String
  }

  # Result of removing a solution instance
  type RemoveSolutionInstancePayload {
    #
    clientMutationId: String
  }

  #
  input CreateExternalUserInput {
    #
    name: String!

    #
    externalUserId: String!

    #
    clientMutationId: String
  }

  #
  type CreateExternalUserPayload {
    #
    userId: ID!

    #
    clientMutationId: String
  }

  #
  input RemoveExternalUserInput {
    #
    userId: ID!

    #
    clientMutationId: String
  }

  #
  type RemoveExternalUserPayload {
    #
    clientMutationId: String
  }

  #
  input AuthorizeInput {
    #
    userId: ID!

    #
    clientMutationId: String
  }

  #
  type AuthorizePayload {
    #
    accessToken: String!

    #
    clientMutationId: String
  }

  #
  input GenerateAuthorizationCodeInput {
    #
    userId: ID!

    #
    clientMutationId: String
  }

  #
  type GenerateAuthorizationCodePayload {
    #
    authorizationCode: String!

    #
    clientMutationId: String
  }

  # Input to create an authentication
  input CreateUserAuthenticationInput {
    # Name of the authentication
    name: String!

    # ID of the service
    serviceId: String!

    # ID of the service environment
    serviceEnvironmentId: String!

    # Authentication data containing e.g. authorization tokens
    data: Json!

    # Data that usually comes from fields on the Tray authentication form (for
    # example: subdomain to use when refreshing the authentication)
    formData: Json

    # Scopes of the authentication
    scopes: [String!]

    # Controls if authentication should be hidden in UI. Default is false.
    hidden: Boolean

    #
    clientMutationId: String
  }

  # Result of creation of the authentication
  type CreateUserAuthenticationPayload {
    #
    authenticationId: String!

    #
    clientMutationId: String
  }

  # Input to remove an authentication
  input RemoveUserAuthenticationInput {
    # ID of the authentication
    authenticationId: ID!

    #
    clientMutationId: String
  }

  # Result of removal of the authentication
  type RemoveUserAuthenticationPayload {
    #
    clientMutationId: String
  }

  #
  input ConnectorCallInput {
    # Connector name
    connector: String!

    # Connector version
    version: String!

    # Connector operation to call
    operation: String!

    # Authentication ID
    authId: String

    # Input (JSON object) to pass to the connector
    input: Json!

    #
    clientMutationId: String
  }

  #
  type ConnectorCallPayload {
    #
    output: Json!

    #
    clientMutationId: String
  }
  `
