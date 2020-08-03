import { PagniationParams } from "./pagination";

/**
 * A simple wrapper for any data persistance mechanism
 */
export interface Database {
  /**
   * Initializes a connection.
   */
  connect(): Promise<void>;

  /**
   * Destroys and cleans up any connections. The Database cannot be resused after this call.
   */
  disconnect(): Promise<void>;

  /**
   * Executes a query on the database and returns the result
   * @param queryString
   * @param args
   */
  query(queryString: string, args?: any[]): Promise<any>;
}

// For primary keys
export type id = number;

/**
 * Represents any entity that can be serialized and retrieved by id
 */
export interface Entity {
  id: id;
}

export type FindProperties = Map<string, any>;

/**
 * This interface provides retrieval for entities.
 */
export interface ReadOnlyEntity<T extends Entity> {
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

export interface CRUDEntity<T extends Entity, C, U> extends ReadOnlyEntity<T> {
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

export class EntityNotFoundError extends Error {
  readonly entityType: string;
  readonly id: id;
  constructor(entityType: string, id: id) {
    super(`${entityType} with id ${id} was not found`);
    this.entityType = entityType;
    this.id = id;
  }
}
