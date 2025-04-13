// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] ||
      new Promise((resolve) => {
        if ("document" in self) {
          const script = document.createElement("script");
          script.src = uri;
          script.onload = resolve;
          document.head.appendChild(script);
        } else {
          nextDefineUri = uri;
          importScripts(uri);
          resolve();
        }
      }).then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      });
  };

  self.define = (depsNames, factory) => {
    const uri =
      nextDefineUri || ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (registry[uri]) {
      return;
    }
    let exports = {};
    const require = (depUri) => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require,
    };
    registry[uri] = Promise.all(
      depsNames.map((depName) => specialDeps[depName] || require(depName))
    ).then((deps) => {
      factory(...deps);
      return exports;
    });
  };
}

define(["./workbox-e43f5367"], function (workbox) {
  "use strict";

  importScripts();
  self.skipWaiting();
  workbox.clientsClaim();

  // Cache static assets with CacheFirst strategy
  workbox.registerRoute(
    /\.(?:js|css|html|svg|png|jpg|jpeg|webp|gif|woff2?|eot|ttf|otf)$/,
    new workbox.CacheFirst({
      cacheName: "static-assets",
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 100, // Limit the number of assets
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
    "GET"
  );

  // Cache API calls with NetworkFirst strategy
  workbox.registerRoute(
    new RegExp("/api/.*"),
    new workbox.NetworkFirst({
      cacheName: "api-cache",
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 50, // Limit the number of API responses
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    }),
    "GET"
  );

  // Cache the homepage with NetworkFirst strategy
  workbox.registerRoute(
    "/",
    new workbox.NetworkFirst({
      cacheName: "homepage",
      plugins: [
        new workbox.ExpirationPlugin({
          maxAgeSeconds: 1 * 24 * 60 * 60, // 1 day
        }),
      ],
    }),
    "GET"
  );
});