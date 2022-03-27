import {useRef} from 'react'
import {useAtom} from 'jotai'
import {contractAtom} from '../State/atom'
import {Flex, Select} from '@chakra-ui/react'
export default function HandleSelect() {
  const [contract, setContract] = useAtom(contractAtom)
  const selectRef = useRef()

  const handleSelect = async (event) => {
    setContract(event.target.value)
  }
  return (
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
  )
}
