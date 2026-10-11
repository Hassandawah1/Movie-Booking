import { useState, useEffect, useCallback, useRef } from "react"

/**
 * useAdminData — fetch one admin endpoint with independent loading/error state.
 *
 * The dashboard is composed of several independent sections. Giving each its own
 * hook instance means a failing endpoint (e.g. the revenue trend) degrades only
 * that section instead of blanking the whole dashboard.
 *
 * Passing a `refreshKey` (any value that changes) re-runs the request, which
 * lets the dashboard trigger a refresh of every section declaratively.
 *
 * @param fetcher     function returning the promise (from admin.service)
 * @param args        array of arguments for the fetcher; changing it refetches
 * @param refreshKey  changing this value forces a refetch
 */
const useAdminData = (fetcher, args = [], refreshKey = 0) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Serialised so callers don't have to memoise the args array.
  const argsKey = JSON.stringify(args)

  // Latest fetcher/args, read when a request starts rather than during render.
  const fetcherRef = useRef(fetcher)
  const argsRef = useRef(args)

  useEffect(() => {
    fetcherRef.current = fetcher
    argsRef.current = args
  })

  // Guards against out-of-order responses when args change quickly
  // (e.g. switching the revenue-trend period or the top-movies sort).
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

  // Refetch when the arguments or the refresh key change.
  useEffect(() => {
    load()
  }, [argsKey, refreshKey, load])

  return { data, loading, error, refetch: load }
}

export default useAdminData
