"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapComponentProps {
  address: string
}

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcon = () => {
  if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as typeof L.Icon.Default.prototype & { _getIconUrl?: () => string })._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  }
}

// Cache for geocoding results to avoid repeated requests
const geocodeCache = new Map<string, [number, number]>()

// Geocoding function moved outside component
const geocodeAddress = async (address: string): Promise<[number, number]> => {
  // Validate address input
  if (!address || address.trim() === '' || address === 'Default Location') {
    console.warn('Invalid or empty address provided:', address)
    return [40.7128, -74.0060] // Default to New York City
  }

  const trimmedAddress = address.trim()

  // Check cache first
  if (geocodeCache.has(trimmedAddress)) {
    console.log('Using cached geocoding result for:', trimmedAddress)
    return geocodeCache.get(trimmedAddress)!
  }

  try {
    console.log('Geocoding address:', trimmedAddress)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmedAddress)}&limit=1`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat)
      const lon = parseFloat(data[0].lon)

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid coordinates returned from geocoding service')
      }

      console.log('Geocoding successful:', { address: trimmedAddress, lat, lon })
      const result: [number, number] = [lat, lon]

      // Cache the result
      geocodeCache.set(trimmedAddress, result)

      return result
    } else {
      console.warn('No coordinates found for address:', trimmedAddress)
      // Return a default location instead of throwing an error
      return [40.7128, -74.0060]
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    // Return a default location if geocoding fails
    return [40.7128, -74.0060]
  }
}

export default function MapComponent({ address }: MapComponentProps) {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)

  // Fix Leaflet icons on mount
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  // Geocode the address when component mounts
  useEffect(() => {
    geocodeAddress(address)
      .then((coords) => {
        setCoordinates(coords)
      })
      .catch((error) => {
        console.error('Geocoding failed:', error)
        // Fallback to a default location (New York City)
        setCoordinates([40.7128, -74.0060])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [address])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  if (!coordinates) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <p className="text-sm text-muted-foreground">Unable to load map</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={coordinates}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coordinates}>
        <Popup>
          <div className="text-sm">
            <strong>Shipping Address</strong><br />
            {address}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}
