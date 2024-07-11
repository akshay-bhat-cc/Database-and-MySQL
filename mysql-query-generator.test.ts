import {
  CompoundExpression,
  Expression,
  generateCountSql,
  generateDeleteSql,
  generateInsertSql,
  generateUpdateSql,
  generateWhereClauseSql,
} from "./mysql-query-generator";
import {
  AndWhereExpression,
  InsertColumnSet,
  OrWhereExpression,
  StringOperator,
  UpdateColumnSet,
  WhereClause,
} from "./types";

interface Book {
  id: number;
  title: string;
  author: string;
  isbnNum: number;
  publisher: string;
}

interface IMemberBase {
  firstName: string;
  lastName: string;
  dob: string;
  address: string;
  contactNo: string;
  email: string;
}
interface IMember extends IMemberBase {
  id: number;
}
describe("QUERY GENERATOR TESTS", () => {
  test("WHERE CLAUSE TEST", () => {
    const titleANDauthor: AndWhereExpression<Partial<Book>> = {
      AND: [
        {
          title: {
            op: "EQUALS",
            value: "KALKI AD2968",
          },
        },
        {
          author: {
            op: "NOT_EQUALS",
            value: "Rajmouli",
          },
        },
      ],
    };

    const ORisbnNUM: OrWhereExpression<Partial<Book>> = {
      OR: [
        {
          isbnNum: {
            op: "EQUALS",
            value: 1234567890987,
          },
        },
      ],
    };

    const where_query =
      "WHERE " +
      generateWhereClauseSql<Partial<Book>>({
        AND: [titleANDauthor],
        OR: [ORisbnNUM],
      });
    console.log(where_query);
  });

  test("INSERT QUERY TESTS", () => {
    const row: InsertColumnSet<Book> = {
      title: "Karvalo",
      author: "KPP",
      isbnNum: 1,
      publisher: "Penguine",
    };
    const insert = generateInsertSql("Book", row);
    console.log(insert);
  });

  test("UPDATE QUERY TEST", () => {
    const row: UpdateColumnSet<Book> = {
      title: "Jai Hind",
    };
    const email: WhereClause<Book> = {
      publisher: {
        op: "EQUALS",
        value: "Penguine",
      },
    };

    const query = generateUpdateSql<Partial<Book>>("Book", row, email);
    console.log(query);
  });

  test("DELETE QUERY TEST", () => {
    const where: WhereClause<Book> = {
      title: {
        value: "KARVALO",
        op: "NOT_EQUALS",
      },
      author: {
        value: "KUVEMPU",
        op: "CONTAINS",
      },
    };
    const deleteQuery = generateDeleteSql("Books", where);
    console.log(deleteQuery);
  });

  test("COUNT QUERY TESTS", () => {
    const wherePublisher: WhereClause<Book> = {
      publisher: {
        op: "EQUALS",
        value: "Penguine",
      },
    };
    const query = generateCountSql<Partial<Book>>(
      "Books",
      wherePublisher,
      "author",
      "count of penguine authors"
    );

    console.log(query);
  });

  test("MEMBER TESTS", () => {
    const generated = generateWhereClauseSql<Partial<IMember>>({
      OR: [
        {
          AND: [
            {
              OR: [
                {
                  firstName: {
                    op: "STARTS_WITH" as StringOperator,
                    value: "Krish",
                  },
                },
                {
                  lastName: {
                    op: "EQUALS" as StringOperator,
                    value: "Dey",
                  },
                },
              ],
            },
            {
              address: {
                op: "CONTAINS",
                value: "West Bengal",
              },
              contactNo: {
                op: "NOT_CONTAINS",
                value: "100",
              },
            },
          ],
        },
      ],
    });

    console.log(generated);
  });

  interface User {
    name: string;
    email: string;
    dob: number;
    country: string;
    phone?: string | null;
  }

  test("test expressions", () => {
    // `name` = "shripada"
    // const exp1 = new Expression<User>('name', 'EQUALS', 'shripada');
    const exp1 = new Expression<User, "name">("name", "EQUALS", "shripada");

    console.log(exp1.value);
    expect(exp1.value).toEqual('`name` = "shripada"');

    // `email` = "shripada@codecraft.co.in"'
    const exp2 = new Expression<User, "email">(
      "email",
      "EQUALS",
      "shripada@codecraft.co.in"
    );
    console.log(exp2.value);
    expect(exp2.value).toEqual('`email` = "shripada@codecraft.co.in"');

    //(`name` = "shripada" OR `email` = "shripada@codecraft.co.in"
    const nameOrEmail = new CompoundExpression<User>(exp1, "OR", exp2);
    console.log(nameOrEmail.value);
    expect(nameOrEmail.value).toBe(
      '(`name` = "shripada" OR `email` = "shripada@codecraft.co.in")'
    );

    // ((`name` = "shripada" OR `email` = "shripada@codecraft.co.in") AND `dob` = "1980-3-21")
    const nameOrEmailAndDOB = new CompoundExpression<User>(
      nameOrEmail,
      "AND",
      new Expression("dob", "EQUALS", "1980-3-21")
    );
    console.log(nameOrEmailAndDOB.value);

    const country = new Expression<User, "country">(
      "country",
      "CONTAINS",
      "India"
    );

    const nameOrEmailAndDOBAndCountry = new CompoundExpression(
      nameOrEmailAndDOB,
      "AND",
      country
    );
    console.log(nameOrEmailAndDOBAndCountry.value);

    // phone IS NULL
    const phoneIsNULL = new Expression<User, "phone">("phone", "EQUALS", null);
    console.log(phoneIsNULL.value);
  });

  test("WHERE MEMBER", () => {
    const countryContainsIndia = new Expression<User, "country">(
      "country",
      "CONTAINS",
      "India"
    );

    console.log(countryContainsIndia);
  });
});
