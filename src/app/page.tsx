'use client'
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { getGoogleToken } from "./actions";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useUser()
  const [isInit, setIsInit] = useState(false)

  useEffect(() => {
    async function reauthAcct() {
      if(user) {
        // Grab the Google Account from the user's list of external accounts
        const googleAccount = user.externalAccounts
          .find(ea => ea.provider === "google")

        const reauth = await googleAccount?.reauthorize({
          // This is just where you want the person to end up after the reauth
          redirectUrl: window.location.href,
          // Provide the additional scopes to reauthenticate the user
          additionalScopes: [
            "https://www.googleapis.com/auth/calendar.readonly",
            'https://www.googleapis.com/auth/calendar.events.readonly'
          ]
        })

        // From the reauthorization request, grab the URL to redirect the user to confirm permissions
        if(reauth?.verification?.externalVerificationRedirectURL) {
          window.location.href = reauth?.verification?.externalVerificationRedirectURL.href
        }
      }
    }

    // When we have a user and we've not already started the init process, check the scopes
    if(user && !isInit) {
      setIsInit(true)
      const googleAccount = user.externalAccounts.find(ea => ea.provider === "google")
      // If the account doesn't have the required scope, start the reauth process
      if(!googleAccount?.approvedScopes?.includes("https://www.googleapis.com/auth/calendar.readonly")) {
        reauthAcct()
      }
    }
  }, [user])

  async function getCalendarStuff() {
    const tokenInfo = await getGoogleToken()
    const { token } = tokenInfo
    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    const json = await res.json()
    console.log(json)
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <SignedIn>
          <UserButton userProfileProps={{
            additionalOAuthScopes: {
              google: [
                'https://www.googleapis.com/auth/calendar.readonly'
              ]
            }
          }} />
          <Button onClick={getCalendarStuff} >
            Get calendar data
          </Button>
        </SignedIn>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="https://nextjs.org/icons/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
