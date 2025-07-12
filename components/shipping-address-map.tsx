"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Map, MapPin, Building, Truck, Navigation, Hash, Home, MapPinHouse } from "lucide-react"
import type { Order } from "@/components/orders-page-content"

const COUNTRY_NAMES: Record<string, string> = {
  AR: "Argentina",
  US: "United States",
  BR: "Brazil",
  MX: "Mexico",
  UY: "Uruguay",
  CL: "Chile",
  // Add more as needed
};

interface ShippingAddressMapProps {
  address: {
    street?: string
    number?: string
    floor?: string
    apartment?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    comments?: string
    [key: string]: any // allow extra fields
  }
}

interface MapComponentProps {
  address: string
}

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic<MapComponentProps>(() => import('@/components/map-component'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

export function ShippingAddressMap({ address }: ShippingAddressMapProps) {
  const [showMap, setShowMap] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [distance, setDistance] = useState<string | null>(null)
  const [calculatingDistance, setCalculatingDistance] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  const fullAddress = `${address.street}${address.number ? ' ' + address.number : ''}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`

  // Compose address lines with metadata for styling
  const addressLines: Array<{ text: string; hasValue: boolean; type: string }> = [];

  // 1. Street + Number
  const streetText = [
    address.street,
    address.number && address.number !== address.street ? address.number : null
  ].filter(Boolean).join(' ');
  if (streetText) {
    addressLines.push({
      text: streetText,
      hasValue: !!(address.street && address.street.trim()),
      type: 'street'
    });
  }

  // 2. Floor, Apartment
  const floorInfo = [];
  let hasFloorValue = false;
  if (address.floor && address.floor.trim()) {
    floorInfo.push(`Floor ${address.floor}`);
    hasFloorValue = true;
  } else {
    floorInfo.push("No floor specified");
  }
  if (address.apartment && address.apartment.trim()) {
    floorInfo.push(`Apt ${address.apartment}`);
    hasFloorValue = true;
  }
  if (floorInfo.length > 0) {
    addressLines.push({
      text: floorInfo.join(' '),
      hasValue: hasFloorValue,
      type: 'floor'
    });
  }

  // 3. Neighborhood
  if (address.neighborhood && address.neighborhood.trim()) {
    addressLines.push({
      text: address.neighborhood,
      hasValue: true,
      type: 'neighborhood'
    });
  }

  // 4. City, State, Zip
  const locationParts = [address.city, address.state, address.zipCode].filter(Boolean);
  if (locationParts.length > 0) {
    addressLines.push({
      text: locationParts.join(', '),
      hasValue: true,
      type: 'location'
    });
  }

  // 5. Country (map code to name)
  if (address.country) {
    const countryDisplay = COUNTRY_NAMES[address.country] || address.country;
    addressLines.push({
      text: countryDisplay,
      hasValue: true,
      type: 'country'
    });
  }

  // 6. Comments
  if (address.comments && address.comments.trim()) {
    addressLines.push({
      text: address.comments,
      hasValue: true,
      type: 'comments'
    });
  }

  // Filter out completely empty lines but keep "No floor specified"
  const filteredLines = addressLines.filter(
    (line) => line.text && line.text.trim() &&
    line.text.trim().toUpperCase() !== 'AR' &&
    line.text.trim().toUpperCase() !== 'N/A'
  )

  const calculateDistance = async () => {
    setCalculatingDistance(true)
    setDistance(null)

    try {
      // Get user's current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      const userLat = position.coords.latitude
      const userLng = position.coords.longitude

      // Geocode the shipping address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const addressLat = parseFloat(data[0].lat)
        const addressLng = parseFloat(data[0].lon)

        // Calculate distance using Haversine formula
        const distanceKm = calculateHaversineDistance(
          userLat, userLng, addressLat, addressLng
        )

        setDistance(`${distanceKm.toFixed(1)} km`)
      } else {
        setDistance('Address not found')
      }
    } catch (error) {
      console.error('Error calculating distance:', error)
      setDistance('Unable to calculate distance')
    } finally {
      setCalculatingDistance(false)
    }
  }

  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  if (!mounted) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{address.street}{address.number ? ' ' + address.number : ''}</span>
          </div>
          {(address.floor || address.apartment) && (
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className={(!address.floor || !address.floor.trim()) ? "text-muted-foreground italic" : ""}>
                {address.floor && address.floor.trim() ? `Floor ${address.floor}` : "No floor specified"}
                {address.apartment && address.apartment.trim() ? ` Apt ${address.apartment}` : ''}
              </span>
            </div>
          )}
                    {address.neighborhood && (
            <div className="flex items-center gap-2">
              <MapPinHouse className="h-4 w-4 text-muted-foreground" />
              <span>{address.neighborhood}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{address.city}, {address.state} {address.zipCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span>{address.country ? (COUNTRY_NAMES[address.country] || address.country) : "Country not available"}</span>
          </div>
        </div>

        <div className="flex items-center justify-center h-64 rounded-lg bg-muted/30">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
        {filteredLines.map((line, idx) => {
          // Determine icon based on line type
          let icon = <MapPin className="h-4 w-4 text-muted-foreground" />; // default icon

          switch (line.type) {
            case 'street':
              icon = <Building className="h-4 w-4 text-muted-foreground" />;
              break;
            case 'floor':
              icon = <Hash className="h-4 w-4 text-muted-foreground" />;
              break;
            case 'neighborhood':
              icon = <MapPinHouse className="h-4 w-4 text-muted-foreground" />;
              break;
            case 'location':
              icon = <MapPin className="h-4 w-4 text-muted-foreground" />;
              break;
            case 'country':
              icon = <Truck className="h-4 w-4 text-muted-foreground" />;
              break;
            case 'comments':
              icon = <Home className="h-4 w-4 text-muted-foreground" />;
              break;
          }

          return (
            <div key={idx} className="flex items-center gap-2">
              {icon}
              <span className={line.hasValue ? "" : "text-muted-foreground italic"}>
                {line.text}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {showMap && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border">
            <MapComponent address={fullAddress} />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={calculateDistance}
            disabled={calculatingDistance}
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            {calculatingDistance ? 'Calculating...' : 'Calculate Distance'}
          </Button>

          {distance && (
            <span className="text-sm text-muted-foreground ml-2">
              Distance: {distance}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
