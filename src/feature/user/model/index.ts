import { Entity } from "../../../service";
import {
  QueryConfiguration,
  orderDirection,
  Ordering,
  RowMapper,
} from "../../../service/database/db";

export interface User extends Entity {
  username: string;
  email: string;
}

const userRowMapper: RowMapper<User> = (row: any) => {
  return {
    username: row.username,
    email: row.email,
    id: row.id,
  };
};

const UserQueryConfig: QueryConfiguration = {
  idFilterKey: "id",
  ordering: new Ordering("id", orderDirection.ASCENDING),
  baseSelectQuery: "SELECT * FROM User",
};
