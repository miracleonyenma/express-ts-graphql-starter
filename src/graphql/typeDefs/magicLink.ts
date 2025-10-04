// ./src/graphql/typeDefs/magicLink.ts

const magicLinkTypeDefs = `#graphql
  """
  Response type for magic link request operations
  Provides feedback on the success of magic link generation
  """
  type MagicLinkResponse {
    """
    Indicates whether the magic link request was successful
    """
    success: Boolean!
    
    """
    Human-readable message about the operation result
    """
    message: String!
  }

  """
  Input type for requesting a magic link
  Contains the email address where the magic link should be sent
  """
  input RequestMagicLinkInput {
    """
    Email address to send the magic link to
    Must be a valid email format
    """
    email: String!
  }

  """
  Input type for verifying a magic link token
  Contains the token from the magic link URL
  """
  input VerifyMagicLinkInput {
    """
    The magic link token to verify
    This token is extracted from the magic link URL
    """
    token: String!
  }

  type Mutation {
    """
    Request a magic link to be sent to the specified email address
    Returns success status and message without revealing if email exists
    """
    requestMagicLink(input: RequestMagicLinkInput!): MagicLinkResponse!
    
    """
    Verify a magic link token and authenticate the user
    Returns the same authentication data as other login methods
    """
    verifyMagicLink(input: VerifyMagicLinkInput!): AuthData!
  }
`;

export default magicLinkTypeDefs;
