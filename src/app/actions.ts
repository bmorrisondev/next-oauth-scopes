'use server'
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function getGoogleToken() {
  const { userId } = auth()

  // this returns an array of OauthAccessToken objects I'm just getting the first one
  const token = await clerkClient.users.getUserOauthAccessToken(
    userId || '',
    'oauth_google'
  )

  console.log(token.data[0])
  return {
    token: token.data[0].token
  }
}