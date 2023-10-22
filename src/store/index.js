import { createStore } from 'vuex'
import { ethers } from 'ethers'
import { MerkleTree } from 'merkletreejs';
import Contracts from 'nft-contracts'

import { init, getProvider, getNftContract } from './contracts'
import onboard from './onboard'
import networks from './networks'

init()

const network = import.meta.env.VITE_NETWORK_NAME
const infuraKey = import.meta.env.VITE_INFURA_KEY

let provider = new ethers.providers.InfuraProvider(network, infuraKey)
let nftContract = getNftContract(provider)

// this subscribes to the onboard.js state object and updates the vuex store anytime it changes
// this includes connecting, disconnecting or changing balance
// when connected to the correct network, it updates the contracts to be executable
// when connected to the wrong network or no network, it updates the contracts to be read-only
const state = onboard.state.select()
state.subscribe((update) => {
  // console.log('state update: ', update)

  const account = (update.wallets?.length && update.wallets[0]?.accounts[0]) ?? {}
  store.commit('ACCOUNT', { account })

  const wallet = update.wallets[0] ?? {}
  store.commit('WALLET', { wallet })

  const rightNetwork = wallet?.provider?.chainId === networks[network].id || wallet?.provider?.chainId === networks[network].hex

  if (wallet?.provider && rightNetwork) {
    const onboardProvider = wallet.provider
    const etherProvider = new ethers.providers.Web3Provider(onboardProvider, network)
    const signer = etherProvider.getSigner()
    updateContracts(signer)
  } else {
    const etherProvider = new ethers.providers.InfuraProvider(network, infuraKey)
    updateContracts(etherProvider)
  }
})


const updateContracts = async (etherProvider) => {
  nftContract = getNftContract(etherProvider)
}

