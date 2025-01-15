import '@/styles/globals.css'
import { Orbis, OrbisProvider } from "@orbisclub/components";
import "@orbisclub/components/dist/index.modern.css";
import React from 'react';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'


// Initialize TimeAgo
if (!TimeAgo.getDefaultLocale()) {
  TimeAgo.addDefaultLocale(en);
}

global.orbis_context = "kjzl6cwe1jw14ayto69ezhdxb77x7eo1qadj0t0ubfg7zjehl39t1ibbsgmsdzq";
global.orbis_chat_context = "";


let orbis = new Orbis({
  useLit: false,
  node: "https://node2.orbis.club",
  PINATA_GATEWAY: 'https://orbis.mypinata.cloud/ipfs/',
  PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  PINATA_SECRET_API_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY
});


export default function App({ Component, pageProps }) {
  return(
    <OrbisProvider defaultOrbis={orbis} authMethods={["metamask", "wallet-connect", "email"]} context={global.orbis_context}>
      <Component {...pageProps} />
    </OrbisProvider>
  )
}