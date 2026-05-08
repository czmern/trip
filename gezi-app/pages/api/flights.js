// pages/api/flights.js
// Canlı uçuş fiyatları - Amadeus API (Ücretsiz sandbox)

let amadeusToken = null;
let tokenExpiry = 0;

async function getAmadeusToken() {
  if (amadeusToken && Date.now() < tokenExpiry) return amadeusToken;

  const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_API_KEY,
      client_secret: process.env.AMADEUS_API_SECRET,
    }),
  });

  if (!res.ok) throw new Error('Amadeus token alınamadı');
  const data = await res.json();
  amadeusToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return amadeusToken;
}

export default async function handler(req, res) {
  const { origin, destination, departureDate, returnDate, adults = 1, currencyCode = 'EUR' } = req.query;

  if (!origin || !destination || !departureDate) {
    return res.status(400).json({ error: 'origin, destination ve departureDate zorunludur.' });
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'AMADEUS_API_KEY veya AMADEUS_API_SECRET eksik.' });
  }

  try {
    const token = await getAmadeusToken();

    const params = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      currencyCode,
      max: 10,
    });
    if (returnDate) params.set('returnDate', returnDate);

    const flightRes = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!flightRes.ok) {
      const err = await flightRes.json();
      throw new Error(err.errors?.[0]?.detail || 'Amadeus uçuş sorgu hatası');
    }

    const flightData = await flightRes.json();

    // Veriyi sadeleştir
    const offers = (flightData.data || []).slice(0, 8).map(offer => {
      const itinerary = offer.itineraries[0];
      const segments = itinerary.segments;
      const firstSeg = segments[0];
      const lastSeg = segments[segments.length - 1];

      return {
        id: offer.id,
        price: {
          total: offer.price.total,
          currency: offer.price.currency,
          per_traveler: offer.travelerPricings?.[0]?.price?.total,
        },
        airline: firstSeg.carrierCode,
        airline_name: getAirlineName(firstSeg.carrierCode),
        departure: {
          airport: firstSeg.departure.iataCode,
          time: firstSeg.departure.at,
        },
        arrival: {
          airport: lastSeg.arrival.iataCode,
          time: lastSeg.arrival.at,
        },
        duration: itinerary.duration,
        stops: segments.length - 1,
        stop_airports: segments.slice(0, -1).map(s => s.arrival.iataCode),
        cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
        seats_left: offer.numberOfBookableSeats,
        validating_airline: offer.validatingAirlineCodes?.[0],
      };
    });

    // Fiyat bazlı sıralama
    offers.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

    return res.status(200).json({
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate || null,
      currency: currencyCode,
      total_found: flightData.meta?.count || offers.length,
      offers,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function getAirlineName(code) {
  const airlines = {
    TK: 'Turkish Airlines', EK: 'Emirates', QR: 'Qatar Airways',
    SQ: 'Singapore Airlines', KL: 'KLM', LH: 'Lufthansa',
    BA: 'British Airways', AF: 'Air France', EY: 'Etihad',
    MH: 'Malaysia Airlines', GA: 'Garuda Indonesia', PC: 'Pegasus',
  };
  return airlines[code] || code;
}
