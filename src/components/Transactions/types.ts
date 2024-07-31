import { FunctionComponent } from "react"
import { Transaction } from "../../utils/types"

export type ToggleTransactionFunction = (transactionId: string) => void

export type SetTransactionApprovalFunction = (params: {
  transactionId: string
  newValue: boolean
}) => Promise<void>

type TransactionsProps = {
  transactions: Transaction[] | null
  toggleTransaction: ToggleTransactionFunction
}

type TransactionPaneProps = {
  transaction: Transaction
  loading: boolean
  approved?: boolean
  setTransactionApproval: SetTransactionApprovalFunction
  toggleTransaction: ToggleTransactionFunction
}

export type TransactionsComponent = FunctionComponent<TransactionsProps>
export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>
