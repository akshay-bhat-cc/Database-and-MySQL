import {
  AndWhereExpression,
  BooleanOperator,
  ColumnData,
  InsertColumnSet,
  NumberOpertor,
  OrWhereExpression,
  SimpleWhereExpression,
  StringOperator,
  UpdateColumnSet,
  WhereClause,
  WhereExpression,
  WhereParamValue,
} from "./types";

export const generateWhereClauseSql = <T>(
  whereParams: WhereExpression<T>
): string => {
  const processSimpleExp = (exp: SimpleWhereExpression<T>) => {
    const whereQuery = Object.entries(exp)
      .map(([key, opts]) => {
        const columnName = `\`${key}\``;
        const paramValue: WhereParamValue = opts as WhereParamValue;
        let value = `${paramValue.value}`;
        let operator = "";
        if (paramValue.value === null) {
          if (paramValue.op === "EQUALS") {
            operator = " IS ";
          } else {
            operator = " IS NOT ";
          }
        } else {
          switch (paramValue.op) {
            case "EQUALS":
              operator = " = ";
              break;

            case "NOT_EQUALS":
              operator = " != ";
              break;

            case "STARTS_WITH":
              operator = " LIKE ";
              value = `${value}%`;
              break;

            case "NOT_STARTS_WITH":
              operator = " NOT LIKE ";
              value = `${value}%`;
              break;

            case "ENDS_WITH":
              operator = " LIKE ";
              value = `%${value}`;
              break;

            case "NOT_ENDS_WITH":
              operator = " NOT LIKE ";
              value = `%${value}`;
              break;

            case "CONTAINS":
              operator = " LIKE ";
              value = `%${value}%`;
              break;

            case "NOT_CONTAINS":
              operator = " NOT LIKE ";
              value = `%${value}%`;
              break;

            case "GREATER_THAN":
              operator = " > ";
              break;

            case "GREATER_THAN_EQUALS":
              operator = " >= ";
              break;

            case "LESSER_THAN":
              operator = " < ";
              break;

            case "LESSER_THAN_EQUALS":
              operator = " <= ";
              break;
          }
        }

        if (typeof paramValue.value === "string") {
          value = `"${value}"`;
        }
        return `${columnName} ${operator} ${value}`;
      })
      .join(" AND ");
    return whereQuery;
  };
  const whKeys = Object.keys(whereParams);

  if (whKeys.includes("AND")) {
    //it's an AndWhereExpression
    const andClause = (whereParams as AndWhereExpression<T>).AND.map((exp) =>
      generateWhereClauseSql(exp)
    )
      .filter((c) => c)
      .join(" AND ");
    return andClause ? `(${andClause})` : "";
  } else if (whKeys.includes("OR")) {
    //it's an OrWhereExpression
    const orClause = (whereParams as OrWhereExpression<T>).OR.map((exp) =>
      generateWhereClauseSql(exp)
    )
      .filter((c) => c)
      .join(" OR ");
    return orClause ? `(${orClause})` : "";
  } else {
    //it's a SimpleWhereExpression
    const simpleClause = processSimpleExp(
      whereParams as SimpleWhereExpression<T>
    );
    return simpleClause ? `(${simpleClause})` : "";
  }
};

export const generateInsertSql = <T>(
  tableName: string,
  row: InsertColumnSet<T>
): string => {
  let columns = "";
  let values = "";

  Object.entries(row).forEach(([key, value]) => {
    let insertValue: ColumnData = value as ColumnData;
    if (columns) columns += ",";
    columns += `\`${key}\``;
    if (values) values += ",";
    if (typeof insertValue === "string") {
      insertValue = `"${insertValue}"`;
    }
    values += `\`${key}\` = ${insertValue}`;
  });
  const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values})`;
  return sql;
};

const generateSelectSql = <T>(
  tableName: string,
  where: WhereExpression<T>,
  offset: number,
  limit: number
): string => {
  let sql = `SELECT * FROM \`${tableName}\``;

  const whereClause = generateWhereClauseSql(where);
  if (whereClause) {
    sql += ` WHERE ${whereClause} `;
  }

  sql += ` LIMIT ${limit} OFFSET ${offset}`;
  return sql;
};

