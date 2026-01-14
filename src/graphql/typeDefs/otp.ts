const otpTypeDefs = `#graphql

type RequestOTPResponse {
  success: Boolean!
  message: String!
}

type VerifyOTPResponse {
  success: Boolean!
  message: String
  accessToken: String
  refreshToken: String
  user: User
}

type Mutation {
  requestOTP(email: String!, shouldCreate: Boolean): RequestOTPResponse!
  verifyOTP(email: String!, otp: String!, shouldLogin: Boolean): VerifyOTPResponse!
}
`;

export default otpTypeDefs;
