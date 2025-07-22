'use strict';
import axios from 'axios';
import pdf from 'pdf-parse';

export default async function (fastify, _opts) {
  /**
   *
   * @param request
   * @param reply
   * @returns {Promise<void>}
   */
  fastify.get('/parseattachment2', async function (request, _reply) {
    const { context, logger } = request.sdk;
    const { org } = context;
    logger.info(`sfContext: ${JSON.stringify(context)}`);
    logger.info(`access token is ${context.accessToken}`);
    const versionDataUrl = `/services/data/v${org.apiVersion}/sobjects/ContentVersion/${request.query.content_version_id}/VersionData`;
    const finalUrl = org.domainUrl + versionDataUrl;
    const result = await fetchPdfData(finalUrl, context.accessToken);
    return {
      data: result,
    };
  });

  const fetchPdfData = async (orgBaseUrl, accessToken) => {
    try {
      // Fetch the ArrayBuffer using axios
      const response = await axios.get(orgBaseUrl, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const arrayBuffer = response.data;

      // Process the ArrayBuffer using pdf.js
      const data = await pdf(arrayBuffer);
      return data.text;
    } catch (error) {
      console.error(error); // Handle any errors that occur
    }
  };

  fastify.setErrorHandler(function (error, request, reply) {
    request.log.error(error);
    reply.status(500).send({ code: '500', message: error.message });
  });
}
