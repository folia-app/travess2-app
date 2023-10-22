import store from './index'
import { ethers } from 'ethers'

import { NFT, /*Metadata,*/ /*merkleAddresses*/ } from 'nft-contracts'

const network = import.meta.env.VITE_NETWORK
const infuraKey = import.meta.env.VITE_INFURA_KEY

const infuraProvider = new ethers.providers.InfuraProvider(network, infuraKey)

async function getProvider({ name }) {
  let provider = infuraProvider
  name = name ?? import.meta.env.VITE_NETWORK

  // swap-in window provider if on correct network
  if (window.ethereum) {
    const windowProvider = new ethers.providers.Web3Provider(window.ethereum)

    try {
      const network = await windowProvider.getNetwork()
      if (network.name === name) {
        provider = windowProvider
      }
    } catch (e) {
      // console.error(e)
    }
  }
  return provider
}

async function init() {
  let provider = await getProvider({})

  // swap-in window provider if on correct network
  if (window.ethereum) {
    const windowProvider = new ethers.providers.Web3Provider(window.ethereum)

    try {
      const { name } = await windowProvider.getNetwork()
      if (name === import.meta.env.VITE_NETWORK) {
        provider = windowProvider
      }
    } catch (e) {
      // console.error(e)
    }
  }

  let nftContract = new ethers.Contract(NFT.networks[network].address, NFT.abi, provider)
  // let metadataContract = new ethers.Contract(Metadata.networks[network].address, Metadata.abi, provider)

  // get all previous Transfer events from NFTContract
  nftContract.queryFilter(nftContract.filters.Transfer(), 0)
    .then((events) => {
      events.forEach(processNFTTransfer)
    })

  nftContract.on('Transfer', wrappedProcessNFTTransfer)

  // metadataContract.baseURI().then((baseURI) => {
  //   store.commit('BASE_URI', baseURI)
  // })
}

// helpers


function wrappedProcessNFTTransfer(...args) {
  processNFTTransfer({ args })
}


function processNFTTransfer(event) {
  var from = event.args[0]
  var to = event.args[1].toString()
  var tokenId = ethers.BigNumber.from(event.args[2])
  if (from === ethers.constants.AddressZero) {
    const nft = { tokenId: tokenId.toString(), owner: to }
    store.commit('ADD_NFT', nft)
  } else {
    let nft = store.state.nfts.find(nft => nft.tokenId === tokenId.toString())
    nft.owner = to
    store.commit('UPDATE_NFT', nft)
  }
}

export { init, getProvider }

