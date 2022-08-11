.. _ep-openapi-content-overview:

Overview
========

Install Peer Dependencies
+++++++++++++++++++++++++

* ensure you install the peer dependencies

  * ep-openapi-node

Initialize the OpenAPI
++++++++++++++++++++++


Using helper `EpSdkClient`:

.. code-block:: typescript

  import { OpenAPI } from "@solace-labs/ep-openapi-node";

  EpSdkClient.initialize({
    globalOpenAPI: OpenAPI,
    token: {the token}
  });

Using `OpenAPI` directly:

.. code-block:: typescript

  import { OpenAPI } from "@solace-labs/ep-openapi-node";

  OpenAPI.BASE = baseUrl; // to set it to other than default as in the spec, otherwise leave as is
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = "include";
  OpenAPI.TOKEN = token;
