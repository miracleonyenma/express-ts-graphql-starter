import { config } from "dotenv";
import { AccessTokenResponse, GoogleUser } from "../types/user.js";
config();

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_uri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

const getGoogleOAuthTokens: (args: {
  code: string;
  redirect_uri?: string;
}) => Promise<AccessTokenResponse> = async (args) => {
  const URL = "https://oauth2.googleapis.com/token";

  const values = {
    code: args.code,
    client_id,
    client_secret,
    ...(args?.redirect_uri
      ? { redirect_uri: args.redirect_uri }
      : { redirect_uri }),
    grant_type: "authorization_code",
  };

  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(values).toString(),
    });
    return res.json();
  } catch (error: any) {
    return error;
  }
};

const getGoogleUser: (args: {
  id_token: string;
  access_token: string;
}) => Promise<GoogleUser> = async ({
  id_token,
  access_token,
}: {
  id_token: string;
  access_token: string;
}) => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    return res.json();
  } catch (error) {
    console.log("error", error.message);

    return error;
  }
};

export { getGoogleOAuthTokens, getGoogleUser };
