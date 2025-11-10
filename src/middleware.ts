import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/app/lib/session';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const SECURITY_CONFIG = {
  routes: {
    '/api/generate-feedback': {
      requireAuth: true,
      rateLimit: { requests: 40, window: 300000 },
      allowedMethods: ['POST'],
    },
    '/api/survey': {
      requireAuth: true,
      rateLimit: { requests: 40, window: 300000 },
      allowedMethods: ['POST'],
    },
    '/api/line/message': {
      requireAuth: true,
      rateLimit: { requests: 40, window: 300000 },
      allowedMethods: ['POST'],
    },
    '/api/line/login': {
      requireAuth: false,
      rateLimit: { requests: 50, window: 300000 },
      allowedMethods: ['POST'],
    },
    '/api/line/callback': {
      requireAuth: false,
      rateLimit: { requests: 50, window: 300000 },
      allowedMethods: ['GET', 'POST'],
    },
    '/api/auth': {
      requireAuth: false,
      rateLimit: { requests: 15, window: 900000 },
      allowedMethods: ['POST', 'GET'],
    },
  },
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  },
  csp: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.anthropic.com https://api.line.me https://access.line.me;",
};

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  return 'unknown';
}

function checkRateLimit(ip: string, routeConfig: any): boolean {
  if (!routeConfig.rateLimit) return true;
  
  const key = `${ip}_${Date.now() - (Date.now() % routeConfig.rateLimit.window)}`;
  const now = Date.now();
  
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((data, mapKey) => {
    if (data.resetTime < now) {
      keysToDelete.push(mapKey);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
  
  const currentData = rateLimitStore.get(key);
  if (!currentData) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + routeConfig.rateLimit.window,
    });
    return true;
  }
  
  if (currentData.count >= routeConfig.rateLimit.requests) {
    return false;
  }
  
  currentData.count++;
  return true;
}

async function verifyAuth(request: NextRequest): Promise<boolean> {
  try {
    if (!process.env.SECRET_COOKIE_PASSWORD) {
      console.error('SECRET_COOKIE_PASSWORD is not configured');
      return false;
    }
    
    const response = new NextResponse();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    
    return !!(session.user && session.user.userId);
  } catch (error) {
    console.error('Authentication failed');
    return false;
  }
}

async function validateRequestBody(request: NextRequest, pathname: string): Promise<boolean> {
  try {
    if (request.method !== 'POST') return true;
    
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return false;
    }
    
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return false;
    }
    
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();
    
    switch (pathname) {
      case '/api/generate-feedback':
        return validateFeedbackBody(body);
      case '/api/survey':
        return validateSurveyBody(body);
      case '/api/line/message':
        return validateLineMessageBody(body);
      default:
        return true;
    }
  } catch (error) {
    console.error('Request validation failed');
    return false;
  }
}

function validateFeedbackBody(body: any): boolean {
  const required = ['rating', 'photoType'];
  const hasRequired = required.every(field => body[field] !== undefined);
  
  const validRating = typeof body.rating === 'number' && body.rating >= 1 && body.rating <= 5;
  const validPhotoType = typeof body.photoType === 'string' && body.photoType.length <= 100;
  
  return hasRequired && validRating && validPhotoType;
}

