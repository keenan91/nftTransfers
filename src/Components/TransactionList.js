import {useEffect, useRef} from 'react'
import {useAtom} from 'jotai'
import {contractAtom, transcationAtom} from '../State/atom'
import {useMoralis} from 'react-moralis'
import {ethers} from 'ethers'
import abi from '../abi.json'
import {ExternalLinkIcon, ArrowForwardIcon} from '@chakra-ui/icons'
import {
  Box,
  Grid,
  SimpleGrid,
  Flex,
  Button,
  Container,
  Heading,
  Text,
  Badge,
  Link,
  Select,
  Image,
  useColorMode,
} from '@chakra-ui/react'
const Provider = new ethers.providers.JsonRpcProvider(
  'https://rpc.ankr.com/eth',
)

export default function TranscationList() {
  const [tx, setTx] = useAtom(transcationAtom)
  const [contract] = useAtom(contractAtom)
  const {Moralis} = useMoralis()

  const Contract = new ethers.Contract(contract, abi, Provider)
  let appId = 'Q4SFp1T2sY07hT7TEF9kVtNFcWsdDd6etdYGHCxS'
  let serverUrl = 'https://gvrhkyktpyjl.usemoralis.com:2053/server'
  Moralis.start({appId, serverUrl})

  const handleLiveTransferUpdate = async (from, to, tokenId) => {
    const utcStr = new Date().toISOString().replace('T', ' ').replace('Z', '')
    let localTime = new Date(utcStr)
    let localTimeString = localTime.toLocaleString()
    let truncateFrom = from.slice(0, 6) + '...' + from.slice(-4)
    let truncateTo = to.slice(0, 6) + '...' + to.slice(-4)
    setTx((prev) => [
      {
        from: truncateFrom,
        to: truncateTo,
        tokenId: tokenId.toString(),
        time: localTimeString,
        fromLink: `https://etherscan.io/address/${from}`,
        toLink: `https://etherscan.io/address/${to}`,
      },
      ...prev,
    ])
  }

  const fetchNFTS = async () => {
    const options = {
      address: contract,
      chain: 'Eth',
    }
    const nftTransfers = await Moralis.Web3API.token.getContractNFTTransfers(
      options,
    )

    const nftTransfersArray = nftTransfers.result.map((transfer, index) => {
      let blockTimeStamp = transfer.block_timestamp
        .replace('T', ' ')
        .replace('Z', '')
      let localTime = new Date(blockTimeStamp)
      let localTimeString = localTime.toLocaleString()
      let truncateFrom =
        transfer.from_address.slice(0, 6) +
        '...' +
        transfer.from_address.slice(-4)
      let truncateTo =
        transfer.to_address.slice(0, 6) + '...' + transfer.to_address.slice(-4)

      return {
        time: localTimeString,
        from: truncateFrom,
        to: truncateTo,
        tokenId: transfer.token_id,
        fromLink: `https://etherscan.io/address/${transfer.from_address}`,
        toLink: `https://etherscan.io/address/${transfer.to_address}`,
      }
    })

    setTx((prev) => [...nftTransfersArray, ...prev])
  }

  useEffect(() => {
    fetchNFTS()
    Contract.on('Transfer', handleLiveTransferUpdate)
    // Clean up the event listener when the component unmounts and clearing the state
    return () => {
      Contract.removeAllListeners('Transfer')
      setTx([])
    }
  }, [contract])

  return (
    <SimpleGrid
      columns={[1, 2, 2, 3, 4]}
      spacing={[2, 2, 5, 10]}
      maxW="1200px"
      m="auto"
      mt="1rem"
    >
      {tx?.map((tx, index) => (
        <Flex
          key={index}
          direction="column"
          alignItems="center"
          boxShadow="md"
          rounded="md"
          bg="rgba(234,176,90,.1)"
          border="1px"
          borderColor="#eab05a"
          maxW="512px"
          margin="auto"
          p="1rem"
        >
          <Image src={tx.image}></Image>
          <Text>
            <Badge colorScheme="red">From:</Badge>{' '}
            <Link href={tx.fromLink} isExternal>
              <ArrowForwardIcon mx="2px" />
              {tx.from}
              <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
          <Text>
            <Badge colorScheme="green">To:</Badge>{' '}
            <Link isExternal href={tx.toLink}>
              <ArrowForwardIcon mx="2px" />
              {tx.to} <ExternalLinkIcon mx="2px" />{' '}
            </Link>
          </Text>
          <Text>Token Id {tx.tokenId}</Text>
          {tx.time ? (
            <Text>UTC: {tx.time}</Text>
          ) : (
            <Text>Time: Not Available</Text>
          )}
        </Flex>
      ))}
    </SimpleGrid>
  )
}
