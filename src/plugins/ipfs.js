const { VITE_IPFS_PATH, VITE_IPFS_HASH_IMAGES, VITE_IPFS_HASH_IFRAME } = import.meta.env

export const ipfsImage = `${VITE_IPFS_PATH}${VITE_IPFS_HASH_IMAGES}`
export const ipfsIframe = `${VITE_IPFS_PATH}${VITE_IPFS_HASH_IFRAME}`