import store from './index'
import { ethers } from 'ethers'
import Contracts from 'nft-contracts'
import { getAllLogs, readProvider } from './rpc'

const network = import.meta.env.VITE_NETWORK_NAME

// Reads use the redundant keyless pool in ./rpc. Infura's eth_getLogs cap is
// what left this grid empty, and one provider is how that stayed quiet.
const fallbackProvider = readProvider()

const NFTContractDeploy = Contracts.Coordinates

function getNftContract (provider) {
  return new ethers.Contract(NFTContractDeploy.networks[network].address, NFTContractDeploy.abi, provider)
}

async function getProvider({ name }) {
  let provider = fallbackProvider
  name = name ?? import.meta.env.VITE_NETWORK_NAME

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
  let nftContract = getNftContract(provider)
  // let metadataContract = new ethers.Contract(Metadata.networks[network].address, Metadata.abi, provider)

  // get all previous Transfer events from NFTContract
  getAllLogs(NFTContractDeploy.networks[network].address, NFTContractDeploy.abi, 'Transfer')
    .then(({ logs: events }) => {
      events.forEach(processNFTTransfer)
    })
    .catch((e) => {
      // Loud rather than a silently empty grid — this failure went unnoticed
      // precisely because nothing surfaced it.
      console.error('failed to load Coordinates transfers', e)
    })

  // listen for transfers
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

export { init, getProvider, getNftContract, NFTContractDeploy }

