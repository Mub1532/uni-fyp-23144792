export type userInfo = {
  username: string;
  password: string;
  email: string;
  id: number;
};

export type loginUser = {
  loggedIn: boolean;
  user?: userInfo;
};

export type userContext = {
  user?: userInfo;
  loading: boolean;
};

export enum USER_CODES {
  CREATED_SUCCESSFULLY,
  FAILED_CREATION,
  USER_EXISTS,
  USER_DOESNT_EXIST,
  LOGGED_IN,
  LOGGED_OUT,
  WRONG_PASSWORD,
  INFO_NOT_ENTERED,
  NOT_LOGGED_IN,
  SAVE_SUCCESS,
  SAVE_FAIL,
}
