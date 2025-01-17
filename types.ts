export type ColumnData = string | number | boolean | null;
export type InsertColumnSet<T> = Omit<T, "id">;
export type UpdateColumnSet<T> = Partial<InsertColumnSet<T>>;

export type StringOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "STARTS_WITH"
  | "NOT_STARTS_WITH"
  | "ENDS_WITH"
  | "NOT_ENDS_WITH"
  | "CONTAINS"
  | "NOT_CONTAINS";

export type NumberOpertor =
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "GREATER_THAN_EQUALS"
  | "LESSER_THAN"
  | "LESSER_THAN_EQUALS";

export type BooleanOperator = "EQUALS" | "NOT_EQUALS";

export type StringOperatorParam = {
  op: StringOperator;
  value: string | null;
};

export type NumberOpertorParam = {
  op: NumberOpertor;
  value: number | null;
};

export type BooleanOperatorParam = {
  op: BooleanOperator;
  value: boolean | null;
};
export type PageOption = {
  offset?: number;
  limit?: number;
};

export type WhereParamValue =
  | StringOperatorParam
  | NumberOpertorParam
  | BooleanOperatorParam;

export type WhereClause<CompleteModel> = {
  [k in keyof Partial<CompleteModel>]: CompleteModel[k] extends number
    ? NumberOpertorParam
    : CompleteModel[k] extends string
    ? StringOperatorParam
    : BooleanOperator;
};

export type WhereExpression<CompleteModel> =
  | SimpleWhereExpression<CompleteModel>
  | OrWhereExpression<CompleteModel>
  | AndWhereExpression<CompleteModel>;

export type SimpleWhereExpression<CompleteModel> = {
  [key in keyof CompleteModel]: WhereParamValue;
};

export type OrWhereExpression<CompleteModel> = {
  OR: WhereExpression<CompleteModel>[];
};

export type AndWhereExpression<CompleteModel> = {
  AND: WhereExpression<CompleteModel>[];
};
