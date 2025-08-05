import { Web3AuthNoModal } from '@web3auth/no-modal'
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from '@web3auth/base'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'
import { SolanaPrivateKeyProvider } from '@web3auth/solana-provider'
import { WalletConnectV2Adapter } from '@web3auth/wallet-connect-v2-adapter'
import { ethers } from 'ethers'
import { Connection, PublicKey } from '@solana/web3.js'

// Get from environment variables
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!clientId) {
  throw new Error('NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is required')
}

// Polygon Mumbai testnet config (change to mainnet for production)
const polygonChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x13881', // Mumbai testnet
  rpcTarget: 'https://rpc-mumbai.maticvigil.com/',
  displayName: 'Polygon Mumbai Testnet',
  blockExplorer: 'https://mumbai.polygonscan.com/',
  ticker: 'MATIC',
  tickerName: 'Matic',
}

// Solana devnet config (change to mainnet for production)
const solanaChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: '0x3', // Devnet
  rpcTarget: 'https://api.devnet.solana.com',
  displayName: 'Solana Devnet',
  blockExplorer: 'https://explorer.solana.com/?cluster=devnet',
  ticker: 'SOL',
  tickerName: 'Solana',
}

export class Web3AuthService {
  private web3auth: Web3AuthNoModal | null = null
  private provider: IProvider | null = null
  private currentChain: 'polygon' | 'solana' = 'polygon'

