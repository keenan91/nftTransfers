import {useEffect, useState, useRef} from 'react'
import {atom, useAtom} from 'jotai'
import logo from './logo.svg'
import './App.css'
import {ethers} from 'ethers'
import abi from './abi.json'
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
import {ExternalLinkIcon, ArrowForwardIcon} from '@chakra-ui/icons'
import M3O from 'm3o'
let m3o = M3O('')
const Provider = new ethers.providers.JsonRpcProvider(
  'https://rpc.ankr.com/eth',
)

const contractAtom = atom('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D')
const transcationAtom = atom([])
const collectionJSONAtom = atom(null)
const assestsJSONAtom = atom([])

function CollectionDescription() {
  const [collectionJSON] = useAtom(collectionJSONAtom)
  console.log(collectionJSON)
  return (
    <>
      <Flex justify="center" mt="1rem">
        <Image
          borderRadius="full"
          boxSize="150px"
          src={collectionJSON?.asset.collection.image_url}
          align="center"
        />
      </Flex>

      <Heading as="h1" size="lg" align="center">
        {collectionJSON?.asset.collection.name}
      </Heading>
      <Text maxW="800px" margin="auto">
        {collectionJSON?.asset.collection.description}
      </Text>
    </>
  )
}

function App() {
  const {colorMode, toggleColorMode} = useColorMode()
  const [tx, setTx] = useAtom(transcationAtom)
  const [contract, setContract] = useAtom(contractAtom)
  const [collectionJSON, setCollectionJSON] = useAtom(collectionJSONAtom)
  const [assestsJSON, setAssestsJSON] = useAtom(assestsJSONAtom)
  const selectRef = useRef()
  const Contract = new ethers.Contract(contract, abi, Provider)
  const filterFrom = Contract.filters.Transfer(null, null, null)

  // Called when Contract emit Transfer event, queries m30 API for additon info on Asset
  const handleLiveTransferUpdate = async (from, to, tokenId) => {
    let rsp = await m3o.nft.asset({
      contract_address: contract,
      token_id: tokenId.toString(),
    })
    let date = new Date().toLocaleString()
    let truncateFrom = from.slice(0, 6) + '...' + from.slice(-4)
    let truncateTo = to.slice(0, 6) + '...' + to.slice(-4)
    setTx((prev) => [
      {
        from: truncateFrom,
        to: truncateTo,
        id: tokenId.toString(),
        time: date,
        fromLink: `https://etherscan.io/address/${from}`,
        toLink: `https://etherscan.io/address/${to}`,
        image: rsp.asset.image_url,
      },
      ...prev,
    ])
  }
  // Handles the updating of the Contract state when selected collection changes
  const handleSelect = async (event) => {
    setContract(event.target.value)
  }

  useEffect(() => {
    async function fetchCollectionInfo() {
      let rsp = await m3o.nft.asset({
        contract_address: contract,
        token_id: '1',
      })
      setCollectionJSON(rsp)
      console.log(rsp)
    }

    // function for retrieving historical transacations on contract
    const getHistoricalTx = async () => {
      let currentBlock = await Provider.getBlockNumber()
      let previousBlock = currentBlock - 1000
      const items = await Contract.queryFilter(
        filterFrom,
        previousBlock,
        currentBlock,
      )
      // loop over Transaction events and fetch additional info on Assets from M30 API
      items.forEach((item) => {
        async function fetchAdditionInfoOnAsset() {
          let rsp = await m3o.nft.asset({
            contract_address: contract,
            token_id: item.args.tokenId.toString(),
          })
          // converting Block number to Date
          let time = await Provider.getBlock(item.blockNumber)
          let timeStamp = time.timestamp
          let convertTimeStampToMinutes =
            timeStamp * 1000 - new Date().getTime()
          let date = new Date(timeStamp * 1000).toLocaleString()

          let truncateFrom =
            item.args.from.slice(0, 6) + '...' + item.args.from.slice(-4)
          let truncateTo =
            item.args.to.slice(0, 6) + '...' + item.args.to.slice(-4)

          setTx((prev) => [
            {
              from: truncateFrom,
              to: truncateTo,
              id: item.args.tokenId.toString(),
              time: date,
              fromLink: `https://etherscan.io/address/${item.args.from}`,
              toLink: `https://etherscan.io/address/${item.args.to}`,
              image: rsp.asset.image_url,
            },
            ...prev,
          ])
        }
        fetchAdditionInfoOnAsset()
      })
    }
    fetchCollectionInfo()
    getHistoricalTx()

    // listening for new transacations on contract
    Contract.on('Transfer', handleLiveTransferUpdate)
    // Clean up the event listener when the component unmounts and clearing the state
    return () => {
      Contract.removeAllListeners('Transfer')
      setTx([])
    }
  }, [contract])

  return (
    <Box w="90%" margin="auto" mt="2rem">
      <Button onClick={toggleColorMode}>
        Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
      </Button>
      <Flex
        justify="center"
        alignItems="center"
        direction={['column', 'column', 'row']}
        gap="1rem"
      >
        <Heading textAlign="center" mb="1rem">
          Recent Transfer History
        </Heading>
        <Flex justify="center">
          <Select
            maxW="400px"
            ref={selectRef}
            onChange={handleSelect}
            textAlign="center"
          >
            <option value="0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D">
              Bored Ape Yacht Club
            </option>
            <option value="0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb">
              CryptoPunks
            </option>
            <option value="0x60E4d786628Fea6478F785A6d7e704777c86a7c6">
              Mutant Ape Yacht Club
            </option>
            <option value="0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B">
              Clone X
            </option>
            <option value="0xa3AEe8BcE55BEeA1951EF834b99f3Ac60d1ABeeB">
              VeeFriends
            </option>
            <option value="0xED5AF388653567Af2F388E6224dC7C4b3241C544">
              Azuki
            </option>
            <option value="0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e">
              Doodles
            </option>
            <option value="0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7">
              Meebits
            </option>
            <option value="0xe785E82358879F061BC3dcAC6f0444462D4b5330">
              World of Women
            </option>
            <option value="0xBD4455dA5929D5639EE098ABFaa3241e9ae111Af">
              Nft Worlds
            </option>
          </Select>
        </Flex>
      </Flex>

      <CollectionDescription mb="2rem" />

      <SimpleGrid
        columns={[1, 1, 2, 2, 3]}
        spacing={10}
        maxW={['95%', '95%', '90%', '80%']}
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
            <Text>Token Id {tx.id}</Text>
            {tx.time ? (
              <Text>Time: {tx.time}</Text>
            ) : (
              <Text>Time: Not Available</Text>
            )}
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default App
