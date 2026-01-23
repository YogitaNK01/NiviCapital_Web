import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

  // Cache configuration: URLs that should be cached and their TTL
  private readonly CACHE_CONFIG: { [key: string]: number } = {
    '/admin/users': 10 * 60 * 1000, // 10 minutes
    '/admin/dashboard': 5 * 60 * 1000, // 5 minutes
    '/v1/profile': 15 * 60 * 1000, // 15 minutes
  };

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone request with credentials for cookie-based token
    request = request.clone({
      withCredentials: true
    });

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    // Check if this URL should be cached
    const shouldCache = this.shouldCacheUrl(request.url);
    if (!shouldCache) {
      return next.handle(request);
    }

    // Check if we have a valid cached response
    const cachedResponse = this.getCachedResponse(request.url);
    if (cachedResponse) {
      console.log(`[Cache HIT] ${request.url}`);
      return of(cachedResponse.clone());
    }

    console.log(`[Cache MISS] ${request.url}`);

    // Make the actual request and cache the response
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const ttl = this.getTTLForUrl(request.url);
          this.cache.set(request.url, {
            response: event.clone(),
            timestamp: Date.now(),
            ttl: ttl,
          });
        }
      })
    );
  }

  private shouldCacheUrl(url: string): boolean {
    return Object.keys(this.CACHE_CONFIG).some((cacheUrl) =>
      url.includes(cacheUrl)
    );
  }

  private getCachedResponse(url: string): HttpResponse<any> | null {
    const cacheEntry = this.cache.get(url);

    if (!cacheEntry) {
      return null;
    }

    const isExpired = Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
    if (isExpired) {
      this.cache.delete(url);
      return null;
    }

    return cacheEntry.response;
  }

  private getTTLForUrl(url: string): number {
    for (const [cacheUrl, ttl] of Object.entries(this.CACHE_CONFIG)) {
      if (url.includes(cacheUrl)) {
        return ttl;
      }
    }
    return this.DEFAULT_TTL;
  }

  // Public method to clear cache
  public clearCache(): void {
    this.cache.clear();
  }

  // Public method to clear specific URL from cache
  public clearCacheForUrl(url: string): void {
    this.cache.delete(url);
  }
}
