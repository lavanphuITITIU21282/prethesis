export function createGeminiGateway({ fetchImpl = fetch } = {}) {
  return {
    generate({ model, apiKey, payload, signal }) {
      // Provider URL, credentials and transport details belong exclusively to this DAO.
      return fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(payload),
          signal,
          redirect: 'error',
        },
      );
    },
  };
}
