import { useEffect, useState } from 'react'
import { getCsrfToken, signIn, useSession } from 'next-auth/react'
import { SiweMessage } from 'siwe'
import { useAccount, useConnect, useNetwork, useSignMessage } from 'wagmi'
import Layout from "../components/layout"


function Siwe() {
  const { data: session, status } = useSession()
  const [siweMessage, setSiweMessage] = useState<string>('');
  const {connectors, connectAsync} = useConnect();
  const callbackUrl = '/protected';
  const { signMessage } = useSignMessage({
    message: siweMessage,
    onSuccess: (signature) => {
      signIn('credentials', 
        { message: JSON.stringify(siweMessage), 
          redirect: false, 
          signature, 
          callbackUrl 
      });
    }
  })

  const handleLogin = async () => {
    try {
      const res = await connectAsync(connectors[0]);
      const message = new SiweMessage({
        domain: window.location.host,
        address: res.account,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId: res.chain?.id,
        nonce: await getCsrfToken()
      });
      setSiweMessage(message.prepareMessage())
    } catch (error) {
      window.alert(error)
    }
  }

  useEffect(() => {
    if(siweMessage != ''){
      console.log("called signMessage");
      signMessage();
    }
  },[siweMessage])

  return (
    <Layout>
      {session?.user ? (
        <p>Signed In</p>
      ): (
        <button
        onClick={(e) => {
          e.preventDefault()
          handleLogin()
        }}
      >
        Sign-In with Ethereum
      </button>
      )
    }
    </Layout>
  )
}

Siwe.Layout = Layout

export default Siwe
