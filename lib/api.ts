const ARTICLE_GRAPHQL_FIELDS = `
  sys {
    id
  }
  title
  slug
  summary
  details {
    json
    links {
      assets {
        block {
          sys {
            id
          }
          url
          description
        }
      }
    }
  }
  date
  authorName
  categoryName
  articleImage {
    url
  }
`;

async function fetchGraphQL(query: string, preview = false): Promise<any> {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
      next: { tags: ["articles"] },
    }
  ).then((response) => response.json());
}

function extractArticleEntries(fetchResponse: any): any[] {
  return fetchResponse?.data?.knowledgeArticleCollection?.items;
}

export async function getAllArticles(
  limit: Number = 3,
  isDraftMode: boolean = false
): Promise<any[]> {
  const articles = await fetchGraphQL(
    `query {
        knowledgeArticleCollection(where:{slug_exists: true}, order: date_DESC, limit: ${limit}, preview: ${
      isDraftMode ? "true" : "false"
    }) {
          items {
            ${ARTICLE_GRAPHQL_FIELDS}
          }
        }
      }`,
    isDraftMode
  );
  return extractArticleEntries(articles);
}

export async function getArticle(
  slug: string,
  isDraftMode: boolean = false
): Promise<any> {
  const article = await fetchGraphQL(
    `query {
        knowledgeArticleCollection(where:{slug: "${slug}"}, limit: 1, preview: ${
      isDraftMode ? "true" : "false"
    }) {
          items {
            ${ARTICLE_GRAPHQL_FIELDS}
          }
        }
      }`,
    isDraftMode
  );
  return extractArticleEntries(article)[0];
}
