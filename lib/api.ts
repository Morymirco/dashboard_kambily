// import { getAuthToken, refreshAuthToken } from "./supabase-auth"

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Fetch with authentication
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // Get the auth token
  // let token = getAuthToken()

  // Prepare headers with authentication
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  // Make the request
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // If unauthorized, try to refresh the token and retry
  if (response.status === 401) {
    // Refresh the token
    // token = await refreshAuthToken()

    if (token) {
      // Retry the request with the new token
      headers.Authorization = `Bearer ${token}`
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })
    }
  }

  return response
}

// GET request with authentication
export const getWithAuth = async (endpoint: string) => {
  const response = await fetchWithAuth(endpoint)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// POST request with authentication
export const postWithAuth = async (endpoint: string, data: any) => {
  const response = await fetchWithAuth(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// PUT request with authentication
export const putWithAuth = async (endpoint: string, data: any) => {
  const response = await fetchWithAuth(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// DELETE request with authentication
export const deleteWithAuth = async (endpoint: string) => {
  const response = await fetchWithAuth(endpoint, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

