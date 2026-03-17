import postgres from "postgres";

type RequestLike = {
  method?: string;
  url?: string;
  body?: unknown;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string | string[]) => void;
};

let sqlClient: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (sqlClient) {
    return sqlClient;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  sqlClient = postgres(databaseUrl, {
    prepare: false,
    max: 1,
  });

  return sqlClient;
}

function sendJson(res: ResponseLike, status: number, body: unknown) {
  if (res.setHeader) {
    res.setHeader("Content-Type", "application/json");
  }
  res.status(status).json(body);
}

function parseUrl(req: RequestLike) {
  return new URL(req.url ?? "/", "https://cordia-ec.vercel.app");
}

function parsePagination(url: URL) {
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);

  return {
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    limit: Number.isNaN(limit) || limit < 1 ? 10 : limit,
  };
}

function normalizePath(pathname: string) {
  return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  try {
    const sql = getSql();
    const method = req.method ?? "GET";
    const url = parseUrl(req);
    const pathname = normalizePath(url.pathname);

    if (method === "GET" && pathname === "/api/news") {
      const { page, limit } = parsePagination(url);
      const offset = (page - 1) * limit;

      const articles = await sql`
        select
          id,
          title,
          content,
          excerpt,
          published_date as "publishedDate",
          image_url as "imageUrl"
        from news_articles
        order by published_date desc
        limit ${limit}
        offset ${offset}
      `;

      const totalResult = await sql`
        select count(*)::int as total
        from news_articles
      `;

      sendJson(res, 200, {
        articles,
        total: totalResult[0]?.total ?? 0,
      });
      return;
    }

    if (method === "GET" && pathname.startsWith("/api/news/")) {
      const id = pathname.replace("/api/news/", "");
      const articles = await sql`
        select
          id,
          title,
          content,
          excerpt,
          published_date as "publishedDate",
          image_url as "imageUrl"
        from news_articles
        where id = ${id}
        limit 1
      `;

      const article = articles[0];
      if (!article) {
        sendJson(res, 404, {
          success: false,
          message: "News article not found",
        });
        return;
      }

      sendJson(res, 200, { success: true, article });
      return;
    }

    if (method === "GET" && pathname === "/api/initiatives") {
      const initiatives = await sql`
        select
          id,
          slug,
          title,
          description,
          content,
          image_url as "imageUrl",
          category
        from initiatives
        order by title asc
      `;

      sendJson(res, 200, { success: true, initiatives });
      return;
    }

    if (method === "GET" && pathname.startsWith("/api/initiatives/")) {
      const slug = pathname.replace("/api/initiatives/", "");
      const initiatives = await sql`
        select
          id,
          slug,
          title,
          description,
          content,
          image_url as "imageUrl",
          category
        from initiatives
        where slug = ${slug}
        limit 1
      `;

      const initiative = initiatives[0];
      if (!initiative) {
        sendJson(res, 404, {
          success: false,
          message: "Initiative not found",
        });
        return;
      }

      sendJson(res, 200, { success: true, initiative });
      return;
    }

    if (method === "POST" && pathname === "/api/contacts") {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const name = getString(body.name);
      const email = getString(body.email);
      const message = getString(body.message);

      if (!name || !email || !message) {
        sendJson(res, 400, {
          success: false,
          message: "Invalid form data",
        });
        return;
      }

      const contacts = await sql`
        insert into contacts (name, email, message)
        values (${name}, ${email}, ${message})
        returning
          id,
          name,
          email,
          message,
          created_at as "createdAt"
      `;

      sendJson(res, 200, {
        success: true,
        contact: contacts[0],
      });
      return;
    }

    sendJson(res, 404, {
      success: false,
      message: "Not found",
    });
  } catch (error) {
    console.error("API handler error:", error);
    sendJson(res, 500, {
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
