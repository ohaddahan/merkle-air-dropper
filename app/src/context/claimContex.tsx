import {
    createContext,
    FC,
    PropsWithChildren,
    useContext, useEffect,
    useState
} from 'react'
import {MerkleOutput} from "../../../merkle-air-dropper-helpers/helpers.ts";
import {loadMerkleFromUrl} from "../airdrop/get_merkle_json.ts";

export interface ClaimContextType {
    amount: number;
    claimed: boolean;
    setAmount: (amount: number) => void;
    setClaimed: (claimed: boolean) => void;
    merkle: MerkleOutput | undefined;
}

export const Context = createContext<ClaimContextType>(
    {} as ClaimContextType
)

export const useClaim = (): ClaimContextType => {
    return useContext(Context)
}

export const ClaimProvider: FC<PropsWithChildren<any>> = ({children}) => {
    const [amount, setAmount] = useState(0)
    const [claimed, setClaimed] = useState(false)
    const [merkle, setMerkle] = useState<MerkleOutput>()

    useEffect(() => {
        (async () => {
            const m = await loadMerkleFromUrl()
            setMerkle(m)
        })()
    }, [])

    return (
        <Context.Provider
            value={{
                merkle,
                amount,
                setAmount,
                claimed,
                setClaimed
            }}
        >
            {children}
        </Context.Provider>
    )
}