  async initPolygon() {
    try {
      const ethereumProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig: polygonChainConfig }
      })

      // Configure basic OpenLogin adapter without custom login configs
      const openloginAdapter = new OpenloginAdapter({
        privateKeyProvider: ethereumProvider,
        adapterSettings: {
          uxMode: 'popup',
        },
      })

      this.web3auth = new Web3AuthNoModal({
        clientId,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        chainConfig: polygonChainConfig,
        privateKeyProvider: ethereumProvider,
        adapters: [openloginAdapter],
      })

      await this.web3auth.init()
      this.currentChain = 'polygon'
      return this.web3auth
    } catch (error) {
      console.error('Error initializing Web3Auth for Polygon:', error)
      throw error
    }
  }

  async initSolana() {
    try {
      const solanaProvider = new SolanaPrivateKeyProvider({
        config: { chainConfig: solanaChainConfig }
      })

      const openloginAdapter = new OpenloginAdapter({
        privateKeyProvider: solanaProvider,
        adapterSettings: {
          uxMode: 'popup',
        },
      })

      this.web3auth = new Web3AuthNoModal({
        clientId,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        chainConfig: solanaChainConfig,
        privateKeyProvider: solanaProvider,
        // Pass adapters in constructor instead of configuring them later
        adapters: [openloginAdapter],
      })

      await this.web3auth.init()
      this.currentChain = 'solana'
      return this.web3auth
    } catch (error) {
      console.error('Error initializing Web3Auth for Solana:', error)
      throw error
    }
  }

  async connect(chain: 'polygon' | 'solana' = 'polygon') {
    try {
      if (!this.web3auth || this.currentChain !== chain) {
        if (chain === 'polygon') {
          await this.initPolygon()
        } else {
          await this.initSolana()
        }
      }

      if (!this.web3auth) {
        throw new Error('Web3Auth not initialized')
      }

      // Connect using OpenLogin adapter for social login
      this.provider = await this.web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
        loginProvider: 'google',
      })

      return this.provider
    } catch (error) {
      console.error('Error connecting:', error)
      throw error
    }
  }

  async connectWallet(walletType: 'metamask' | 'phantom' | 'walletconnect', chain: 'polygon' | 'solana' = 'polygon') {
    try {
      if (!this.web3auth || this.currentChain !== chain) {
        if (chain === 'polygon') {
          await this.initPolygon()
        } else {
          await this.initSolana()
        }
      }

      if (!this.web3auth) {
        throw new Error('Web3Auth not initialized')
      }

      if (walletType === 'walletconnect') {
        this.provider = await this.web3auth.connectTo(WALLET_ADAPTERS.WALLET_CONNECT_V2)
      } else {
        // For MetaMask and Phantom, we'll use the external wallet detection
        if (typeof window !== 'undefined') {
          if (walletType === 'metamask' && (window as any).ethereum) {
            // Direct MetaMask connection
            const ethereum = (window as any).ethereum
            await ethereum.request({ method: 'eth_requestAccounts' })
            this.provider = ethereum
          } else if (walletType === 'phantom' && (window as any).solana) {
            // Direct Phantom connection
            const solana = (window as any).solana
            await solana.connect()
            this.provider = solana
          } else {
            throw new Error(`${walletType} not detected`)
          }
        }
      }

      return this.provider
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  async getUserInfo() {
    if (!this.web3auth) {
      throw new Error('Web3Auth not initialized')
    }

    const user = await this.web3auth.getUserInfo()
    return user
  }

  async getAccounts() {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    if (this.currentChain === 'polygon') {
      if ((this.provider as any).isMetaMask) {
        // Direct MetaMask
        const accounts = await (this.provider as any).request({ method: 'eth_accounts' })
        return accounts
      } else {
        // Web3Auth provider
        const ethersProvider = new ethers.BrowserProvider(this.provider as any)
        const signer = await ethersProvider.getSigner()
        const address = await signer.getAddress()
        return [address]
      }
    } else {
      // Solana
      if ((this.provider as any).isPhantom) {
        // Direct Phantom
        return [(this.provider as any).publicKey.toString()]
      } else {
        // Web3Auth Solana provider
        const accounts = await (this.provider as any).request({ method: 'getAccounts' })
        return accounts
      }
    }
  }

  async getBalance() {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    const accounts = await this.getAccounts()
    if (accounts.length === 0) {
      throw new Error('No accounts found')
    }

    if (this.currentChain === 'polygon') {
      if ((this.provider as any).isMetaMask) {
        // Direct MetaMask
        const balance = await (this.provider as any).request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        })
        return ethers.formatEther(balance)
      } else {
        const ethersProvider = new ethers.BrowserProvider(this.provider as any)
        const balance = await ethersProvider.getBalance(accounts[0])
        return ethers.formatEther(balance)
      }
    } else {
      // Solana
      const connection = new Connection(solanaChainConfig.rpcTarget)
      const publicKey = new PublicKey(accounts[0])
      const balance = await connection.getBalance(publicKey)
      return (balance / 1e9).toString() // Convert lamports to SOL
    }
  }

  async signMessage(message: string) {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    if (this.currentChain === 'polygon') {
      if ((this.provider as any).isMetaMask) {
        const accounts = await this.getAccounts()
        const signature = await (this.provider as any).request({
          method: 'personal_sign',
          params: [message, accounts[0]]
        })
        return signature
      } else {
        const ethersProvider = new ethers.BrowserProvider(this.provider as any)
        const signer = await ethersProvider.getSigner()
        const signature = await signer.signMessage(message)
        return signature
      }
    } else {
      // Solana
      if ((this.provider as any).isPhantom) {
        const encodedMessage = new TextEncoder().encode(message)
        const signedMessage = await (this.provider as any).signMessage(encodedMessage, 'utf8')
        return signedMessage
      } else {
        const solanaProvider = this.provider as any
        const encodedMessage = new TextEncoder().encode(message)
        const signedMessage = await solanaProvider.request({
          method: 'signMessage',
          params: {
            message: encodedMessage,
          },
        })
        return signedMessage
      }
    }
  }

  async logout() {
    if (this.web3auth) {
      await this.web3auth.logout()
    }
    this.provider = null
  }

  isConnected() {
    return this.web3auth?.status === 'connected' ?? false
  }

  getProvider() {
    return this.provider
  }

  getCurrentChain() {
    return this.currentChain
  }
}

// Singleton instance
export const web3AuthService = new Web3AuthService()