#!/bin/sh
set -e

RUNTIME_CONFIG_TEMPLATE="/usr/share/nginx/html/runtime-config.template.js"
RUNTIME_CONFIG_OUTPUT="/usr/share/nginx/html/runtime-config.js"

: "${USER_SERVICE_URL:=/user-api}"
: "${STORE_SERVICE_URL:=/store-api}"
: "${PRODUCT_SERVICE_URL:=/product-api}"
: "${GodaamPe_CONFIG_SERVICE_URL:=/config-api}"
: "${COMPANY_SERVICE_URL:=/company-api}"
: "${CUSTOMER_SERVICE_URL:=/customer-api}"
: "${ORDER_SERVICE_URL:=/order-api}"

if [ -f "$RUNTIME_CONFIG_TEMPLATE" ]; then
  envsubst '${USER_SERVICE_URL} ${STORE_SERVICE_URL} ${PRODUCT_SERVICE_URL} ${GodaamPe_CONFIG_SERVICE_URL} ${COMPANY_SERVICE_URL} ${CUSTOMER_SERVICE_URL} ${ORDER_SERVICE_URL}' < "$RUNTIME_CONFIG_TEMPLATE" > "$RUNTIME_CONFIG_OUTPUT"
fi
