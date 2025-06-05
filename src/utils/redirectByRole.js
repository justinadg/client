import { useNavigate } from "react-router-dom";

const useRedirectByRole = () => {
  const navigate = useNavigate();

  const redirectByRole = (role) => {
    if (role === "admin") {
      navigate("/admin/dashboard");
    }

    if (role === "user") {
      navigate("/user/dashboard");
    }

    if (role === "staff") {
      navigate("/staff/dashboard");
    }
  };

  return redirectByRole;
};

export default useRedirectByRole;
