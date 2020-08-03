import { PagniationParams } from "..";
import { Entity, FindProperties, id } from ".";
import {
  QueryClient,
  CreateRequest,
  UpdateRequest,
  QueryResult,
  Ordering,
  QueryConfiguration,
} from "./db";

export interface ReadOnlyDao<T extends Entity> {
  /**
   * Returns all entitie. If pagination is provided, the entities fitting within that page are returned.
   * If no entities fit within the page parameters, and empty array is returned.
   * @param pagination
   */
  getAll(pagination?: PagniationParams): Promise<T[]>;

  /**
   * Returns the entity with the provided id. If no entity is found, throws an EntityNotFoundError.
   * @param id
   */
  getById(id: id): Promise<T>;

  /**
   * Returns true if an entity exists with the provided id.
   * @param id
   */
  exists(id: id): Promise<boolean>;

  /**
   * Returns all entities matching the provided parms.
   * @param properties
   * @param pagination
   */
  find(properties: FindProperties, pagination?: PagniationParams): Promise<T[]>;
}

/**
 * Provides create, update, and delete functionality.
 * T - entity type
 * C - create request
 * u - update request
 */
export interface CRUDDao<
  T extends Entity,
  C extends CreateRequest,
  U extends UpdateRequest
> extends ReadOnlyDao<T> {
  /**
   * Creates a new entity, and returns the created entity.
   * @param createRequest
   */
  create(createRequest: C): Promise<T>;

  /**
   * Updates an existing entity, and returns the updated entity.
   * @param updateRequest
   */
  update(updateRequest: U): Promise<T>;

  /**
   * Deletes the entity with the provided id, and returns a boolean indicating success or failure.
   * @param id
   */
  delete(id: id): Promise<boolean>;
}

export class Dao<
  T extends Entity,
  C extends CreateRequest,
  U extends UpdateRequest
> implements CRUDDao<T, C, U> {
  private readonly database: QueryClient;
  private readonly queryConfig: QueryConfiguration;
  private readonly rowMapper: (row: any) => T;

  constructor(
    database: QueryClient,
    queryConfig: QueryConfiguration,
    rowMapper: (row: any) => T
  ) {
    this.database = database;
    this.queryConfig = queryConfig;
    this.rowMapper = rowMapper;
  }

  protected mapRowsToEntities(rows: any[]): T[] {
    return rows.map(this.rowMapper);
  }

  protected abstract parseCreateRequest(createRequest: C): string;
  protected abstract parseCreateResult(result: QueryResult): T;
  protected abstract parseUpdateRequest(updateRequest: U): string;
  protected abstract parseUpdateResult(result: QueryResult): T;

  async create(createRequest: C): Promise<T> {
    const createResult = await this.database.query(
      this.parseCreateRequest(createRequest),
      createRequest.argArray
    );

    return this.parseCreateResult(createResult);
  }

  async update(updateRequest: U): Promise<T> {
    const updateResult = await this.database.query(
      this.parseUpdateRequest(updateRequest),
      updateRequest.argArray
    );

    return this.parseUpdateResult(updateResult);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.database.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount == 1;
  }
}
