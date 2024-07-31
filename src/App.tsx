import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, loading: employeesLoading, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, loading: transactionsLoading, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [isFilteredByEmployee, setIsFilteredByEmployee] = useState(false) // Bug 6 - Fix
  const [toggledTransactions, setToggledTransactions] = useState<Set<string>>(new Set()) // Bug 7 - Fix
  

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    await paginatedTransactionsUtils.fetchAll()

    setIsLoading(false)
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback( //Bug 3 - Fix
    async (employeeId: string) => {
      if (employeeId === "") {
        setIsFilteredByEmployee(false) // Bug 6 - Fix
        await loadAllTransactions()
        return
      }
      setIsFilteredByEmployee(true) // Bug 6 - Fix
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils, loadAllTransactions]
  )

  const toggleTransaction = (transactionId: string) => { // Bug 7 - Fix
    setToggledTransactions(prev => {
      const newToggled = new Set(prev)
      if (newToggled.has(transactionId)) {
        newToggled.delete(transactionId)
      } else {
        newToggled.add(transactionId)
      }
      return newToggled
    })
  }

  useEffect(() => {
    if (employees === null && !employeesLoading) {
      loadAllTransactions()
    }
  }, [employeesLoading, employees, loadAllTransactions])

  const updatedTransactions = useMemo(() => {
    if (transactions) {
      return transactions.map(transaction => ({
        ...transaction,
        toggled: toggledTransactions.has(transaction.id) // Apply toggled state
      }))
    }
    return null
  }, [transactions, toggledTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={employeesLoading} // Bug 5 -Fix
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }

            await loadTransactionsByEmployee(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
        <Transactions transactions={updatedTransactions} toggleTransaction={toggleTransaction} /> {/* Bug 7 - Fix */}

          {transactions !== null && !isFilteredByEmployee  && ( // Bug 6 - Fix
            <button
              className="RampButton"
              disabled={transactionsLoading} // Bug 5 - Fix
              onClick={async () => {
                await paginatedTransactionsUtils.fetchAll()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