function validateSurveyBody(body: any): boolean {
  const required = ['photoType', 'rating', 'store', 'name', 'phone', 'visitDate', 'store_id'];
  const hasRequired = required.every(field => body[field] !== undefined && body[field] !== null && body[field] !== '');
  
  if (!hasRequired) {
    console.warn('Missing required fields in survey data:', {
      provided: Object.keys(body),
      required: required,
      missing: required.filter(field => !body[field])
    });
    return false;
  }
  
  const validPhotoType = typeof body.photoType === 'string' && body.photoType.length <= 100;
  const validRating = typeof body.rating === 'number' && body.rating >= 1 && body.rating <= 5;
  const validStore = typeof body.store === 'string' && body.store.length <= 100;
  const validName = typeof body.name === 'string' && body.name.length <= 100;
  const validPhone = typeof body.phone === 'string' && body.phone.length <= 50;
  const validVisitDate = typeof body.visitDate === 'string' && body.visitDate.length <= 20;
  const validStoreId = typeof body.store_id === 'string' && body.store_id.length <= 50;
  
  const validHowFound = !body.howFound || (Array.isArray(body.howFound) && body.howFound.length <= 10);
  const validImportantFactors = !body.importantFactors || (Array.isArray(body.importantFactors) && body.importantFactors.length <= 10);
  
  const validFeedback = !body.feedback || (typeof body.feedback === 'string' && body.feedback.length <= 1000);
  const validPhotoSatisfaction = !body.photoSatisfaction || (typeof body.photoSatisfaction === 'string' && body.photoSatisfaction.length <= 100);
  const validOtherStaffResponse = !body.otherStaffResponse || (typeof body.otherStaffResponse === 'string' && body.otherStaffResponse.length <= 100);
  const validLineDisplayName = !body.line_display_name || (typeof body.line_display_name === 'string' && body.line_display_name.length <= 100);
  
  const isValid = validPhotoType && validRating && validStore && validName && validPhone && 
                  validVisitDate && validStoreId && validHowFound && validImportantFactors && 
                  validFeedback && validPhotoSatisfaction && validOtherStaffResponse && validLineDisplayName;
  
  if (!isValid) {
    console.warn('Survey data validation failed:', {
      validPhotoType, validRating, validStore, validName, validPhone,
      validVisitDate, validStoreId, validHowFound, validImportantFactors,
      validFeedback, validPhotoSatisfaction, validOtherStaffResponse, validLineDisplayName
    });
  }
  
  return isValid;
}

function validateLineMessageBody(body: any): boolean {
  const required = ['userId', 'surveyData'];
  const hasRequired = required.every(field => body[field] !== undefined);
  
  const validUserId = typeof body.userId === 'string' && body.userId.length <= 100;
  const validSurveyData = typeof body.surveyData === 'object' && body.surveyData !== null;
  
  return hasRequired && validUserId && validSurveyData;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', SECURITY_CONFIG.csp);
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  return response;
}

function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  const { allowedOrigins, allowedMethods, allowedHeaders } = SECURITY_CONFIG.cors;
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const clientIP = getClientIP(request);
  
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(addSecurityHeaders(response), origin);
  }
  
  if (pathname.startsWith('/api/')) {
    try {
      let routeConfig: any = null;
      const routeKeys = Object.keys(SECURITY_CONFIG.routes);
      for (const route of routeKeys) {
        if (pathname.startsWith(route)) {
          routeConfig = (SECURITY_CONFIG.routes as any)[route];
          break;
        }
      }
      
      if (!routeConfig) {
        console.warn(`Unauthorized API access attempt: ${pathname} from ${clientIP}`);
        const response = NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
        return addSecurityHeaders(response);
      }
      
      if (!routeConfig.allowedMethods.includes(request.method)) {
        const response = NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        );
        return addCorsHeaders(addSecurityHeaders(response), origin);
      }
      
      if (!checkRateLimit(clientIP, routeConfig)) {
        console.warn(`Rate limit exceeded for ${pathname} from ${clientIP}`);
        const response = NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
        return addCorsHeaders(addSecurityHeaders(response), origin);
      }
      
      if (routeConfig.requireAuth) {
        const isAuthenticated = await verifyAuth(request);
        if (!isAuthenticated) {
          console.warn(`Unauthorized access attempt: ${pathname} from ${clientIP}`);
          const response = NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
          return addCorsHeaders(addSecurityHeaders(response), origin);
        }
      }
      
      const isValidBody = await validateRequestBody(request, pathname);
      if (!isValidBody) {
        console.warn(`Invalid request body for ${pathname} from ${clientIP}`);
        const response = NextResponse.json(
          { error: 'Invalid request data' },
          { status: 400 }
        );
        return addCorsHeaders(addSecurityHeaders(response), origin);
      }
      
      console.log(`Secure API access: ${request.method} ${pathname} from ${clientIP}`);
      
    } catch (error) {
      console.error('Middleware security check failed');
      const response = NextResponse.json(
        { error: 'Security check failed' },
        { status: 500 }
      );
      return addSecurityHeaders(response);
    }
  }
  
  const response = NextResponse.next();
  return addCorsHeaders(addSecurityHeaders(response), origin);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
