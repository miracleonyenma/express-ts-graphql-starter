type AccessTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
};

type GoogleUser = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

const getGoogleOAuthTokens: (args: {
  code: string;
}) => Promise<AccessTokenResponse> = async ({ code }: { code: string }) => {
  const URL = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
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
