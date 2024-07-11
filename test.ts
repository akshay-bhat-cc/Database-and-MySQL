import "dotenv/config";
import mysql from "mysql2/promise";

export interface IMoviesBoolean {
  id?: boolean;
  title?: boolean;
  release_year?: boolean;
  director?: boolean;
  rating?: boolean;
  [key: string]: boolean | undefined;
}

export interface IMovies {
  title?: string;
  release_year?: string;
  director?: string;
  rating?: number;
  [key: string]: string | number | undefined;
}

type Value = string | number;
type Operator = "<=" | ">=" | "<" | ">";
type Keyword = "AND" | "OR";

export interface IMoviesUpdate {
  title?: { value: Value; op?: Operator; keyword: Keyword };
  release_year?: { value: Value; op?: Operator; keyword: Keyword };
  director?: { value: Value; op?: Operator; keyword: Keyword };
  rating?: { value: Value; op?: Operator; keyword: Keyword };
  [key: string]: { value: Value; op?: Operator; keyword: Keyword } | undefined;
}

function consoleDir(params: any) {
  console.dir(params, {
    showHidden: false,
    depth: null,
    colors: true,
  });
}

const tableName = "`movies`";

export function getSelectQuery(params?: IMoviesBoolean) {
  if (params === undefined) {
    return `SELECT * FROM  ${tableName}`;
  }
  let query = "SELECT ";
  for (const key in params) {
    if (params[key]) {
      query += key;
      query += ",";
    }
  }
  query = query.slice(0, -1);
  query += ` FROM ${tableName}`;

  return query;
}

export function getInsertQuery(params: IMovies) {
  const { title, release_year, director, rating } = params;
  const query = `INSERT INTO ${tableName} (title, release_year, director, rating) VALUES ("${title}", "${release_year}", "${director}", ${rating})`;

  return query;
}

export function getCountQuery() {
  const query = `
    SELECT COUNT(*) AS \`count\` FROM ${tableName}
`;
  return query;
}

export function getUpdateQuery(
  params: IMovies,
  checkParams: IMoviesUpdate,
  where?: boolean
) {
  let query = `UPDATE ${tableName} SET `;
  for (const key in params) {
    if (params[key]) {
      query += `${key} = \"${params[key]}\"`;
    }
  }
  if (where) {
    query += " WHERE ";
    if (checkParams) {
      for (const key in checkParams) {
        if (checkParams[key]) {
          query += `${key} ${checkParams[key].op ?? "="}  \"${
            checkParams[key].value
          }\" ${checkParams[key].keyword}`;
        }
      }
      query = query.slice(0, -3);
    }

    // if (orParams) {
    //   for (const key in orParams) {
    //     if (orParams[key]) {
    //       query += `OR ${key} ${orParams[key].op ?? "="} \"${
    //         orParams[key].value
    //       }\"`;
    //     }
    //   }
    // }
  }
  return query;
}

export function getDeleteQuery(
  andParams: IMoviesUpdate,
  orParams: IMoviesUpdate,
  where: boolean
) {
  let query = `DELETE FROM ${tableName}`;
  if (where) {
    query += " WHERE ";
    if (andParams) {
      for (const key in andParams) {
        if (andParams[key]) {
          query += ` ${key} ${andParams[key].op ?? "="} \"${
            andParams[key].value
          }\" AND`;
        }
      }
      query = query.slice(0, -3);
    }
    if (orParams) {
      for (const key in orParams) {
        if (orParams[key]) {
          query += ` OR ${key}  ${orParams[key].op ?? "="} \"${
            orParams[key].value
          }\"`;
        }
      }
    }
  }

  return query;
}

async function runQuery(
  connection: mysql.PoolConnection,
  label: string,
  sql: string
) {
  try {
    console.log(`---${label.toUpperCase()} RESULT---`);
    const [result] = await connection.query(sql);
    consoleDir(result);
    console.log("\n\n\n");
  } catch (err) {
    consoleDir(err);
  }
}

async function main() {
  try {
    const pool = mysql.createPool(process.env.DATABASE_URL!);
    const connection = await pool.getConnection();

    // moviesData.movies.map(async (movie: IMovies) => {
    //   const insertquery = getInsertQuery(movie);
    //   await runQuery(connection, "SELECT", insertquery);
    // });

    const selectQuery = getSelectQuery({
      title: true,
      director: true,
      release_year: true,
    });

    await runQuery(
      connection,
      "SELECT Title, Director, release_year",
      selectQuery
    );
    await runQuery(connection, "SELECT ALL", getSelectQuery());

    const countQuery = getCountQuery();
    await runQuery(connection, "COUNT", countQuery);

    const updateQuery = getUpdateQuery(
      {
        title: "KALKI",
      },
      {
        title: { value: "Inception", keyword: "AND" },
        release_year: { value: "1994", keyword: "OR" },
      },
      true
    );

    await runQuery(connection, "UPDATE", updateQuery);

    // const deleteQuery = getDeleteQuery(
    //   {
    //     title: { value: "KALKI" },
    //     release_year: { value: "2020" },
    //   },
    //   { title: { value: "KALKI" }, release_year: { value: "2019" } },
    //   true
    // );
    // console.log(deleteQuery);

    // await runQuery(connection, "DELETE", deleteQuery);

    pool.end();
  } catch (err) {
    consoleDir(err);
  }
}

main();

export const moviesData = {
  movies: [
    {
      title: "Avengers: Endgame",
      release_year: "2019",
      director: "Anthony Russo, Joe Russo",
      rating: 4.5,
    },
    {
      title: "Inception",
      release_year: "2010",
      director: "Christopher Nolan",
      rating: 4.8,
    },
    {
      title: "The Shawshank Redemption",
      release_year: "1994",
      director: "Frank Darabont",
      rating: 4.7,
    },
    {
      title: "Pulp Fiction",
      release_year: "1994",
      director: "Quentin Tarantino",
      rating: 4.6,
    },
    {
      title: "The Dark Knight",
      release_year: "2008",
      director: "Christopher Nolan",
      rating: 4.7,
    },
    {
      title: "Interstellar",
      release_year: "2014",
      director: "Christopher Nolan",
      rating: 4.6,
    },
    {
      title: "Forrest Gump",
      release_year: "1994",
      director: "Robert Zemeckis",
      rating: 4.5,
    },
    {
      title: "The Matrix",
      release_year: "1999",
      director: "The Wachowskis",
      rating: 4.5,
    },
    {
      title: "Schindler's List",
      release_year: "1993",
      director: "Steven Spielberg",
      rating: 4.8,
    },
    {
      title: "The Godfather",
      release_year: "1972",
      director: "Francis Ford Coppola",
      rating: 4.8,
    },
  ],
};