export const generateUpdateSql = <T>(
  tableName: string,
  row: UpdateColumnSet<T>,
  where: WhereExpression<T>
): string => {
  let sql = "";
  let keyValues = "";

  Object.entries(row).forEach(([key, value]) => {
    let updateValue: ColumnData = value as ColumnData;
    if (typeof updateValue === "string") {
      updateValue = `"${updateValue}"`;
    }
    keyValues += `\`${key}\` = ${updateValue}`;
  });
  sql = `UPDATE \`${tableName}\` SET ${keyValues}`;
  if (where) {
    sql += " WHERE " + generateWhereClauseSql(where);
  }
  return sql;
};

export const generateDeleteSql = <T>(
  tableName: string,
  where: WhereExpression<T>
): string => {
  let sql = `DELETE FROM \`${tableName}\``;
  if (where) {
    sql += " WHERE " + generateWhereClauseSql(where);
  }
  return sql;
};

export const generateCountSql = <T>(
  tableName: string,
  where: WhereExpression<T>,
  columnName?: keyof T,
  columnNameAlias?: string
): string => {
  let sql = "SELECT COUNT (";

  if (columnName) {
    sql += `\`${String(columnName)}\`) `;
  } else {
    sql + "*) ";
  }

  if (columnNameAlias) {
    sql += `AS \`${columnNameAlias}\` `;
  }

  sql += `FROM  \`${tableName}\``;

  if (where) {
    sql += " WHERE " + generateWhereClauseSql<T>(where);
  }
  return sql;
};

export type Brand<K, T> = K & { __brand: T };
export type ExpressionValue = Brand<string, "Expression">;

export class Expression<T, K extends keyof T> {
  constructor(
    private readonly op1: keyof T,
    private readonly operator: T[K] extends string
      ? StringOperator
      : T[K] extends number
      ? NumberOpertor
      : BooleanOperator,
    private readonly op2: T[K]
  ) {}

  // the where sub expression of a SQL query
  get value(): ExpressionValue {
    let operator = "";
    let value = this.op2 as string;
    if (this.op2 === null) {
      if (this.operator === "EQUALS") {
        operator = "IS";
      } else {
        operator = "IS NOT";
      }
    } else {
      switch (this.operator) {
        case "EQUALS":
          operator = "=";
          break;

        case "NOT_EQUALS":
          operator = "!=";
          break;

        case "STARTS_WITH":
          operator = "LIKE";
          value = `${this.op2}%`;
          break;

        case "NOT_STARTS_WITH":
          operator = "NOT LIKE";
          value = `${this.op2}%`;
          break;

        case "ENDS_WITH":
          operator = "LIKE";
          value = `%${this.op2}`;
          break;

        case "NOT_ENDS_WITH":
          operator = "NOT LIKE";
          value = `%${this.op2}`;
          break;

        case "CONTAINS":
          operator = "LIKE";
          value = `%${this.op2}%`;
          break;

        case "NOT_CONTAINS":
          operator = "NOT LIKE";
          value = `%${this.op2}%`;
          break;

        case "GREATER_THAN":
          operator = ">";
          break;

        case "GREATER_THAN_EQUALS":
          operator = ">=";
          break;

        case "LESSER_THAN":
          operator = "<";
          break;

        case "LESSER_THAN_EQUALS":
          operator = "<=";
          break;
      }
    }
    if (typeof this.op2 === "string") {
      value = `"${value}"`;
    }
    if (!operator) {
      throw new Error(`Encountered invalid operator ${this.op2}`);
    }

    return `\`${String(this.op1)}\` ${operator} ${value}` as ExpressionValue;
  }
}

export class CompoundExpression<T> {
  constructor(
    private readonly op1: Expression<T, keyof T> | CompoundExpression<T>,
    private readonly op: "OR" | "AND",
    private readonly op2: Expression<T, keyof T> | CompoundExpression<T>
  ) {}
  get value(): ExpressionValue {
    return `(${this.op1.value} ${this.op} ${this.op2.value})` as ExpressionValue;
  }
}
