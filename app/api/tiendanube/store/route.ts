import { NextRequest, NextResponse } from 'next/server';

interface TiendanubeStoreResponse {
  id: number;
  business_id: string | null;
  name: {
    en: string;
    es: string;
    pt: string;
  };
  email: string;
  country: string;
  main_currency: string;
  plan_name: string;
  // ... otros campos que no necesitamos para esta respuesta
}

export async function GET(request: NextRequest) {
  console.log('🚀 [Tiendanube Store] Endpoint called');

  try {
    // Obtener el access token del header Authorization
    const authHeader = request.headers.get('authorization');
    console.log('🔍 [Tiendanube Store] Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [Tiendanube Store] Invalid auth header format');
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');
    console.log('🔑 [Tiendanube Store] Access token length:', accessToken.length);

    // Obtener el user_id del header (el frontend debe enviarlo)
    const userId = request.headers.get('x-tiendanube-user-id');
    console.log('👤 [Tiendanube Store] User ID from header:', userId);

    const userAgent = process.env.TIENDANUBE_USER_AGENT;

    console.log('⚙️ [Tiendanube Store] Environment variables:');
    console.log('   - TIENDANUBE_USER_AGENT:', userAgent ? 'Present' : 'Missing');

    if (!userId || !userAgent) {
      console.log('❌ [Tiendanube Store] Missing user ID or user agent');
      return NextResponse.json(
        { error: 'User ID or Tiendanube configuration missing' },
        { status: 500 }
      );
    }

    const tiendanubeUrl = `https://api.tiendanube.com/2025-03/${userId}/store`;
    console.log('🌐 [Tiendanube Store] Making request to:', tiendanubeUrl);

    const requestHeaders = {
      'Authentication': `bearer ${accessToken}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/json; charset=utf-8',
    };

    console.log('📤 [Tiendanube Store] Request headers:', {
      'Authentication': 'bearer ***',
      'User-Agent': userAgent,
      'Content-Type': 'application/json; charset=utf-8'
    });

    // Hacer la llamada a la API de Tiendanube
    const tiendanubeResponse = await fetch(tiendanubeUrl, {
      method: 'GET',
      headers: requestHeaders,
    });

    console.log('📥 [Tiendanube Store] Response status:', tiendanubeResponse.status);
    console.log('📥 [Tiendanube Store] Response headers:', Object.fromEntries(tiendanubeResponse.headers.entries()));

    if (!tiendanubeResponse.ok) {
      const responseText = await tiendanubeResponse.text();
      console.log('❌ [Tiendanube Store] Error response body:', responseText);

      // Si hay un error de autenticación (401) o autorización (403)
      if (tiendanubeResponse.status === 401 || tiendanubeResponse.status === 403) {
        console.log('🔐 [Tiendanube Store] Authentication/Authorization error');
        return NextResponse.json(
          {
            status: false,
            business_id: null,
            error: 'Invalid or expired access token'
          },
          { status: 200 } // Retornamos 200 para que el frontend pueda manejar el status
        );
      }

      // Para otros errores HTTP
      console.log('🌐 [Tiendanube Store] HTTP error from Tiendanube API');
      return NextResponse.json(
        {
          status: false,
          business_id: null,
          error: `Tiendanube API error: ${tiendanubeResponse.status}`
        },
        { status: 200 }
      );
    }

    // Parsear la respuesta exitosa
    const responseText = await tiendanubeResponse.text();
    console.log('✅ [Tiendanube Store] Success response body:', responseText);

    const storeData: TiendanubeStoreResponse = JSON.parse(responseText);
    console.log('📊 [Tiendanube Store] Parsed store data:', {
      id: storeData.id,
      business_id: storeData.business_id,
      name: storeData.name,
      email: storeData.email
    });

    // Retornar el status y business_id
    const response = {
      status: true,
      business_id: storeData.business_id,
      store_info: {
        id: storeData.id,
        name: storeData.name,
        email: storeData.email,
        country: storeData.country,
        main_currency: storeData.main_currency,
        plan_name: storeData.plan_name
      }
    };

    console.log('🎯 [Tiendanube Store] Returning success response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [Tiendanube Store] Unexpected error:', error);
    console.error('💥 [Tiendanube Store] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        status: false,
        business_id: null,
        error: 'Failed to connect to Tiendanube'
      },
      { status: 200 }
    );
  }
}
