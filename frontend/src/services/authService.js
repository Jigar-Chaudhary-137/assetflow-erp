import api from "./api";

const mapRoleToFrontend = (role) => {
  const map = {
    ADMIN: "Admin",
    ASSET_MANAGER: "Asset Manager",
    DEPARTMENT_HEAD: "Department Head",
    EMPLOYEE: "Employee",
  };
  return map[role] || role;
};

export const authService = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, accessToken, refreshToken } = res.data.data;

    // Normalize role for frontend check
    if (user && user.role) {
      user.role = mapRoleToFrontend(user.role);
    }

    localStorage.setItem("assetflow_token", accessToken);
    localStorage.setItem("assetflow_refresh_token", refreshToken);
    localStorage.setItem("assetflow_user", JSON.stringify(user));
    return { token: accessToken, user };
  },

  getCurrentUser: async () => {
    const res = await api.get("/auth/me");
    const user = res.data.data;

    // Normalize role for frontend check
    if (user && user.role) {
      user.role = mapRoleToFrontend(user.role);
    }
    return user;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("assetflow_refresh_token");
      await api.post("/auth/logout", { refreshToken });
    } catch (err) {
      // ignore logout failures
    }
    localStorage.removeItem("assetflow_token");
    localStorage.removeItem("assetflow_refresh_token");
    localStorage.removeItem("assetflow_user");
    return true;
  },
};
