#!/bin/sh
# This script allows runtime environment variables in the frontend

# Replace environment variables in the built files
# This is useful for API URLs that might change between environments
if [ -n "$VITE_API_URL" ]; then
  find /usr/share/nginx/html -name '*.js' -exec sed -i "s|VITE_API_URL_PLACEHOLDER|$VITE_API_URL|g" {} \;
fi

# Start nginx
exec "$@"