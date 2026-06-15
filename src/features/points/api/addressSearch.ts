export type AddressSuggestion = {
  label: string
  city?: string
  postcode?: string
  latitude: number
  longitude: number
}

type GeocodingFeature = {
  geometry?: {
    coordinates?: [number, number]
  }
  properties?: {
    label?: string
    city?: string
    postcode?: string
  }
}

type GeocodingResponse = {
  features?: GeocodingFeature[]
}

export async function searchAddresses(
  query: string
): Promise<AddressSuggestion[]> {
  const cleanQuery = query.trim()

  if (cleanQuery.length < 3) {
    return []
  }

  const url = new URL('https://data.geopf.fr/geocodage/search/')
  url.searchParams.set('q', cleanQuery)
  url.searchParams.set('limit', '6')

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('Impossible de rechercher les adresses.')
  }

  const data = (await response.json()) as GeocodingResponse

  return (
    data.features
      ?.map((feature) => {
        const coordinates = feature.geometry?.coordinates
        const properties = feature.properties

        if (!coordinates || !properties?.label) {
          return null
        }

        const [longitude, latitude] = coordinates

        return {
          label: properties.label,
          city: properties.city,
          postcode: properties.postcode,
          latitude,
          longitude,
        }
      })
      .filter(Boolean) as AddressSuggestion[]
  )
}