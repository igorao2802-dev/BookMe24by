import { ROUTE_PATHS } from "../config/navigation";
import { USER_ROLES } from "../utils/constants";
import {
  getDefaultPathForRole,
  isPathAllowedForRole,
} from "../utils/roleRouting";

describe("roleRouting", () => {
  test("возвращает домашний путь по роли", () => {
    expect(getDefaultPathForRole(USER_ROLES.SPECIALIST)).toBe(
      ROUTE_PATHS.SPECIALIST_SCHEDULE,
    );
    expect(getDefaultPathForRole(USER_ROLES.ADMIN)).toBe(ROUTE_PATHS.ADMIN);
    expect(getDefaultPathForRole(USER_ROLES.CLIENT)).toBe(ROUTE_PATHS.HOME);
  });

  test("специалисту доступны только маршруты /specialist/*", () => {
    expect(
      isPathAllowedForRole(ROUTE_PATHS.SPECIALIST_SCHEDULE, USER_ROLES.SPECIALIST),
    ).toBe(true);
    expect(
      isPathAllowedForRole(ROUTE_PATHS.SPECIALIST_PROFILE, USER_ROLES.SPECIALIST),
    ).toBe(true);
    expect(isPathAllowedForRole(ROUTE_PATHS.HOME, USER_ROLES.SPECIALIST)).toBe(
      false,
    );
    expect(
      isPathAllowedForRole(ROUTE_PATHS.CATALOG, USER_ROLES.SPECIALIST),
    ).toBe(false);
    expect(isPathAllowedForRole(ROUTE_PATHS.ADMIN, USER_ROLES.SPECIALIST)).toBe(
      false,
    );
  });

  test("клиенту и админу недоступен кабинет мастера", () => {
    expect(
      isPathAllowedForRole(
        ROUTE_PATHS.SPECIALIST_SCHEDULE,
        USER_ROLES.CLIENT,
      ),
    ).toBe(false);
    expect(
      isPathAllowedForRole(
        ROUTE_PATHS.SPECIALIST_PROFILE,
        USER_ROLES.ADMIN,
      ),
    ).toBe(false);
    expect(isPathAllowedForRole(ROUTE_PATHS.HOME, USER_ROLES.CLIENT)).toBe(
      true,
    );
  });
});
