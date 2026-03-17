import { createHmac, timingSafeEqual } from "crypto";
import postgres from "postgres";

type RequestLike = {
  method?: string;
  url?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string | string[]) => void;
};

type LoginBody = {
  username?: string;
  password?: string;
};

type HistoryBody = {
  title?: string;
  summary?: string;
  content?: string;
  eventDate?: string;
  thumbnailUrl?: string;
  linkUrl?: string;
  isPublished?: boolean | string;
  sortOrder?: number | string;
};

const ADMIN_COOKIE_NAME = "cordia_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24;

let sqlClient: ReturnType<typeof postgres> | null = null;
let historySchemaReady = false;

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

async function ensureHistorySchema(sql: ReturnType<typeof postgres>) {
  if (historySchemaReady) {
    return;
  }

  await sql`
    create table if not exists history_posts (
      id varchar primary key default gen_random_uuid(),
      title text not null,
      summary text not null,
      content text not null,
      event_date timestamp not null,
      thumbnail_url text,
      link_url text,
      is_published boolean default true not null,
      sort_order integer default 0 not null,
      created_at timestamp default now() not null,
      updated_at timestamp default now() not null
    )
  `;

  const existing = await sql`
    select count(*)::int as total
    from history_posts
  `;

  if ((existing[0]?.total ?? 0) === 0) {
    await sql`
      insert into history_posts (
        title,
        summary,
        content,
        event_date,
        thumbnail_url,
        link_url,
        is_published,
        sort_order
      )
      values
        (
          'CordiaEC launched cross-border collaboration program',
          'The team formalized its first international collaboration roadmap with partner institutions in Korea and overseas.',
          'CordiaEC officially launched a cross-border collaboration program to connect researchers, startups, and public-sector partners. The initiative established the operating framework for future exchanges, pilot projects, and publication support.',
          ${new Date("2023-09-05")},
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
          'https://cordia-ec.vercel.app/about',
          true,
          1
        ),
        (
          'Global startup roundtable held in Incheon',
          'CordiaEC hosted a roundtable focused on market entry strategy, diaspora networks, and funding access.',
          'The roundtable brought together startup founders, investors, and academic partners to discuss practical market-entry strategy. Sessions covered ecosystem mapping, international founder support, and follow-up partnership opportunities for early-stage teams.',
          ${new Date("2024-01-18")},
          'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
          'https://cordia-ec.vercel.app/initiatives',
          true,
          2
        ),
        (
          '2024 K-Beauty strategy briefing published',
          'A new briefing summarized market signals, branding recommendations, and partnership opportunities for K-Beauty firms.',
          'CordiaEC published a strategy briefing covering regional demand shifts, channel trends, and partnership opportunities for K-Beauty brands. The report was designed as a practical guide for companies preparing for cross-border expansion.',
          ${new Date("2024-03-10")},
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
          'https://cordia-ec.vercel.app/news',
          true,
          3
        )
    `;
  }

  historySchemaReady = true;
}

function sendJson(res: ResponseLike, status: number, body: unknown, headers?: string[]) {
  if (res.setHeader) {
    res.setHeader("Content-Type", "application/json");
    if (headers?.length) {
      res.setHeader("Set-Cookie", headers);
    }
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

function getBody<T>(body: unknown): T {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as T;
    } catch {
      return {} as T;
    }
  }

  if (body && typeof body === "object") {
    return body as T;
  }

  return {} as T;
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true" || value === "on" || value === "1";
  }

  return false;
}

function parseInteger(value: unknown, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseCookies(req: RequestLike) {
  const cookieHeader = req.headers?.cookie;
  const headerValue = Array.isArray(cookieHeader) ? cookieHeader.join(";") : cookieHeader ?? "";

  return headerValue.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) {
      return acc;
    }
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  return {
    username,
    password,
    secret,
    configured: Boolean(username && password && secret),
  };
}

function signSession(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function createSessionToken(username: string, secret: string) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${username}:${expiresAt}`;
  const signature = signSession(payload, secret);
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

function verifySessionToken(token: string | undefined, expectedUsername: string, secret: string) {
  if (!token) {
    return false;
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [username, expiresAt, signature] = decoded.split(":");

    if (!username || !expiresAt || !signature || username !== expectedUsername) {
      return false;
    }

    if (Date.now() > Number(expiresAt)) {
      return false;
    }

    const payload = `${username}:${expiresAt}`;
    const expectedSignature = signSession(payload, secret);

    return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

function createSessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax${secure}`;
}

