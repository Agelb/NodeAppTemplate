import {
  QueryResult,
  FindProperties,
  QueryClient,
  EntityNotFoundError,
  Ordering,
  RowMapper,
} from "./db";
import { PagniationParams, id, Entity } from "..";

export interface SelectConfig<T extends Entity> {
  /**
   * Used in "WHERE ${idFilterKey} = X" clauses
   */
  idFilterKey: string;

  /**
   * Ordering information to be used on select queries
   */
  ordering: Ordering;

  /**
   * The base select statement query, including any joins
   */
  baseSelectQuery: string;

  /**
   * Mapper to transform a single row into a single T
   */
  rowMapper: RowMapper<T>;

  /**
   * Pretty label to use in log messagse and displays
   */
  entityLabel: string;
}

/**
 * Provides functionality to handle retrieving data from a relational db
 */
export class SelectHandler<T extends Entity> {
  private readonly database: QueryClient;
  private readonly selectConfig: SelectConfig<T>;
  private readonly idSelectorQuery: string;
  constructor(database: QueryClient, selectConfig: SelectConfig<T>) {
    this.database = database;
    this.selectConfig = selectConfig;
    this.idSelectorQuery = `${this.selectConfig.baseSelectQuery} 
    WHERE ${this.selectConfig.idFilterKey} = $1
    ORDER BY ${this.selectConfig.ordering.sql}`;
  }

  protected mapRowsToEntities(rows: any[]): T[] {
    return rows.map(this.selectConfig.rowMapper);
  }

  /**
   * Returns all entities in the dao. If pagination is provided, uses LIMIT/OFFSET to paginate results.
   * Note that LIMIT/OFFSET has implications of consistency and performance tradeoffs, and does not
   * guarantee duplicates will not be in the results.
   * @param pagination
   */
  getAll(pagination?: PagniationParams | undefined): Promise<T[]> {
    let queryString = `${this.selectConfig.baseSelectQuery} ${this.selectConfig.ordering.sql}`;
    if (pagination) {
      queryString = this.addPagination(queryString, pagination);
    }

    return this.database.query(queryString).then((result: QueryResult) => {
      return this.mapRowsToEntities(result.rows);
    });
  }

  /**
   * Returns a single record with the id. Throws an EntityNotFound error if not found
   * @param id
   */
  getById(id: id): Promise<T> {
    return this.database
      .query(this.idSelectorQuery, [id])
      .then((result: QueryResult) => {
        if (result.rowCount == 0) {
          throw new EntityNotFoundError(this.selectConfig.entityLabel, id);
        }
        return this.selectConfig.rowMapper(result.rows[0]);
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async exists(id: id): Promise<boolean> {
    const result = await this.database.query(this.idSelectorQuery, [id]);
    return result.rowCount === 1;
  }

  find(
    properties: FindProperties,
    pagination?: PagniationParams | undefined
  ): Promise<T[]> {
    const filterClauses = Object.keys(properties).map(
      (key: string, idx: number) => {
        return this.buildFilterClause(key, idx);
      }
    );

    const filter = `WHERE ${filterClauses.join(" AND ")}`;
    let query = `${this.selectConfig.baseSelectQuery} ${filter} ${this.selectConfig.ordering.sql}`;
    if (pagination) {
      query = this.addPagination(query, pagination);
    }

    return this.database
      .query(query, Object.values(properties))
      .then((result: QueryResult) => {
        return this.mapRowsToEntities(result.rows);
      });
  }

  private buildFilterClause(key: string, idx: number): string {
    return `${key} = $${idx} `;
  }

  private addPagination(query: string, pagination: PagniationParams): string {
    return `${query} LIMIT ${pagination.pageSize} 
    OFFSET ${pagination.pageSize * pagination.pageNum}`;
  }
}
