import { Entity } from ".";

/**
 * Represents a primary key data type
 */
export type id = number;

/**
 * Represents multiple key/value pairs to be used when filtering
 */
export type FindProperties = Map<string, any>;

/**
 * Maps a single row to a type T
 */
export type RowMapper<T extends Entity> = (row: any) => T;

/**
 * A simple interface for query results
 */
export interface QueryResult {
  rowCount: number;
  rows: any[];
}

/**
 * A simple wrapper for any data persistance mechanism
 */
export interface QueryClient {
  /**
   * Executes a query on the database and returns the result
   * @param queryString
   * @param args
   */
  query(queryString: string, args?: any[]): Promise<QueryResult>;
}

export class EntityNotFoundError extends Error {
  readonly entityType: string;
  readonly id: id;
  constructor(entityType: string, id: id) {
    super(`${entityType} with id ${id} was not found`);
    this.entityType = entityType;
    this.id = id;
  }
}

export interface DataMutationRequest {
  argArray: any[];
}

export type CreateRequest = DataMutationRequest;

export interface UpdateRequest extends DataMutationRequest {
  id: id;
}

export enum orderDirection {
  ASCENDING = "ASCENDING",
  DESCENDING = "DESCENDING",
}

export class Ordering {
  readonly orderByKey: string;
  readonly orderDirection: orderDirection;
  readonly sql: string;
  constructor(orderByKey: string, orderDirection: orderDirection) {
    this.orderByKey = orderByKey;
    this.orderDirection = orderDirection;
    this.sql = `ORDER BY ${this.orderByKey} ${this.orderDirection}`;
  }
}