const store = createStore({
  state() {
    return {
      network,
      baseURI: '',
      wallet: {},
      account: {},
      nfts: undefined,
      price: undefined,
      maxSupply: undefined,
      ensNames: {},
      pending: [
        // {
        //   txHash: 'asdf',
        //   name: 'mint',
        //   status: 'pending'
        // },
        // {
        // {
        //   txHash: 'asdfasdfasd',
        //   name: 'mint',
        //   status: 'success'
        // },
        // {
        //   txHash: 'asdf',
        //   name: 'mint',
        //   status: 'error'
        // },
      ]
    }
  },
  getters: {
    canWrite: (state, getters) => networks[getters.chainId]?.name === network,
    chainId: state => state.wallet?.chains?.length && networks[state.wallet?.chains[0]?.id].id,
    balance: (state) => state.account?.balance ?? null,
    address: (state) => state.account?.address || null,
    addrShort: () => (addr) => addr ? '0x' + addr.slice(2, 4).toUpperCase() + '-' + addr.slice(-4).toUpperCase() : '...',
    ethToWei: () => (eth) => ethers.utils.parseUnits(eth).toString() ?? '-',
    weiToETH: () => wei => ethers.utils.formatUnits(wei) ?? '...',
    mintCount: (state) => state.nfts?.length,
    contractAddress: () => Contracts.Travess.networks[network].address,
    etherscanLink: (state, getters) => hash => {
      let url = `https://${state.network != 'homestead' ? state.network + '.' : ''}etherscan.io`
      url += hash ? `/tx/${hash}`
        : `/address/${getters.contractAddress}`
      return url
    },
    openSeaLink: (state, getters) => ({ tokenId, account }) => {
      const domain = `https://${state.network == 'homestead' ? '' : 'testnets.'}opensea.io`
      if (tokenId) {
        return `${domain}/assets/${state.network === 'homestead' ? 'ethereum' : network}/${getters.contractAddress}/${tokenId}`
      }
      return account ? `${domain}/${account}`
        : domain
    }
  },
  mutations: {
    WALLET(state, { wallet }) {
      state.wallet = wallet
    },
    ACCOUNT(state, { account }) {
      state.account = account
    },
    ADD_NFT(state, nft) {
      if (state.nfts === undefined) {
        state.nfts = []
      }
      state.nfts.push(nft)
    },
    UPDATE_NFT(state, nft) {
      const index = state.nfts.findIndex(v => v.tokenId === nft.tokenId)
      state.nfts.splice(index, 1, nft)
    },
    BASE_URI(state, baseURI) {
      state.baseURI = baseURI
    },
    SET_PRICE(state, value) {
      state.price = value
    },
    SET_MAX_SUPPLY(state, value) {
      state.maxSupply = value
    },
    ADD_ENS_NAME(state, { addr, result }) {
      state.ensNames[addr.toLowerCase()] = result
    },
    ADD_PENDING_TX(state, pendingTx) {
      state.pending.push(pendingTx)
    },
    REMOVE_PENDING_TX(state, txHash) {
      const index = state.pending.findIndex(pendingTx => pendingTx.txHash === txHash)
      state.pending.splice(index, 1)
    },
    UPDATE_TX(state, { txHash, status }) {
      const index = state.pending.findIndex(pendingTx => pendingTx.txHash === txHash)
      state.pending[index].status = status
      setTimeout(() => {
        const index = state.pending.findIndex(pendingTx => pendingTx.txHash === txHash)
        if (index > -1) {
          state.pending.splice(index, 1)
        }
      }, 5000)
    }
  },
  actions: {
    async ensName({ state, commit }, addr) {
      addr = addr.toLowerCase()
      if (state.ensNames[addr]) {
        return state.ensNames[addr]
      }

      try {
        const mainnetProvider = await getProvider({ name: 'homestead' })
        const result = await mainnetProvider.lookupAddress(addr)
        if (result) {
          commit('ADD_ENS_NAME', { addr, result })
          return result
        }
        return null
      } catch (_) { }
    },
    async checkNetwork({ getters, dispatch }) {
      if (!getters.canWrite && !getters.address) {
        await dispatch('connect')
      }
      const chainId = getters.chainId
      if (chainId !== networks[network].id && chainId !== networks[network].hex) {
        await onboard.setChain({ chainId: networks[network].id })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    },
    async connect({ commit, dispatch }) {
      return onboard.connectWallet()
    },
    async disconnect({ state, commit, dispatch }) {
      if (!state.wallet.label) return
      // disconnect the first wallet in the wallets array
      await onboard.disconnectWallet({ label: state.wallet.label })
    },
    async getNFTBalance({ getters, commit, dispatch }) {
      return await nftContract.balanceOf(getters.address)
    },
    // async mintAllowList({ getters, commit, dispatch }, amount = 1) {
    //   if (amount == 1) {
    //     throw new Error("this version of the contract is not yet deployed")
    //   }
    //   await dispatch('checkNetwork')
    //   const price = await dispatch('getPrice')
    //   const value = price.mul(amount)
    //   const tree = new MerkleTree(merkleAddresses.map(ethers.utils.keccak256), ethers.utils.keccak256, { sortPairs: true })
    //   const hashedAddress = ethers.utils.keccak256(getters.address);
    //   const proof = tree.getHexProof(hashedAddress);
    //   await nftContract.mintAllowList(amount, proof, { value })
    // },
    async handlePendingTx({ commit, dispatch }, { name, tx, tokenId }) {
      const txHash = tx.hash
      const status = "pending"
      const pendingTx = { name, txHash, status, tokenId }

      commit('ADD_PENDING_TX', pendingTx)
      tx.wait()
        .then(() => {
          commit('UPDATE_TX', { txHash, status: "success" })
        })
        .catch((e) => {
          commit('UPDATE_TX', { txHash, status: "failed" })
          throw e
        })
    },
    async mint({ getters, commit, dispatch }, amount = 1) {
      await dispatch('checkNetwork')
      const price = await dispatch('getPrice')
      const value = price.mul(amount)
      let userBalance = getters.balance?.ETH
      if (!userBalance) {
        const infuraProvider = new ethers.providers.InfuraProvider(network, infuraKey)
        userBalance = (await infuraProvider.getBalance(getters.address))
      } else {
        userBalance = ethers.utils.parseEther(userBalance)
      }
      if (userBalance.lt(value)) {
        const missing = getters.weiToETH(value.sub(userBalance)).substring(0, 6)
        throw new Error(`Sorry, your account balance is ${missing.toString()} too low`)
      }

      const paused = await nftContract.paused()
      if (paused) {
        throw new Error(`Sorry, minting is paused at the moment.\nPlease check back later or come to the discord for more information.`)
      }

      const start = await nftContract.startdate()
      const waitUntil = new Date(start * 1000).toLocaleString()
      const now = Math.floor(Date.now() / 1000)
      if (now < start) {
        const premint = await nftContract.premint()
        if (now < premint) {
          throw new Error(`Sorry, minting is not yet open. \nPlease wait until ${waitUntil}`)
        } else {

          // NOTE: this is just to test the fake tree, TODO: remove before going live and replace with tree composed of merkleAddresses
          // const addresses = [
          //   '0xaF2CE0962D1a4B1AAB10f7faA62bBbcA40a8EA53',
          //   '0x2F5866D7215416Fa60beDF532856736Cd9a76acf',
          //   '0xFa398d672936Dcf428116F687244034961545D91'
          // ]
          // const tree = new MerkleTree(
          //   addresses.map(ethers.utils.keccak256),
          //   ethers.utils.keccak256,
          //   { sortPairs: true },
          // );
          // const fakeTreeRoot = "0x" + fakeTree.getRoot().toString('hex')

          const tree = new MerkleTree(
            Contracts.merkleAddresses.map(ethers.utils.keccak256),
            ethers.utils.keccak256,
            { sortPairs: true },
          );
          const hashedAddress = ethers.utils.keccak256(getters.address);
          const hexProof = tree.getHexProof(hashedAddress);
          const allowed = await nftContract.allowListed(getters.address, hexProof)
          if (!allowed) {
            throw new Error(`Sorry, you are not on the allow list.\n Please wait until ${waitUntil}`)
          } else {
            // mintAllowlist
            try {
              console.log('mint allow list')
              const tx = await nftContract.mintAllowList(amount, hexProof, { value })
              return dispatch('handlePendingTx', { name: 'mint', tx })
            } catch (e) {
              if (e.toString().indexOf("rejected transaction") > -1) {
                throw new Error(`cancelled transaction`)
              } else {
                throw e
              }
            }
          }
        }
      }

      try {
        const tx = await nftContract['mint(address,uint256)'](getters.address, amount, { value })
        return dispatch('handlePendingTx', { name: 'mint', tx })
      } catch (e) {
        if (e.toString().indexOf("rejected transaction") > -1) {
          throw new Error(`cancelled transaction`)
        } else {
          throw e
        }
      }
    },
    async getPrice({ state, commit }) {
      if (state.price) {
        return state.price
      }

      try {
        const price = await nftContract.price()
        commit('SET_PRICE', price)
        return price
      } catch (e) {
        console.error(e)
      }
    },
    async getMaxSupply ({ state, commit }) {
      if (state.maxSupply) {
        return state.maxSupply
      }

      try {
        const maxSupply = await nftContract['MAX_SUPPLY']()
        commit('SET_MAX_SUPPLY', Number(maxSupply))
        return maxSupply
      } catch (e) {
        console.error(e)
      }
    }
  }
})




export default store