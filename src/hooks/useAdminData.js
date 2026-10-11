import { useState, useEffect, useCallback, useRef } from "react"


const useAdminData = (fetcher, args = [], refreshKey = 0) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  
  const argsKey = JSON.stringify(args)

  
  const fetcherRef = useRef(fetcher)
  const argsRef = useRef(args)

  useEffect(() => {
    fetcherRef.current = fetcher
    argsRef.current = args
  })

  
  
  const requestIdRef = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError("")

    try {
      const result = await fetcherRef.current(...argsRef.current)
      if (requestId !== requestIdRef.current) return
      setData(result)
    } catch (err) {
      if (requestId !== requestIdRef.current) return

      const status = err.response?.status
      let message

      if (status === 401) {
        message = "Your session has expired. Please sign in again."
      } else if (status === 403) {
        message = "You don't have admin access to this data."
      } else if (status === 404) {
        message = "This analytics endpoint is unavailable."
      } else if (!err.response) {
        message = "We couldn't reach the server. Check your connection and try again."
      } else {
        message = err.response?.data?.message || "This section could not be loaded."
      }

      setError(message)
      setData(null)
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  
  useEffect(() => {
    load()
  }, [argsKey, refreshKey, load])

  return { data, loading, error, refetch: load }
}

export default useAdminData
