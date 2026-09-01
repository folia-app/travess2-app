import store from './index'
import { ethers } from 'ethers'
import Contracts from 'nft-contracts'

const network = import.meta.env.VITE_NETWORK_NAME
const infuraKey = import.meta.env.VITE_INFURA_KEY

const infuraProvider = new ethers.providers.InfuraProvider(network, infuraKey)

const NFTContractDeploy = Contracts.Coordinates

function getNftContract (provider) {
  return new ethers.Contract(NFTContractDeploy.networks[network].address, NFTContractDeploy.abi, provider)
}

async function getProvider({ name }) {
  let provider = infuraProvider
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

/**
 * Historical log reads, which must not go through Infura or the visitor's wallet.
 *
 * This called queryFilter(filter, 0) — every block since genesis in one request
 * — against InfuraProvider. Infura caps eth_getLogs at 10,000 blocks and answers
 * `-32602: range NNN exceeds limit of 10000`, so the call threw, the .then never
 * ran, and the grid stayed empty. Measured against this contract: Infura
 * refuses; an uncapped endpoint returns all 355 transfers in under two seconds.
 *
 * The identical bug exists in DoAW-app, which shares this file's ancestry, and
 * on the DoAW server, where it silently stopped rendering artwork for two years.
 *
 * Chunking alone is not a fix — walking this range in 10k steps is hundreds of
 * sequential requests. So the read goes to an endpoint that answers the whole
 * range, with chunking kept only for when that endpoint is unavailable.
 *
 * VITE_READ_RPC overrides it. The default is keyless.
 */
const READ_RPC = import.meta.env.VITE_READ_RPC || 'https://mainnet.gateway.tenderly.co'
const readProvider = new ethers.providers.JsonRpcProvider(READ_RPC)
const DEPLOY_BLOCK = Number(import.meta.env.VITE_DEPLOY_BLOCK || 15000000)

async function scanLogs (address, abi, filterName) {
  const contract = new ethers.Contract(address, abi, readProvider)
  const filter = contract.filters[filterName]()
  try {
    return await contract.queryFilter(filter, 0)
  } catch (e) {
    console.warn('wide log query refused, falling back to chunked scan', e.message)
    const latest = await readProvider.getBlockNumber()
    const found = []
    let from = DEPLOY_BLOCK
    let chunk = 100000
    while (from <= latest) {
      const to = Math.min(from + chunk - 1, latest)
      try {
        found.push(...(await contract.queryFilter(filter, from, to)))
        from = to + 1
      } catch (err) {
        if (chunk <= 2000) throw err
        chunk = Math.floor(chunk / 2)
      }
    }
    return found
  }
}

async function init() {
  let provider = await getProvider({})
  let nftContract = getNftContract(provider)
  // let metadataContract = new ethers.Contract(Metadata.networks[network].address, Metadata.abi, provider)

  // get all previous Transfer events from NFTContract
  scanLogs(NFTContractDeploy.networks[network].address, NFTContractDeploy.abi, 'Transfer')
    .then((events) => {
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

