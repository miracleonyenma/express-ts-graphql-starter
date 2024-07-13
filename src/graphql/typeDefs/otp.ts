const otpTypeDefs = `#graphql

type OTP {
  id: ID
  email: String
  otp: String
  createdAt: String
}

input SendOTPInput {
  email: String!
}

input VerifyOTPInput {
  email: String!
  otp: String!
}

type Query {
  otps: [OTP]
  otp(id: ID!): OTP
}

# Define the Mutation type
type Mutation {
  sendOTP(input: SendOTPInput!): String
  verifyOTP(input: VerifyOTPInput!): Boolean
}
`;

export default otpTypeDefs;
