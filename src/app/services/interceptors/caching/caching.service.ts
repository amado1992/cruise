import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CachingService {

  private cacheRegistry: Map<string, any>;
  private cacheableResources: string[];

  constructor() {
    this.initializeCacheService();
  }

  private initializeCacheService(): void {
    this.cacheRegistry = new Map<string, any>();
    this.cacheableResources = [];
    this.registerURIs(environment.cacheableResources);
  }

  private registerURI(resourceURI): void {
    this.cacheableResources.push(resourceURI);
  }

  private registerURIs(resourceURIs: string[]): void {
    resourceURIs.forEach(resourceURI => this.registerURI(resourceURI));
  }

  public getCachedData(resourceURI: string): any {
    if (!this.cacheRegistry.has(resourceURI)) {
      return null;
    }

    return this.cacheRegistry.get(resourceURI);
  }

  public canBeCached(resourceURI: string): boolean {
    return this.cacheableResources.some( value => value === resourceURI);
  }

  public cache(resourceURI: string, data: any): void {
    this.cacheRegistry.set(resourceURI, data);
  }

  public clearCache(): void {
    this.cacheRegistry.clear();
  }

  public clearAllCachedData(): void {
    const keys = Array.from(this.cacheRegistry.keys());
    keys.forEach(key => this.cacheRegistry.set(key, null));
  }

  public clearCachedData(resourceURI: string): void {
    if (!this.cacheRegistry.has(resourceURI)) {
      throw new Error(`Resource ${resourceURI} can not be found`);
    }
    this.cacheRegistry.set(resourceURI, null);
  }
}