function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

function requireAdmin(req: RequestLike) {
  const config = getAdminConfig();
  if (!config.configured || !config.username || !config.secret) {
    return {
      ok: false,
      status: 500,
      body: {
        success: false,
        message: "Admin authentication is not configured.",
      },
    };
  }

  const cookies = parseCookies(req);
  const token = cookies[ADMIN_COOKIE_NAME];
  const authenticated = verifySessionToken(token, config.username, config.secret);

  if (!authenticated) {
    return {
      ok: false,
      status: 401,
      body: {
        success: false,
        message: "Unauthorized",
      },
    };
  }

  return {
    ok: true,
    username: config.username,
  };
}

function validateHistoryPayload(body: HistoryBody) {
  const title = getString(body.title);
  const summary = getString(body.summary);
  const content = getString(body.content);
  const eventDate = getString(body.eventDate);
  const thumbnailUrl = getString(body.thumbnailUrl) || null;
  const linkUrl = getString(body.linkUrl) || null;
  const isPublished = parseBoolean(body.isPublished);
  const sortOrder = parseInteger(body.sortOrder, 0);

  if (!title || !summary || !content || !eventDate) {
    throw new Error("title, summary, content, and eventDate are required.");
  }

  const parsedDate = new Date(eventDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("eventDate must be a valid date.");
  }

  return {
    title,
    summary,
    content,
    eventDate: parsedDate,
    thumbnailUrl,
    linkUrl,
    isPublished,
    sortOrder,
  };
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

    if (method === "GET" && pathname === "/api/history") {
      await ensureHistorySchema(sql);
      const { page, limit } = parsePagination(url);
      const offset = (page - 1) * limit;

      const posts = await sql`
        select
          id,
          title,
          summary,
          content,
          event_date as "eventDate",
          thumbnail_url as "thumbnailUrl",
          link_url as "linkUrl",
          is_published as "isPublished",
          sort_order as "sortOrder",
          created_at as "createdAt",
          updated_at as "updatedAt"
        from history_posts
        where is_published = true
        order by sort_order asc, event_date desc
        limit ${limit}
        offset ${offset}
      `;

      const totalResult = await sql`
        select count(*)::int as total
        from history_posts
        where is_published = true
      `;

      sendJson(res, 200, {
        posts,
        total: totalResult[0]?.total ?? 0,
      });
      return;
    }

    if (method === "GET" && pathname.startsWith("/api/history/")) {
      await ensureHistorySchema(sql);
      const id = pathname.replace("/api/history/", "");
      const posts = await sql`
        select
          id,
          title,
          summary,
          content,
          event_date as "eventDate",
          thumbnail_url as "thumbnailUrl",
          link_url as "linkUrl",
          is_published as "isPublished",
          sort_order as "sortOrder",
          created_at as "createdAt",
          updated_at as "updatedAt"
        from history_posts
        where id = ${id}
          and is_published = true
        limit 1
      `;

      const post = posts[0];
      if (!post) {
        sendJson(res, 404, {
          success: false,
          message: "History post not found",
        });
        return;
      }

      sendJson(res, 200, { success: true, post });
      return;
    }

    if (method === "POST" && pathname === "/api/contacts") {
      const body = getBody<Record<string, unknown>>(req.body);
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

    if (pathname === "/api/admin/session" && method === "GET") {
      const config = getAdminConfig();
      if (!config.configured || !config.username || !config.secret) {
        sendJson(res, 200, {
          authenticated: false,
          configured: false,
        });
        return;
      }

      const cookies = parseCookies(req);
      const authenticated = verifySessionToken(cookies[ADMIN_COOKIE_NAME], config.username, config.secret);

      sendJson(res, 200, {
        authenticated,
        configured: true,
        username: authenticated ? config.username : null,
      });
      return;
    }

    if (pathname === "/api/admin/login" && method === "POST") {
      const config = getAdminConfig();
      if (!config.configured || !config.username || !config.password || !config.secret) {
        sendJson(res, 500, {
          success: false,
          message: "Admin authentication is not configured.",
        });
        return;
      }

      const body = getBody<LoginBody>(req.body);
      const username = getString(body.username);
      const password = getString(body.password);

      if (username !== config.username || password !== config.password) {
        sendJson(res, 401, {
          success: false,
          message: "Invalid admin credentials.",
        });
        return;
      }

      const token = createSessionToken(config.username, config.secret);
      sendJson(
        res,
        200,
        {
          success: true,
          username: config.username,
        },
        [createSessionCookie(token)],
      );
      return;
    }

    if (pathname === "/api/admin/logout" && method === "POST") {
      sendJson(
        res,
        200,
        {
          success: true,
        },
        [clearSessionCookie()],
      );
      return;
    }

    if (pathname === "/api/admin/history" && method === "GET") {
      await ensureHistorySchema(sql);
      const auth = requireAdmin(req);
      if (!auth.ok) {
        sendJson(res, auth.status, auth.body);
        return;
      }

      const posts = await sql`
        select
          id,
          title,
          summary,
          content,
          event_date as "eventDate",
          thumbnail_url as "thumbnailUrl",
          link_url as "linkUrl",
          is_published as "isPublished",
          sort_order as "sortOrder",
          created_at as "createdAt",
          updated_at as "updatedAt"
        from history_posts
        order by sort_order asc, event_date desc
      `;

      sendJson(res, 200, {
        success: true,
        posts,
      });
      return;
    }

    if (pathname === "/api/admin/history" && method === "POST") {
      await ensureHistorySchema(sql);
      const auth = requireAdmin(req);
      if (!auth.ok) {
        sendJson(res, auth.status, auth.body);
        return;
      }

      const body = getBody<HistoryBody>(req.body);
      const payload = validateHistoryPayload(body);

      const result = await sql`
        insert into history_posts (
          title,
          summary,
          content,
          event_date,
          thumbnail_url,
          link_url,
          is_published,
          sort_order
        )
        values (
          ${payload.title},
          ${payload.summary},
          ${payload.content},
          ${payload.eventDate},
          ${payload.thumbnailUrl},
          ${payload.linkUrl},
          ${payload.isPublished},
          ${payload.sortOrder}
        )
        returning
          id,
          title,
          summary,
          content,
          event_date as "eventDate",
          thumbnail_url as "thumbnailUrl",
          link_url as "linkUrl",
          is_published as "isPublished",
          sort_order as "sortOrder",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;

      sendJson(res, 200, {
        success: true,
        post: result[0],
      });
      return;
    }

    if (pathname.startsWith("/api/admin/history/") && (method === "PATCH" || method === "PUT")) {
      await ensureHistorySchema(sql);
      const auth = requireAdmin(req);
      if (!auth.ok) {
        sendJson(res, auth.status, auth.body);
        return;
      }

      const id = pathname.replace("/api/admin/history/", "");
      const body = getBody<HistoryBody>(req.body);
      const payload = validateHistoryPayload(body);

      const result = await sql`
        update history_posts
        set
          title = ${payload.title},
          summary = ${payload.summary},
          content = ${payload.content},
          event_date = ${payload.eventDate},
          thumbnail_url = ${payload.thumbnailUrl},
          link_url = ${payload.linkUrl},
          is_published = ${payload.isPublished},
          sort_order = ${payload.sortOrder},
          updated_at = now()
        where id = ${id}
        returning
          id,
          title,
          summary,
          content,
          event_date as "eventDate",
          thumbnail_url as "thumbnailUrl",
          link_url as "linkUrl",
          is_published as "isPublished",
          sort_order as "sortOrder",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;

      const post = result[0];
      if (!post) {
        sendJson(res, 404, {
          success: false,
          message: "History post not found",
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
        post,
      });
      return;
    }

    if (pathname.startsWith("/api/admin/history/") && method === "DELETE") {
      await ensureHistorySchema(sql);
      const auth = requireAdmin(req);
      if (!auth.ok) {
        sendJson(res, auth.status, auth.body);
        return;
      }

      const id = pathname.replace("/api/admin/history/", "");
      const result = await sql`
        delete from history_posts
        where id = ${id}
        returning id
      `;

      if (!result[0]) {
        sendJson(res, 404, {
          success: false,
          message: "History post not found",
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
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
