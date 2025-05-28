// app/services/fetch.js
import Service from '@ember/service';
import config from 'fast-tag/config/environment';

export default class FetchService extends Service {
  get baseUrl() {
    const apiHost = config.APP.apiHost;
    const tomcatContextPath = config.APP.tomcatContextPath;
    const servletMapping = config.APP.servletMapping;

    // Build parts: host, then context path (if not empty), then servlet mapping (if not empty)
    const parts = [];
    if (apiHost) {
        // Add apiHost without trailing slash if it exists
        parts.push(apiHost.endsWith('/') ? apiHost.slice(0, -1) : apiHost);
    }
    // Only add tomcatContextPath if it's explicitly not empty
    if (tomcatContextPath) {
        parts.push(tomcatContextPath);
    }
    // Only add servletMapping if it's explicitly not empty
    if (servletMapping) {
        parts.push(servletMapping);
    }

    // Join all non-empty parts with a slash
    let base = parts.join('/');

    // Ensure the final base URL starts with http:// or https:// if apiHost was provided
    if (apiHost && !base.startsWith('http://') && !base.startsWith('https://')) {
        // This handles cases where apiHost might have been filtered out if empty initially,
        // but ensures the URL is absolute.
        base = `${apiHost}/${base}`;
    }

    // Ensure the base URL ends with a single slash for consistent path concatenation
    return base.endsWith('/') ? base : `${base}/`;
  }

  async get(endpoint, options = {}) {
    // Remove leading slash from endpoint if present, as baseUrl already handles it.
    const cleanedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    let fullUrl;
    if (cleanedEndpoint.startsWith('?')) {
        // If it's a query string, append directly to the base (without its trailing slash)
        fullUrl = `${this.baseUrl.slice(0, -1)}${cleanedEndpoint}`;
    } else {
        // For path segments, append to baseUrl (which has trailing slash)
        fullUrl = `${this.baseUrl}${cleanedEndpoint}`;
    }

    console.log(`DEBUG: FetchService GET URL: ${fullUrl}`); // <<-- VERIFY THIS IN CONSOLE!

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return response;
    } catch (error) {
      console.error(`WorkspaceService GET Error for ${fullUrl}:`, error);
      throw error;
    }
  }

  async post(endpoint, body, options = {}) {
    const cleanedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const fullUrl = `${this.baseUrl}${cleanedEndpoint}`;

    console.log(`DEBUG: FetchService POST URL: ${fullUrl}`);

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        body: JSON.stringify(body),
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return response;
    } catch (error) {
      console.error(`WorkspaceService POST Error for ${fullUrl}:`, error);
      throw error;
    }
  }
}